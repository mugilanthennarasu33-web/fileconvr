import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, rgb } from 'pdf-lib';
import sharp from 'sharp';
import { app } from '../src/app.js';
import { ensureStorageDirectories } from '../src/utils/storage.js';

describe('PDF Processing Endpoints', () => {
  const testDir = path.resolve('./storage/test-fixtures');
  let samplePdf1Path: string;
  let samplePdf2Path: string;
  let sampleMultiPagePdfPath: string;
  let sampleImagePath: string;
  let invalidTxtPath: string;

  beforeAll(async () => {
    await ensureStorageDirectories();
    await fs.mkdir(testDir, { recursive: true });

    // 1. Create Sample PDF 1 (1 page)
    const doc1 = await PDFDocument.create();
    const p1 = doc1.addPage([500, 700]);
    p1.drawText('fileconvr Sample Document 1', { x: 50, y: 650, size: 20, color: rgb(0.2, 0.4, 0.8) });
    const pdf1Bytes = await doc1.save();
    samplePdf1Path = path.join(testDir, 'sample1.pdf');
    await fs.writeFile(samplePdf1Path, pdf1Bytes);

    // 2. Create Sample PDF 2 (1 page)
    const doc2 = await PDFDocument.create();
    const p2 = doc2.addPage([500, 700]);
    p2.drawText('fileconvr Sample Document 2', { x: 50, y: 650, size: 20, color: rgb(0.8, 0.2, 0.2) });
    const pdf2Bytes = await doc2.save();
    samplePdf2Path = path.join(testDir, 'sample2.pdf');
    await fs.writeFile(samplePdf2Path, pdf2Bytes);

    // 3. Create Multi-Page PDF (4 pages)
    const docMulti = await PDFDocument.create();
    for (let i = 1; i <= 4; i++) {
      const page = docMulti.addPage([595, 842]);
      page.drawText(`Page Number ${i} Content`, { x: 50, y: 750, size: 18, color: rgb(0.1, 0.6, 0.3) });
    }
    const multiBytes = await docMulti.save();
    sampleMultiPagePdfPath = path.join(testDir, 'multipage.pdf');
    await fs.writeFile(sampleMultiPagePdfPath, multiBytes);

    // 4. Create Sample Image (PNG)
    sampleImagePath = path.join(testDir, 'sample.png');
    await sharp({
      create: {
        width: 300,
        height: 200,
        channels: 4,
        background: { r: 255, g: 100, b: 50, alpha: 1 },
      },
    })
      .png()
      .toFile(sampleImagePath);

    // 5. Create Invalid Non-PDF text file
    invalidTxtPath = path.join(testDir, 'invalid.txt');
    await fs.writeFile(invalidTxtPath, 'This is a plain text file, not a valid PDF.');
  });

  afterAll(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  // TEST 1: Merge PDF
  it('POST /api/pdf/merge should merge multiple PDFs and allow download', async () => {
    const res = await request(app)
      .post('/api/pdf/merge')
      .attach('files', samplePdf1Path)
      .attach('files', samplePdf2Path);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.outputFilename).toMatch(/\.pdf$/);
    expect(res.body.data.pageCount).toBe(2);
    expect(res.body.data.fileSizeBytes).toBeGreaterThan(0);

    // Verify file can be downloaded
    const downloadRes = await request(app).get(res.body.data.downloadUrl);
    expect(downloadRes.status).toBe(200);
    expect(downloadRes.headers['content-type']).toBe('application/pdf');
    expect(downloadRes.body.length).toBeGreaterThan(0);
  });

  // TEST 2: Merge PDF with insufficient files (< 2)
  it('POST /api/pdf/merge should reject with 400 when fewer than 2 files provided', async () => {
    const res = await request(app)
      .post('/api/pdf/merge')
      .attach('files', samplePdf1Path);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INSUFFICIENT_FILES');
  });

  // TEST 3: Split PDF with valid range
  it('POST /api/pdf/split should split pages by custom range', async () => {
    const res = await request(app)
      .post('/api/pdf/split')
      .attach('file', sampleMultiPagePdfPath)
      .field('ranges', '1-2, 4')
      .field('mergeResult', 'true');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pageCount).toBe(3);
    expect(res.body.data.mimeType).toBe('application/pdf');

    // Verify downloaded content is valid PDF with 3 pages
    const downloadRes = await request(app).get(res.body.data.downloadUrl);
    expect(downloadRes.status).toBe(200);
    const parsedPdf = await PDFDocument.load(downloadRes.body);
    expect(parsedPdf.getPageCount()).toBe(3);
  });

  // TEST 4: Split PDF with invalid range (> total pages)
  it('POST /api/pdf/split should reject invalid page ranges exceeding total pages', async () => {
    const res = await request(app)
      .post('/api/pdf/split')
      .attach('file', sampleMultiPagePdfPath)
      .field('ranges', '1-10'); // Document only has 4 pages

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('exceeds document total');
  });

  // TEST 5: Rotate PDF
  it('POST /api/pdf/rotate should rotate pages by 90 degrees', async () => {
    const res = await request(app)
      .post('/api/pdf/rotate')
      .attach('file', samplePdf1Path)
      .field('angle', '90')
      .field('target', 'all');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.outputFilename).toMatch(/\.pdf$/);

    const downloadRes = await request(app).get(res.body.data.downloadUrl);
    expect(downloadRes.status).toBe(200);
    const parsed = await PDFDocument.load(downloadRes.body);
    expect(parsed.getPage(0).getRotation().angle).toBe(90);
  });

  // TEST 6: Compress PDF
  it('POST /api/pdf/compress should optimize PDF and report honest metrics', async () => {
    const res = await request(app)
      .post('/api/pdf/compress')
      .attach('file', sampleMultiPagePdfPath)
      .field('level', 'recommended');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.originalSizeBytes).toBeGreaterThan(0);
    expect(res.body.data.fileSizeBytes).toBeGreaterThan(0);
    expect(res.body.data.savedPercentage).toBeDefined();

    const downloadRes = await request(app).get(res.body.data.downloadUrl);
    expect(downloadRes.status).toBe(200);
    expect(downloadRes.headers['content-type']).toBe('application/pdf');
  });

  // TEST 7: Image to PDF
  it('POST /api/pdf/img-to-pdf should convert image files into a PDF', async () => {
    const res = await request(app)
      .post('/api/pdf/img-to-pdf')
      .attach('images', sampleImagePath)
      .field('pageSize', 'a4')
      .field('orientation', 'auto')
      .field('margin', 'small');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pageCount).toBe(1);

    const downloadRes = await request(app).get(res.body.data.downloadUrl);
    expect(downloadRes.status).toBe(200);
    const parsed = await PDFDocument.load(downloadRes.body);
    expect(parsed.getPageCount()).toBe(1);
  });

  // TEST 8: PDF to Image (rasterization)
  it('POST /api/pdf/pdf-to-img should rasterize PDF pages', async () => {
    const res = await request(app)
      .post('/api/pdf/pdf-to-img')
      .attach('file', samplePdf1Path);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pageCount).toBe(1);
    expect(res.body.data.mimeType).toBe('image/jpeg');

    const downloadRes = await request(app).get(res.body.data.downloadUrl);
    expect(downloadRes.status).toBe(200);
    expect(downloadRes.headers['content-type']).toBe('image/jpeg');
  });

  // TEST 9: Reject invalid non-PDF file
  it('POST /api/pdf/merge should reject files that are not valid PDFs', async () => {
    const res = await request(app)
      .post('/api/pdf/merge')
      .attach('files', invalidTxtPath)
      .attach('files', samplePdf1Path);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // TEST 10: Security path traversal test on download
  it('GET /api/pdf/download should prevent path traversal', async () => {
    const res = await request(app).get('/api/pdf/download/some-task/..%2F..%2F..%2Fetc%2Fpasswd');
    expect(res.status).toBe(404);
  });
});
