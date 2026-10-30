import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { config } from '../config.js';
import { validatePdfHeader } from '../utils/validators.js';

export type PageNumberPosition =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'top-left'
  | 'top-center'
  | 'top-right';

export type PageNumberFormat = 'number' | 'page-n' | 'page-n-of-total';

export interface PageNumbersOptions {
  position?: PageNumberPosition;
  format?: PageNumberFormat;
  startNumber?: number;
  prefix?: string;
  suffix?: string;
  fontSize?: number;
  color?: string; // hex string e.g. '#333333'
  margin?: number;
  pages?: string; // 'all', 'odd', 'even', or custom '1-3, 5'
  excludeFirstPage?: boolean;
}

export interface PageNumbersResult {
  outputPath: string;
  outputFilename: string;
  fileSizeBytes: number;
  pageCount: number;
  numberedPagesCount: number;
}

export async function addPageNumbers(
  inputPdfPath: string,
  options: PageNumbersOptions,
  outputDir: string
): Promise<PageNumbersResult> {
  const isValid = await validatePdfHeader(inputPdfPath);
  if (!isValid) {
    throw new Error('Provided file is not a valid PDF.');
  }

  const outputFilename = `fileconvr_numbered_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  const candidatePath1 = path.resolve(process.cwd(), 'scripts/add_page_numbers.py');
  const candidatePath2 = path.resolve(process.cwd(), 'backend/scripts/add_page_numbers.py');
  const scriptPath = existsSync(candidatePath1) ? candidatePath1 : candidatePath2;

  const payload = {
    inputPath: inputPdfPath,
    outputPath,
    position: options.position || 'bottom-center',
    format: options.format || 'page-n-of-total',
    startNumber: options.startNumber !== undefined ? options.startNumber : 1,
    prefix: options.prefix || '',
    suffix: options.suffix || '',
    fontSize: options.fontSize || 10,
    color: options.color || '#333333',
    margin: options.margin || 25,
    pages: options.pages || 'all',
    excludeFirstPage: Boolean(options.excludeFirstPage),
  };

  const executionResult = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(config.pythonPath, [scriptPath], { timeout: 30000 });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to start page numbering engine: ${err.message}`));
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Page numbering engine failed (exit code ${code}): ${stderr || stdout}`));
      } else {
        resolve({ stdout, stderr });
      }
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });

  let parsed: {
    success: boolean;
    pageCount?: number;
    numberedPagesCount?: number;
    error?: string;
  };

  try {
    const lines = executionResult.stdout.trim().split('\n');
    const jsonLine = lines.reverse().find((l) => l.trim().startsWith('{') && l.trim().endsWith('}'));
    if (!jsonLine) {
      throw new Error(`Invalid output from page numbering engine: ${executionResult.stdout}`);
    }
    parsed = JSON.parse(jsonLine);
  } catch (err: any) {
    throw new Error(`Failed to parse page numbering result: ${err.message}`);
  }

  if (!parsed.success) {
    throw new Error(parsed.error || 'Failed to add page numbers.');
  }

  const stats = await fs.stat(outputPath);

  return {
    outputPath,
    outputFilename,
    fileSizeBytes: stats.size,
    pageCount: parsed.pageCount || 0,
    numberedPagesCount: parsed.numberedPagesCount || 0,
  };
}
