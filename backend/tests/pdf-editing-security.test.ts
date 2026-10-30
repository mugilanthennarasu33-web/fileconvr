import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import sharp from 'sharp';
import { app } from '../src/app.js';
import { ensureStorageDirectories } from '../src/utils/storage.js';

describe('PDF Editing and Security Endpoints (Milestone 3)', () => {
  const testDir = path.resolve('./storage/test-fixtures-m3');
  let sample3PagePdfPath: string;
  let sampleWatermarkImgPath: string;
  let invalidPdfPath: string;

  beforeAll(async () => {
    await ensureStorageDirectories();
    await fs.mkdir(testDir, { recursive: true });

    // 1. Create a 3-page test PDF with distinct page labels
    const doc = await PDFDocument.create();
    for (let i = 1; i <= 3; i++) {
      const page = doc.addPage([595, 842]);
      page.drawText(`Original Page Number ${i}`, {
        x: 50,
        y: 750,
        size: 24,
        color: rgb(0.1, 0.2, 0.8),
      });
    }
    const pdfBytes = await doc.save();
    sample3PagePdfPath = path.join(testDir, 'test-3pages.pdf');
    await fs.writeFile(sample3PagePdfPath, pdfBytes);

    // 2. Create a transparent PNG watermark image
    sampleWatermarkImgPath = path.join(testDir, 'watermark.png');
    await sharp({
      create: {
        width: 200,
        height: 100,
        channels: 4,
        background: { r: 220, g: 38, b: 38, alpha: 0.8 },
      },
    })
      .png()
      .toFile(sampleWatermarkImgPath);

    // 3. Create an invalid/corrupted dummy file
    invalidPdfPath = path.join(testDir, 'corrupted.pdf');
    await fs.writeFile(invalidPdfPath, Buffer.from('NOT_A_REAL_PDF_HEADER_BYTES'));
  });

  afterAll(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  });

  // ==========================================
  // FEATURE A: ORGANIZE PDF
  // ==========================================
  describe('POST /api/pdf/organize', () => {
    it('should reorder pages according to specification', async () => {
      const operations = JSON.stringify([
        { originalIndex: 2 },
        { originalIndex: 0 },
        { originalIndex: 1 },
      ]);

      const res = await request(app)
        .post('/api/pdf/organize')
        .attach('file', sample3PagePdfPath)
        .field('operations', operations);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pageCount).toBe(3);

      // Verify the generated PDF
      const downloadRes = await request(app)
        .get(res.body.data.downloadUrl)
        .buffer()
        .parse((res, cb) => {
          const bufs: Buffer[] = [];
          res.on('data', (c) => bufs.push(c));
          res.on('end', () => cb(null, Buffer.concat(bufs)));
        });

      expect(downloadRes.status).toBe(200);
      const organizedDoc = await PDFDocument.load(downloadRes.body);
      expect(organizedDoc.getPageCount()).toBe(3);
    });

    it('should delete specified pages and produce a smaller page count', async () => {
      // Keep only original page index 1
      const operations = JSON.stringify([{ originalIndex: 1 }]);

      const res = await request(app)
        .post('/api/pdf/organize')
        .attach('file', sample3PagePdfPath)
        .field('operations', operations);

      expect(res.status).toBe(200);
      expect(res.body.data.pageCount).toBe(1);

      const downloadRes = await request(app)
        .get(res.body.data.downloadUrl)
        .buffer()
        .parse((res, cb) => {
          const bufs: Buffer[] = [];
          res.on('data', (c) => bufs.push(c));
          res.on('end', () => cb(null, Buffer.concat(bufs)));
        });

      const doc = await PDFDocument.load(downloadRes.body);
      expect(doc.getPageCount()).toBe(1);
    });

    it('should rotate individual pages clockwise and counterclockwise', async () => {
      const operations = JSON.stringify([
        { originalIndex: 0, rotation: 90 },
        { originalIndex: 1, rotation: 270 },
      ]);

      const res = await request(app)
        .post('/api/pdf/organize')
        .attach('file', sample3PagePdfPath)
        .field('operations', operations);

      expect(res.status).toBe(200);
      expect(res.body.data.pageCount).toBe(2);

      const downloadRes = await request(app)
        .get(res.body.data.downloadUrl)
        .buffer()
        .parse((res, cb) => {
          const bufs: Buffer[] = [];
          res.on('data', (c) => bufs.push(c));
          res.on('end', () => cb(null, Buffer.concat(bufs)));
        });

      const doc = await PDFDocument.load(downloadRes.body);
      expect(doc.getPage(0).getRotation().angle).toBe(90);
      expect(doc.getPage(1).getRotation().angle).toBe(270);
    });

    it('should duplicate pages when requested', async () => {
      const operations = JSON.stringify([
        { originalIndex: 0 },
        { originalIndex: 0 },
        { originalIndex: 1 },
      ]);

      const res = await request(app)
        .post('/api/pdf/organize')
        .attach('file', sample3PagePdfPath)
        .field('operations', operations);

      expect(res.status).toBe(200);
      expect(res.body.data.pageCount).toBe(3);
    });

    it('should reject invalid page indices exceeding original page count', async () => {
      const operations = JSON.stringify([{ originalIndex: 99 }]);

      const res = await request(app)
        .post('/api/pdf/organize')
        .attach('file', sample3PagePdfPath)
        .field('operations', operations);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_PAGE_OPERATION');
    });

    it('should reject attempts to remove every page (empty operations)', async () => {
      const operations = JSON.stringify([]);

      const res = await request(app)
        .post('/api/pdf/organize')
        .attach('file', sample3PagePdfPath)
        .field('operations', operations);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // FEATURE B: WATERMARK PDF
  // ==========================================
  describe('POST /api/pdf/watermark-text', () => {
    it('should apply text watermark with custom styling and rotation', async () => {
      const res = await request(app)
        .post('/api/pdf/watermark-text')
        .attach('file', sample3PagePdfPath)
        .field('text', 'CONFIDENTIAL')
        .field('fontSize', '48')
        .field('color', '#dc2626')
        .field('opacity', '0.4')
        .field('rotation', '45')
        .field('position', 'middle-center')
        .field('pages', 'all');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pageCount).toBe(3);

      // Verify resulting PDF
      const downloadRes = await request(app)
        .get(res.body.data.downloadUrl)
        .buffer()
        .parse((res, cb) => {
          const bufs: Buffer[] = [];
          res.on('data', (c) => bufs.push(c));
          res.on('end', () => cb(null, Buffer.concat(bufs)));
        });

      const doc = await PDFDocument.load(downloadRes.body);
      expect(doc.getPageCount()).toBe(3);
    });

    it('should apply text watermark to odd pages only', async () => {
      const res = await request(app)
        .post('/api/pdf/watermark-text')
        .attach('file', sample3PagePdfPath)
        .field('text', 'ODD ONLY')
        .field('pages', 'odd');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pageCount).toBe(3);
    });

    it('should reject empty watermark text', async () => {
      const res = await request(app)
        .post('/api/pdf/watermark-text')
        .attach('file', sample3PagePdfPath)
        .field('text', '');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/pdf/watermark-image', () => {
    it('should apply image watermark with opacity and position', async () => {
      const res = await request(app)
        .post('/api/pdf/watermark-image')
        .attach('file', sample3PagePdfPath)
        .attach('image', sampleWatermarkImgPath)
        .field('scale', '0.6')
        .field('opacity', '0.5')
        .field('position', 'bottom-right');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pageCount).toBe(3);

      const downloadRes = await request(app)
        .get(res.body.data.downloadUrl)
        .buffer()
        .parse((res, cb) => {
          const bufs: Buffer[] = [];
          res.on('data', (c) => bufs.push(c));
          res.on('end', () => cb(null, Buffer.concat(bufs)));
        });

      const doc = await PDFDocument.load(downloadRes.body);
      expect(doc.getPageCount()).toBe(3);
    });

    it('should reject when image file is missing', async () => {
      const res = await request(app)
        .post('/api/pdf/watermark-image')
        .attach('file', sample3PagePdfPath);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('MISSING_FILES');
    });
  });

  // ==========================================
  // FEATURE C: ADD PAGE NUMBERS
  // ==========================================
  describe('POST /api/pdf/page-numbers', () => {
    it('should add page numbers in "page-n-of-total" format at bottom-center', async () => {
      const res = await request(app)
        .post('/api/pdf/page-numbers')
        .attach('file', sample3PagePdfPath)
        .field('position', 'bottom-center')
        .field('format', 'page-n-of-total')
        .field('fontSize', '11')
        .field('color', '#333333');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pageCount).toBe(3);

      const downloadRes = await request(app)
        .get(res.body.data.downloadUrl)
        .buffer()
        .parse((res, cb) => {
          const bufs: Buffer[] = [];
          res.on('data', (c) => bufs.push(c));
          res.on('end', () => cb(null, Buffer.concat(bufs)));
        });

      const doc = await PDFDocument.load(downloadRes.body);
      expect(doc.getPageCount()).toBe(3);
    });

    it('should support starting number and excluding first page', async () => {
      const res = await request(app)
        .post('/api/pdf/page-numbers')
        .attach('file', sample3PagePdfPath)
        .field('startNumber', '5')
        .field('excludeFirstPage', 'true')
        .field('format', 'number');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pageCount).toBe(3);
    });
  });

  // ==========================================
  // FEATURE D & E: PROTECT & UNLOCK PDF
  // ==========================================
  describe('POST /api/pdf/protect and POST /api/pdf/unlock', () => {
    let protectedPdfDownloadUrl: string;
    const testPassword = 'fileconvr-Secret-Pass-2026!';

    it('should encrypt a PDF with AES-256 standard password protection', async () => {
      const res = await request(app)
        .post('/api/pdf/protect')
        .attach('file', sample3PagePdfPath)
        .field('password', testPassword);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pageCount).toBe(3);

      protectedPdfDownloadUrl = res.body.data.downloadUrl;

      // Download the encrypted PDF
      const downloadRes = await request(app)
        .get(protectedPdfDownloadUrl)
        .buffer()
        .parse((res, cb) => {
          const bufs: Buffer[] = [];
          res.on('data', (c) => bufs.push(c));
          res.on('end', () => cb(null, Buffer.concat(bufs)));
        });

      expect(downloadRes.status).toBe(200);

      // Verify that pdf-lib cannot read encrypted document without password
      await expect(PDFDocument.load(downloadRes.body)).rejects.toThrow();
    });

    it('should reject unlocking with an incorrect password', async () => {
      // First download the protected PDF to temp file
      const downloadRes = await request(app)
        .get(protectedPdfDownloadUrl)
        .buffer()
        .parse((res, cb) => {
          const bufs: Buffer[] = [];
          res.on('data', (c) => bufs.push(c));
          res.on('end', () => cb(null, Buffer.concat(bufs)));
        });

      const tempProtectedPath = path.join(testDir, 'temp-protected.pdf');
      await fs.writeFile(tempProtectedPath, downloadRes.body);

      const unlockRes = await request(app)
        .post('/api/pdf/unlock')
        .attach('file', tempProtectedPath)
        .field('password', 'WRONG_PASSWORD_XYZ');

      expect(unlockRes.status).toBe(400);
      expect(unlockRes.body.success).toBe(false);
      expect(unlockRes.body.error.code).toBe('INCORRECT_PASSWORD');
    });

    it('should successfully unlock the PDF with the correct password and verify it opens freely', async () => {
      const tempProtectedPath = path.join(testDir, 'temp-protected.pdf');

      const unlockRes = await request(app)
        .post('/api/pdf/unlock')
        .attach('file', tempProtectedPath)
        .field('password', testPassword);

      expect(unlockRes.status).toBe(200);
      expect(unlockRes.body.success).toBe(true);
      expect(unlockRes.body.data.pageCount).toBe(3);

      // Download the unlocked PDF
      const unlockedDownloadRes = await request(app)
        .get(unlockRes.body.data.downloadUrl)
        .buffer()
        .parse((res, cb) => {
          const bufs: Buffer[] = [];
          res.on('data', (c) => bufs.push(c));
          res.on('end', () => cb(null, Buffer.concat(bufs)));
        });

      // Verify that the decrypted file opens without any password
      const decryptedDoc = await PDFDocument.load(unlockedDownloadRes.body);
      expect(decryptedDoc.getPageCount()).toBe(3);
    });

    it('should reject protecting an already protected PDF', async () => {
      const tempProtectedPath = path.join(testDir, 'temp-protected.pdf');

      const res = await request(app)
        .post('/api/pdf/protect')
        .attach('file', tempProtectedPath)
        .field('password', 'AnotherPassword');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ALREADY_PROTECTED');
    });
  });

  // ==========================================
  // ERROR & EDGE CASES
  // ==========================================
  describe('Error handling & Edge cases', () => {
    it('should reject corrupted PDF uploads', async () => {
      const res = await request(app)
        .post('/api/pdf/organize')
        .attach('file', invalidPdfPath)
        .field('operations', JSON.stringify([{ originalIndex: 0 }]));

      expect(res.status).toBe(500); // Or 400 validator failure
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent task download', async () => {
      const res = await request(app).get('/api/pdf/download/invalid-task-id/nonexistent.pdf');
      expect(res.status).toBe(404);
    });
  });
});
