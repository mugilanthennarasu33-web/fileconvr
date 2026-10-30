import fs from 'node:fs/promises';
import path from 'node:path';
import AdmZip from 'adm-zip';
import { PDFDocument } from 'pdf-lib';
import { printHtmlToPdf } from '../utils/browser-printer.js';

export interface PptToPdfResult {
  outputPath: string;
  outputFilename: string;
  fileSizeBytes: number;
  pageCount: number;
}

interface SlideData {
  slideNumber: number;
  title: string;
  paragraphs: string[];
}

export async function convertPptToPdf(
  inputFilePath: string,
  outputDir: string
): Promise<PptToPdfResult> {
  const ext = path.extname(inputFilePath).toLowerCase();
  if (ext !== '.pptx' && ext !== '.ppt') {
    throw new Error(`Unsupported presentation extension "${ext}". Only .pptx and .ppt files are supported.`);
  }

  if (ext === '.ppt') {
    throw new Error(
      'Legacy binary PowerPoint (.ppt) format is not supported. Please save or re-export the presentation as modern .pptx format.'
    );
  }

  const fileBuffer = await fs.readFile(inputFilePath);
  if (fileBuffer.length === 0) {
    throw new Error('The uploaded presentation is empty (0 bytes).');
  }

  let zip: AdmZip;
  try {
    zip = new AdmZip(fileBuffer);
  } catch (err: any) {
    throw new Error(`Failed to read presentation archive: ${err.message}`);
  }

  const zipEntries = zip.getEntries();
  const slideEntries = zipEntries
    .filter((e) => e.entryName.startsWith('ppt/slides/slide') && e.entryName.endsWith('.xml'))
    .sort((a, b) => {
      const numA = parseInt(a.entryName.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.entryName.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

  if (slideEntries.length === 0) {
    throw new Error('No slides found in the PowerPoint presentation archive.');
  }

  const slides: SlideData[] = [];

  for (let i = 0; i < slideEntries.length; i++) {
    const slideXml = slideEntries[i].getData().toString('utf8');

    // Extract text blocks inside <a:t> elements
    const textMatches: string[] = [];
    const textRegex = /<a:t>([^<]+)<\/a:t>/g;
    let match: RegExpExecArray | null;
    while ((match = textRegex.exec(slideXml)) !== null) {
      if (match[1] && match[1].trim()) {
        textMatches.push(match[1].trim());
      }
    }

    const title = textMatches.length > 0 ? textMatches[0] : `Slide ${i + 1}`;
    const paragraphs = textMatches.length > 1 ? textMatches.slice(1) : [];

    slides.push({
      slideNumber: i + 1,
      title,
      paragraphs,
    });
  }

  const slideHtmlSections = slides.map((slide, idx) => {
    const isLast = idx === slides.length - 1;
    const pageBreak = isLast ? '' : 'style="page-break-after: always;"';

    return `
      <div class="slide-wrapper" ${pageBreak}>
        <div class="slide-content">
          <div class="slide-header">
            <span class="slide-badge">Slide ${slide.slideNumber}</span>
            <h1 class="slide-title">${slide.title}</h1>
          </div>
          <div class="slide-body">
            ${
              slide.paragraphs.length > 0
                ? `<ul class="bullet-list">
                    ${slide.paragraphs.map((p) => `<li>${p}</li>`).join('')}
                   </ul>`
                : '<p class="empty-hint">(Visual or Diagram Content)</p>'
            }
          </div>
          <div class="slide-footer">
            <span>fileconvr Presentation Engine</span>
            <span>${slide.slideNumber} of ${slides.length}</span>
          </div>
        </div>
      </div>
    `;
  });

  const styledHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @page {
      size: 297mm 210mm; /* A4 landscape */
      margin: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .slide-wrapper {
      width: 297mm;
      height: 210mm;
      box-sizing: border-box;
      padding: 24mm 30mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: linear-gradient(135deg, #0b0f19 0%, #1e293b 100%);
      position: relative;
    }
    .slide-content {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .slide-badge {
      display: inline-block;
      font-size: 11pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #ef4444;
      margin-bottom: 8pt;
    }
    .slide-title {
      font-size: 26pt;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 16pt 0;
      line-height: 1.2;
    }
    .slide-body {
      flex: 1;
      margin-top: 10pt;
    }
    .bullet-list {
      list-style-type: square;
      padding-left: 24pt;
      font-size: 16pt;
      line-height: 1.8;
      color: #cbd5e1;
    }
    .bullet-list li {
      margin-bottom: 12pt;
    }
    .empty-hint {
      font-size: 14pt;
      color: #64748b;
      font-style: italic;
    }
    .slide-footer {
      display: flex;
      justify-content: space-between;
      font-size: 10pt;
      color: #64748b;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 10pt;
    }
  </style>
</head>
<body>
  ${slideHtmlSections.join('\n')}
</body>
</html>`;

  const outputFilename = `fileconvr_presentation_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  await printHtmlToPdf(styledHtml, outputPath, outputDir, {
    pageFormat: 'A4',
    landscape: true,
  });

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
