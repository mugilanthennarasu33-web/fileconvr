import path from 'node:path';
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';
import { config } from '../config.js';

const candidate1 = path.resolve(process.cwd(), 'src/scripts/pdf_repair.py');
const candidate2 = path.resolve(process.cwd(), 'backend/src/scripts/pdf_repair.py');
const REPAIR_SCRIPT = existsSync(candidate1) ? candidate1 : candidate2;

export interface RepairResult {
  outputFilename: string;
  fileSizeBytes: number;
  originalSizeBytes: number;
  pageCount: number;
  mimeType: string;
  reconstructedPagesCount: number;
  statusMessage: string;
}

export class UnrecoverablePdfError extends Error {
  code: string;
  constructor(message: string, code: string = 'UNRECOVERABLE_PDF') {
    super(message);
    this.name = 'UnrecoverablePdfError';
    this.code = code;
  }
}

/**
 * Execute best-effort repair of damaged or structurally corrupted PDF files
 */
export async function repairPdf(filePath: string, taskDir: string): Promise<RepairResult> {
  // 1. Verify source file exists
  const origStat = await fs.stat(filePath);
  if (origStat.size < 10) {
    throw new UnrecoverablePdfError('Uploaded file is empty or too small to be a PDF.');
  }

  // 2. Prepare separate output file (preserves original uploaded file)
  const outputFilename = `fileconvr_repaired_${Date.now()}.pdf`;
  const outputPath = path.join(taskDir, outputFilename);

  // 3. Execute repair subprocess
  const resultJson = await new Promise<any>((resolve, reject) => {
    const python = spawn(config.pythonPath, [REPAIR_SCRIPT, filePath, outputPath]);

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    python.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    python.on('close', (code) => {
      try {
        const lastLine = stdout.trim().split('\n').filter(Boolean).pop();
        if (!lastLine) {
          return reject(new UnrecoverablePdfError(stderr || 'Repair process produced no output.'));
        }
        const parsed = JSON.parse(lastLine);
        if (code !== 0 || !parsed.success) {
          return reject(new UnrecoverablePdfError(parsed.message || stderr || 'Document repair was unsuccessful.', parsed.code || 'UNRECOVERABLE_PDF'));
        }
        resolve(parsed);
      } catch (err) {
        reject(new UnrecoverablePdfError(`Failed to parse repair result: ${stderr || (err as Error).message}`));
      }
    });

    python.on('error', (err) => {
      reject(new UnrecoverablePdfError(`Failed to start repair utility: ${err.message}`));
    });
  });

  // 4. Secondary validation: load with pdf-lib to ensure standard reader compatibility
  const repairedBytes = await fs.readFile(outputPath);
  let verifiedPageCount = resultJson.pageCount;

  try {
    const parsedPdf = await PDFDocument.load(repairedBytes, { ignoreEncryption: true });
    verifiedPageCount = parsedPdf.getPageCount();
    if (verifiedPageCount === 0) {
      throw new Error('Repaired PDF has 0 valid pages.');
    }
  } catch (err: any) {
    throw new UnrecoverablePdfError(`The recovered document could not be validated by standard PDF parsers: ${err.message}`);
  }

  const repairedStat = await fs.stat(outputPath);

  return {
    outputFilename,
    fileSizeBytes: repairedStat.size,
    originalSizeBytes: origStat.size,
    pageCount: verifiedPageCount,
    mimeType: 'application/pdf',
    reconstructedPagesCount: verifiedPageCount,
    statusMessage: resultJson.message || `Document repaired and validated (${verifiedPageCount} pages).`,
  };
}
