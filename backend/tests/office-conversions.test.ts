import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import * as XLSX from 'xlsx';
import AdmZip from 'adm-zip';
import { PDFDocument, rgb } from 'pdf-lib';
import { app } from '../src/app.js';
import { config } from '../src/config.js';
import { ensureStorageDirectories } from '../src/utils/storage.js';

describe('Office and PDF Conversions (Milestone 2)', () => {
  const testDir = path.resolve('./storage/test-office-fixtures');
  let sampleDocxPath: string;
  let sampleXlsxPath: string;
  let samplePptxPath: string;
  let sampleVectorPdfPath: string;
  let invalidOfficePath: string;

  beforeAll(async () => {
    await ensureStorageDirectories();
    await fs.mkdir(testDir, { recursive: true });

    // 1. Generate real sample .docx via python-docx
    sampleDocxPath = path.join(testDir, 'sample_doc.docx');
    const createDocxPy = `
import docx
doc = docx.Document()
doc.add_heading('fileconvr Milestone 2 Document', 0)
doc.add_paragraph('This is a test paragraph demonstrating Word to PDF conversion layout fidelity.')
table = doc.add_table(rows=2, cols=2)
table.cell(0, 0).text = 'Header 1'
table.cell(0, 1).text = 'Header 2'
table.cell(1, 0).text = 'Value A'
table.cell(1, 1).text = 'Value B'
doc.save(r'${sampleDocxPath}')
`;
    execFileSync(config.pythonPath, ['-c', createDocxPy]);

    // 2. Generate real sample .xlsx with multiple sheets via xlsx
    sampleXlsxPath = path.join(testDir, 'sample_sheets.xlsx');
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet([
      ['Department', 'Headcount', 'Budget'],
      ['Engineering', 25, 250000],
      ['Product', 8, 120000],
      ['Design', 6, 90000],
    ]);
    const ws2 = XLSX.utils.aoa_to_sheet([
      ['Quarter', 'Revenue', 'Profit'],
      ['Q1', 450000, 110000],
      ['Q2', 520000, 140000],
    ]);
    XLSX.utils.book_append_sheet(wb, ws1, 'Staffing');
    XLSX.utils.book_append_sheet(wb, ws2, 'Quarterly');
    XLSX.writeFile(wb, sampleXlsxPath);

    // 3. Generate real sample .pptx (2 slides) via adm-zip
    samplePptxPath = path.join(testDir, 'sample_presentation.pptx');
    const zip = new AdmZip();
    const slide1Xml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p><a:r><a:t>Slide 1: Executive Overview</a:t></a:r></a:p>
          <a:p><a:r><a:t>Primary Milestone 2 objectives achieved.</a:t></a:r></a:p>
          <a:p><a:r><a:t>Reliable headless layout rendering verified.</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

    const slide2Xml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p><a:r><a:t>Slide 2: Next Architectural Goals</a:t></a:r></a:p>
          <a:p><a:r><a:t>Prepare for Milestone 3 security and watermarking.</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

    zip.addFile('ppt/slides/slide1.xml', Buffer.from(slide1Xml, 'utf8'));
    zip.addFile('ppt/slides/slide2.xml', Buffer.from(slide2Xml, 'utf8'));
    zip.writeZip(samplePptxPath);

    // 4. Generate sample vector PDF with text for PDF to Word test
    const vectorDoc = await PDFDocument.create();
    const page = vectorDoc.addPage([595, 842]);
    page.drawText('fileconvr PDF to Word Verification', { x: 50, y: 780, size: 22, color: rgb(0.1, 0.1, 0.1) });
    page.drawText('This document contains selectable vector text for reconstruction into DOCX.', {
      x: 50,
      y: 740,
      size: 14,
      color: rgb(0.3, 0.3, 0.3),
    });
    const vectorBytes = await vectorDoc.save();
    sampleVectorPdfPath = path.join(testDir, 'sample_vector.pdf');
    await fs.writeFile(sampleVectorPdfPath, vectorBytes);

    // 5. Invalid office file
    invalidOfficePath = path.join(testDir, 'invalid.txt');
    await fs.writeFile(invalidOfficePath, 'Corrupted or wrong format document.');
  });

  afterAll(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  // TEST 1: Word to PDF
  it('POST /api/pdf/word-to-pdf should convert DOCX to valid PDF', async () => {
    const res = await request(app)
      .post('/api/pdf/word-to-pdf')
      .attach('file', sampleDocxPath);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.outputFilename).toMatch(/\.pdf$/);
    expect(res.body.data.mimeType).toBe('application/pdf');
    expect(res.body.data.pageCount).toBeGreaterThanOrEqual(1);

    // Verify download
    const downloadRes = await request(app).get(res.body.data.downloadUrl);
    expect(downloadRes.status).toBe(200);
    expect(downloadRes.headers['content-type']).toBe('application/pdf');
    const parsedPdf = await PDFDocument.load(downloadRes.body);
    expect(parsedPdf.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  // TEST 2: Excel to PDF
  it('POST /api/pdf/excel-to-pdf should convert multi-sheet workbook to valid PDF', async () => {
    const res = await request(app)
      .post('/api/pdf/excel-to-pdf')
      .attach('file', sampleXlsxPath);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.outputFilename).toMatch(/\.pdf$/);
    expect(res.body.data.mimeType).toBe('application/pdf');
    expect(res.body.data.pageCount).toBeGreaterThanOrEqual(1);

    // Verify download
    const downloadRes = await request(app).get(res.body.data.downloadUrl);
    expect(downloadRes.status).toBe(200);
    expect(downloadRes.headers['content-type']).toBe('application/pdf');
  });

  // TEST 3: PowerPoint to PDF
  it('POST /api/pdf/ppt-to-pdf should convert presentation slides to valid PDF', async () => {
    const res = await request(app)
      .post('/api/pdf/ppt-to-pdf')
      .attach('file', samplePptxPath);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.outputFilename).toMatch(/\.pdf$/);
    expect(res.body.data.mimeType).toBe('application/pdf');
    expect(res.body.data.pageCount).toBe(2); // Exactly 2 slides = 2 pages

    // Verify download
    const downloadRes = await request(app).get(res.body.data.downloadUrl);
    expect(downloadRes.status).toBe(200);
    const parsedPdf = await PDFDocument.load(downloadRes.body);
    expect(parsedPdf.getPageCount()).toBe(2);
  });

  // TEST 4: PDF to Word
  it('POST /api/pdf/pdf-to-word should reconstruct editable DOCX from PDF', async () => {
    const res = await request(app)
      .post('/api/pdf/pdf-to-word')
      .attach('file', sampleVectorPdfPath);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.outputFilename).toMatch(/\.docx$/);
    expect(res.body.data.mimeType).toContain('wordprocessingml.document');
    expect(res.body.data.fileSizeBytes).toBeGreaterThan(0);

    // Verify download returns valid DOCX OpenXML file
    const downloadRes = await request(app)
      .get(res.body.data.downloadUrl)
      .buffer()
      .parse((r, cb) => {
        const chunks: Buffer[] = [];
        r.on('data', (chunk) => chunks.push(chunk));
        r.on('end', () => cb(null, Buffer.concat(chunks)));
      });

    expect(downloadRes.status).toBe(200);
    expect(downloadRes.headers['content-type']).toContain('wordprocessingml.document');
    expect(downloadRes.body.length).toBeGreaterThan(0);

    // A valid docx is an OpenXML ZIP archive containing word/document.xml
    const docxZip = new AdmZip(downloadRes.body);
    const docXmlEntry = docxZip.getEntries().find((e) =>
      e.entryName.toLowerCase().replace(/\\/g, '/').includes('word/document.xml')
    );
    expect(docXmlEntry).toBeDefined();

    if (docXmlEntry) {
      const docXmlText = docXmlEntry.getData().toString('utf8');
      expect(docXmlText.length).toBeGreaterThan(0);
      expect(docXmlText).toContain('fileconvr');
    }
  });

  // TEST 5: Reject invalid file for Word to PDF
  it('POST /api/pdf/word-to-pdf should reject non-Word files with 400', async () => {
    const res = await request(app)
      .post('/api/pdf/word-to-pdf')
      .attach('file', invalidOfficePath);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // TEST 6: Reject invalid file for Excel to PDF
  it('POST /api/pdf/excel-to-pdf should reject non-Excel files with 400', async () => {
    const res = await request(app)
      .post('/api/pdf/excel-to-pdf')
      .attach('file', invalidOfficePath);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // TEST 7: Reject invalid file for PPT to PDF
  it('POST /api/pdf/ppt-to-pdf should reject non-PPT files with 400', async () => {
    const res = await request(app)
      .post('/api/pdf/ppt-to-pdf')
      .attach('file', invalidOfficePath);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
