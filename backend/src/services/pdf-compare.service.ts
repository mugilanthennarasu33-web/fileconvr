import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { PDFDocument } from 'pdf-lib';
import { config } from '../config.js';

const candidate1 = path.resolve(process.cwd(), 'src/scripts/pdf_compare.py');
const candidate2 = path.resolve(process.cwd(), 'backend/src/scripts/pdf_compare.py');
const COMPARE_SCRIPT = existsSync(candidate1) ? candidate1 : candidate2;

const MAX_COMPARE_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const MAX_COMPARE_PAGES = 50;

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

export interface PageComparison {
  pageNumber: number;
  status: 'identical' | 'modified' | 'added' | 'removed';
  dimensionsMatch: boolean;
  doc1Dimensions: { width: number; height: number } | null;
  doc2Dimensions: { width: number; height: number } | null;
  textSimilarity: number;
  textChanges: {
    hasChanges: boolean;
    addedLines: number;
    removedLines: number;
    diffLines: DiffLine[];
  };
  visualChanges: {
    hasChanges: boolean;
    diffPercentage: number;
    diffImage: string | null;
    doc1Image: string | null;
    doc2Image: string | null;
  };
}

export interface CompareResult {
  outputFilename: string;
  fileSizeBytes: number;
  mimeType: string;
  pageCount: number;
  areIdentical: boolean;
  doc1PageCount: number;
  doc2PageCount: number;
  comparedPagesCount: number;
  pagesWithTextChanges: number[];
  pagesWithVisualChanges: number[];
  totalAddedLines: number;
  totalRemovedLines: number;
  overallSimilarityScore: number;
  pageComparisons: PageComparison[];
  reportFilename: string;
  reportSizeBytes: number;
  disclaimer: string;
}

export class CompareError extends Error {
  code: string;
  constructor(message: string, code: string = 'COMPARE_ERROR') {
    super(message);
    this.name = 'CompareError';
    this.code = code;
  }
}

/**
 * Compare two PDF documents for textual differences and visual pixel variations
 */
export async function comparePdfs(
  file1Path: string,
  file2Path: string,
  taskDir: string,
  options: { maxPages?: number; dpi?: number } = {}
): Promise<CompareResult> {
  // 1. Verify existence and size of file 1
  const stat1 = await fs.stat(file1Path).catch(() => {
    throw new CompareError('First document (Document 1) not found.', 'DOC1_NOT_FOUND');
  });
  if (stat1.size > MAX_COMPARE_FILE_SIZE) {
    throw new CompareError(`Document 1 exceeds maximum comparison size limit of 25MB.`, 'FILE_TOO_LARGE');
  }

  // 2. Verify existence and size of file 2
  const stat2 = await fs.stat(file2Path).catch(() => {
    throw new CompareError('Second document (Document 2) not found.', 'DOC2_NOT_FOUND');
  });
  if (stat2.size > MAX_COMPARE_FILE_SIZE) {
    throw new CompareError(`Document 2 exceeds maximum comparison size limit of 25MB.`, 'FILE_TOO_LARGE');
  }

  // 3. Validate PDF format of both files
  try {
    const b1 = await fs.readFile(file1Path);
    const pdf1 = await PDFDocument.load(b1, { ignoreEncryption: true });
    if (pdf1.getPageCount() === 0) {
      throw new Error('Document has 0 pages.');
    }
  } catch (err: any) {
    throw new CompareError(`Document 1 is not a valid PDF: ${err.message}`, 'INVALID_DOC1');
  }

  try {
    const b2 = await fs.readFile(file2Path);
    const pdf2 = await PDFDocument.load(b2, { ignoreEncryption: true });
    if (pdf2.getPageCount() === 0) {
      throw new Error('Document has 0 pages.');
    }
  } catch (err: any) {
    throw new CompareError(`Document 2 is not a valid PDF: ${err.message}`, 'INVALID_DOC2');
  }

  const maxPages = options.maxPages || MAX_COMPARE_PAGES;
  const dpi = options.dpi || 150;

  // 4. Run comparison subprocess
  const resultJson = await new Promise<any>((resolve, reject) => {
    const python = spawn(config.pythonPath, [
      COMPARE_SCRIPT,
      file1Path,
      file2Path,
      taskDir,
      String(maxPages),
      String(dpi),
    ]);

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
        return reject(new CompareError(stderr || 'Comparison engine produced no output.', 'ENGINE_ERROR'));
      }
      try {
        const parsed = JSON.parse(lastLine);
        if (code !== 0 || !parsed.success) {
          return reject(new CompareError(parsed.message || stderr || 'Comparison failed.', parsed.code || 'COMPARE_ERROR'));
        }
        resolve(parsed);
      } catch (e) {
        reject(new CompareError(`Failed to parse comparison result: ${stderr || (e as Error).message}`));
      }
    });

    python.on('error', (err) => {
      reject(new CompareError(`Failed to launch comparison process: ${err.message}`));
    });
  });

  // 5. Generate structured comparison report file in task directory
  const reportFilename = `fileconvr_comparison_report_${Date.now()}.json`;
  const reportPath = path.join(taskDir, reportFilename);
  const reportContent = JSON.stringify(resultJson, null, 2);
  await fs.writeFile(reportPath, reportContent, 'utf-8');
  const reportStat = await fs.stat(reportPath);

  return {
    outputFilename: reportFilename,
    fileSizeBytes: reportStat.size,
    mimeType: 'application/json',
    pageCount: resultJson.comparedPagesCount,
    areIdentical: resultJson.areIdentical,
    doc1PageCount: resultJson.doc1PageCount,
    doc2PageCount: resultJson.doc2PageCount,
    comparedPagesCount: resultJson.comparedPagesCount,
    pagesWithTextChanges: resultJson.pagesWithTextChanges || [],
    pagesWithVisualChanges: resultJson.pagesWithVisualChanges || [],
    totalAddedLines: resultJson.totalAddedLines || 0,
    totalRemovedLines: resultJson.totalRemovedLines || 0,
    overallSimilarityScore: resultJson.overallSimilarityScore ?? 1.0,
    pageComparisons: resultJson.pageComparisons || [],
    reportFilename,
    reportSizeBytes: reportStat.size,
    disclaimer: resultJson.disclaimer,
  };
}
