import fs from 'node:fs/promises';
import path from 'node:path';
import * as XLSX from 'xlsx';
import { PDFDocument } from 'pdf-lib';
import { printHtmlToPdf } from '../utils/browser-printer.js';

export interface ExcelToPdfResult {
  outputPath: string;
  outputFilename: string;
  fileSizeBytes: number;
  pageCount: number;
  sheetCount: number;
}

export async function convertExcelToPdf(
  inputFilePath: string,
  outputDir: string
): Promise<ExcelToPdfResult> {
  const ext = path.extname(inputFilePath).toLowerCase();
  if (ext !== '.xlsx' && ext !== '.xls') {
    throw new Error(`Unsupported spreadsheet extension "${ext}". Only .xlsx and .xls files are supported.`);
  }

  const fileBuffer = await fs.readFile(inputFilePath);
  if (fileBuffer.length === 0) {
    throw new Error('The uploaded spreadsheet is empty (0 bytes).');
  }

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  } catch (err: any) {
    throw new Error(`Failed to parse Excel workbook: ${err.message}`);
  }

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('The Excel workbook contains no readable worksheets.');
  }

  let maxColsInAnySheet = 0;
  const sheetHtmlSections: string[] = [];

  for (let i = 0; i < workbook.SheetNames.length; i++) {
    const sheetName = workbook.SheetNames[i];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) continue;

    // Convert sheet to HTML table
    const tableHtml = XLSX.utils.sheet_to_html(sheet, { id: `sheet-${i}` });

    // Determine range dimensions
    if (sheet['!ref']) {
      const range = XLSX.utils.decode_range(sheet['!ref']);
      const cols = range.e.c - range.s.c + 1;
      if (cols > maxColsInAnySheet) maxColsInAnySheet = cols;
    }

    // Extract table body or wrap cleanly
    const isLast = i === workbook.SheetNames.length - 1;
    const pageBreak = isLast ? '' : 'style="page-break-after: always;"';

    sheetHtmlSections.push(`
      <section class="sheet-container" ${pageBreak}>
        <div class="sheet-header">
          <h2>Sheet: ${sheetName}</h2>
        </div>
        <div class="table-wrapper">
          ${tableHtml}
        </div>
      </section>
    `);
  }

  const isLandscape = maxColsInAnySheet > 6;

  const styledHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @page {
      size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'};
      margin: 12mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      font-size: 10pt;
      color: #0f172a;
      background: #ffffff;
      padding: 0;
      margin: 0;
    }
    .sheet-container {
      margin-bottom: 20px;
    }
    .sheet-header h2 {
      font-size: 14pt;
      color: #1e293b;
      margin: 0 0 10px 0;
      padding-bottom: 4px;
      border-bottom: 2px solid #0284c7;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 16px;
      table-layout: auto;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      text-align: left;
      word-wrap: break-word;
      font-size: 9pt;
    }
    tr:first-child td, th {
      background-color: #f1f5f9;
      font-weight: 600;
      color: #334155;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
  </style>
</head>
<body>
  ${sheetHtmlSections.join('\n')}
</body>
</html>`;

  const outputFilename = `fileconvr_excel_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  await printHtmlToPdf(styledHtml, outputPath, outputDir, {
    pageFormat: 'A4',
    landscape: isLandscape,
  });

  const pdfBytes = await fs.readFile(outputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const stats = await fs.stat(outputPath);

  return {
    outputPath,
    outputFilename,
    fileSizeBytes: stats.size,
    pageCount: pdfDoc.getPageCount(),
    sheetCount: workbook.SheetNames.length,
  };
}
