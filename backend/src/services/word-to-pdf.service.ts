import fs from 'node:fs/promises';
import path from 'node:path';
import mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';
import { printHtmlToPdf } from '../utils/browser-printer.js';

export interface WordToPdfResult {
  outputPath: string;
  outputFilename: string;
  fileSizeBytes: number;
  pageCount: number;
}

export async function convertWordToPdf(
  inputFilePath: string,
  outputDir: string
): Promise<WordToPdfResult> {
  const ext = path.extname(inputFilePath).toLowerCase();

  if (ext !== '.docx' && ext !== '.doc') {
    throw new Error(`Unsupported document extension "${ext}". Only .docx and .doc files are supported.`);
  }

  const fileBuffer = await fs.readFile(inputFilePath);
  if (fileBuffer.length === 0) {
    throw new Error('The uploaded document is empty (0 bytes).');
  }

  let htmlBody = '';

  try {
    const conversionResult = await mammoth.convertToHtml({ buffer: fileBuffer });
    htmlBody = conversionResult.value;

    if (!htmlBody || htmlBody.trim().length === 0) {
      throw new Error('The Word document does not contain readable text or layout elements.');
    }
  } catch (err: any) {
    if (ext === '.doc') {
      throw new Error(
        'Legacy binary Word (.doc) format could not be parsed. Please save or re-export the document as modern .docx format.'
      );
    }
    throw new Error(`Failed to parse Word document: ${err.message}`);
  }

  const styledHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @page {
      size: A4 portrait;
      margin: 20mm;
    }
    body {
      font-family: 'Calibri', 'Segoe UI', -apple-system, Roboto, Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      background: #ffffff;
      padding: 0;
      margin: 0;
    }
    h1 { font-size: 20pt; font-weight: bold; margin-bottom: 12pt; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4pt; }
    h2 { font-size: 16pt; font-weight: bold; margin-top: 14pt; margin-bottom: 8pt; color: #1e293b; }
    h3 { font-size: 13pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; color: #334155; }
    p { margin-bottom: 10pt; text-align: justify; }
    table { border-collapse: collapse; width: 100%; margin: 12pt 0; font-size: 10pt; }
    th, td { border: 1px solid #94a3b8; padding: 6pt 10pt; text-align: left; }
    th { background-color: #f1f5f9; font-weight: bold; }
    ul, ol { margin-bottom: 10pt; padding-left: 20pt; }
    li { margin-bottom: 4pt; }
    img { max-width: 100%; height: auto; display: block; margin: 10pt 0; }
  </style>
</head>
<body>
  ${htmlBody}
</body>
</html>`;

  const outputFilename = `fileconvr_word_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  await printHtmlToPdf(styledHtml, outputPath, outputDir, { pageFormat: 'A4', landscape: false });

  // Read page count from generated PDF
  const pdfBytes = await fs.readFile(outputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const stats = await fs.stat(outputPath);

  return {
    outputPath,
    outputFilename,
    fileSizeBytes: stats.size,
    pageCount: pdfDoc.getPageCount(),
  };
}
