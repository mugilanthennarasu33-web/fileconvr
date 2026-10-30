import path from 'node:path';
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';
import Tesseract from 'tesseract.js';
import { config } from '../config.js';

const candidate1 = path.resolve(process.cwd(), 'src/scripts/pdf_ocr.py');
const candidate2 = path.resolve(process.cwd(), 'backend/src/scripts/pdf_ocr.py');
const OCR_SCRIPT = existsSync(candidate1) ? candidate1 : candidate2;

export const SUPPORTED_OCR_LANGUAGES: Record<string, string> = {
  eng: 'English',
  spa: 'Spanish (Español)',
  fra: 'French (Français)',
  deu: 'German (Deutsch)',
  ita: 'Italian (Italiano)',
  por: 'Portuguese (Português)',
  nld: 'Dutch (Nederlands)',
  chi_sim: 'Chinese Simplified (简体中文)',
  rus: 'Russian (Русский)',
  jpn: 'Japanese (日本語)',
  ara: 'Arabic (العربية)',
  hin: 'Hindi (हिन्दी)',
};

export interface OcrOptions {
  language?: string;
  forceAllPages?: boolean;
  dpi?: number;
  simulateMissingEngine?: boolean;
}

export interface OcrResult {
  outputFilename: string;
  fileSizeBytes: number;
  originalSizeBytes: number;
  pageCount: number;
  pagesOcred: number;
  detectedScannedPages: number[];
  language: string;
  languageName: string;
  extractedText: string;
  wordsExtracted: number;
  statusMessage: string;
  accuracyNote: string;
}

export class OcrError extends Error {
  code: string;
  constructor(message: string, code: string = 'OCR_ERROR') {
    super(message);
    this.name = 'OcrError';
    this.code = code;
  }
}

/**
 * Execute a python helper command for PDF OCR tasks
 */
async function runOcrScript(args: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const python = spawn(config.pythonPath, [OCR_SCRIPT, ...args]);
    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (c) => {
      stdout += c.toString();
    });
    python.stderr.on('data', (c) => {
      stderr += c.toString();
    });

    python.on('close', (code) => {
      const lastLine = stdout.trim().split('\n').filter(Boolean).pop();
      if (!lastLine) {
        return reject(new OcrError(stderr || 'OCR helper returned no output', 'OCR_SCRIPT_ERROR'));
      }
      try {
        const parsed = JSON.parse(lastLine);
        if (code !== 0 || !parsed.success) {
          return reject(new OcrError(parsed.message || stderr || 'OCR process failed', parsed.code || 'OCR_ERROR'));
        }
        resolve(parsed);
      } catch (e) {
        reject(new OcrError(`Failed to parse OCR helper output: ${stderr || (e as Error).message}`));
      }
    });

    python.on('error', (err) => {
      reject(new OcrError(`Failed to execute OCR script: ${err.message}`));
    });
  });
}

/**
 * Perform OCR on a PDF document
 */
export async function ocrPdf(
  filePath: string,
  taskDir: string,
  options: OcrOptions = {}
): Promise<OcrResult> {
  const language = (options.language || 'eng').toLowerCase();

  // 1. Dependency / Engine availability check
  if (options.simulateMissingEngine || process.env.SIMULATE_NO_OCR_ENGINE === 'true') {
    throw new OcrError(
      'OCR engine (Tesseract) is not available or disabled in current configuration.',
      'OCR_ENGINE_NOT_AVAILABLE'
    );
  }

  // 2. Validate requested language
  if (!SUPPORTED_OCR_LANGUAGES[language]) {
    throw new OcrError(
      `Unsupported OCR language: "${language}". Supported languages are: ${Object.keys(SUPPORTED_OCR_LANGUAGES).join(', ')}.`,
      'UNSUPPORTED_LANGUAGE'
    );
  }

  // 3. Validate source file existence and PDF format
  const origStat = await fs.stat(filePath).catch(() => {
    throw new OcrError('PDF file not found.', 'FILE_NOT_FOUND');
  });

  if (origStat.size < 10) {
    throw new OcrError('File is empty or too small to be a valid PDF.', 'INVALID_PDF');
  }

  const pdfBytes = await fs.readFile(filePath);
  try {
    await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  } catch (err: any) {
    throw new OcrError(`Invalid or corrupted PDF document: ${err.message}`, 'INVALID_PDF');
  }

  // 4. Detect scanned pages and assess extractable text
  const detection = await runOcrScript(['detect', filePath]);
  const pageCount: number = detection.pageCount;
  const detectedScannedPages: number[] = detection.scannedPages || [];

  // Determine pages to OCR (1-based index)
  let pagesToOcr: number[] = [];
  if (options.forceAllPages || detectedScannedPages.length === pageCount) {
    pagesToOcr = Array.from({ length: pageCount }, (_, i) => i + 1);
  } else if (detectedScannedPages.length > 0) {
    pagesToOcr = detectedScannedPages;
  } else {
    // Document already has searchable text on all pages
    // Still run on page 1 if requested or return the searchable document
    pagesToOcr = [1];
  }

  const dpi = options.dpi || 200;
  const pageOcrResults: Array<{
    pageIndex: number;
    scale: number;
    lines: Array<{ text: string; bbox?: [number, number, number, number] }>;
  }> = [];

  let combinedExtractedText = '';
  let totalWordsExtracted = 0;

  // 5. Render pages to images and process OCR using Tesseract
  for (const pageNum of pagesToOcr) {
    const pageIdx = pageNum - 1;
    const pageImgPath = path.join(taskDir, `ocr_render_p${pageNum}.png`);

    // Render page via PyMuPDF at high DPI
    const renderRes = await runOcrScript(['render_page', filePath, String(pageIdx), pageImgPath, String(dpi)]);
    const scale = renderRes.scale || 72.0 / dpi;

    // Run Tesseract OCR on rendered page image
    const tesseractRes = await Tesseract.recognize(pageImgPath, language);
    const data: any = tesseractRes.data;
    const pageText = (data.text || '').trim();

    if (pageText) {
      combinedExtractedText += `--- Page ${pageNum} ---\n${pageText}\n\n`;
      totalWordsExtracted += pageText.split(/\s+/).length;
    }

    const lines: Array<{ text: string; bbox?: [number, number, number, number] }> = [];
    if (data.lines && data.lines.length > 0) {
      for (const line of data.lines) {
        if (line.text && line.text.trim()) {
          const b = line.bbox;
          lines.push({
            text: line.text.trim(),
            bbox: b ? [b.x0, b.y0, b.x1, b.y1] : undefined,
          });
        }
      }
    } else if (pageText) {
      lines.push({ text: pageText });
    }

    pageOcrResults.push({
      pageIndex: pageIdx,
      scale,
      lines,
    });

    // Clean up temporary page image
    await fs.unlink(pageImgPath).catch(() => {});
  }

  // 6. Save OCR metadata and apply invisible text overlay into a new searchable PDF
  const ocrDataPath = path.join(taskDir, `ocr_data_${Date.now()}.json`);
  await fs.writeFile(ocrDataPath, JSON.stringify({ pages: pageOcrResults }), 'utf-8');

  const outputFilename = `fileconvr_ocr_${Date.now()}.pdf`;
  const outputPath = path.join(taskDir, outputFilename);

  const applyRes = await runOcrScript(['apply_ocr', filePath, outputPath, ocrDataPath]);

  // Clean up metadata json
  await fs.unlink(ocrDataPath).catch(() => {});

  // 7. Verify searchable output
  const outputStat = await fs.stat(outputPath).catch(() => {
    throw new OcrError('Failed to generate searchable output PDF.', 'OUTPUT_GENERATION_FAILED');
  });

  const repairedPdfBytes = await fs.readFile(outputPath);
  const loadedDoc = await PDFDocument.load(repairedPdfBytes, { ignoreEncryption: true });
  const finalPageCount = loadedDoc.getPageCount();

  const accuracyNote =
    'OCR accuracy is dependent on image resolution, contrast, skew, and font style. Handwriting and low-contrast scans may have reduced recognition accuracy.';

  return {
    outputFilename,
    fileSizeBytes: outputStat.size,
    originalSizeBytes: origStat.size,
    pageCount: finalPageCount,
    pagesOcred: applyRes.pagesOcred || pageOcrResults.length,
    detectedScannedPages,
    language,
    languageName: SUPPORTED_OCR_LANGUAGES[language],
    extractedText: combinedExtractedText.trim(),
    wordsExtracted: totalWordsExtracted,
    statusMessage: `Successfully processed OCR for ${pageOcrResults.length} page(s) in ${SUPPORTED_OCR_LANGUAGES[language]}. Searchable PDF generated.`,
    accuracyNote,
  };
}
