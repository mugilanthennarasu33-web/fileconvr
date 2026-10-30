import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { config } from '../config.js';
import { validatePdfHeader } from '../utils/validators.js';

export interface PdfToWordResult {
  outputPath: string;
  outputFilename: string;
  fileSizeBytes: number;
  pageCount: number;
  isScanned: boolean;
  ocrRequired: boolean;
  notes?: string;
}

export async function convertPdfToWord(
  inputPdfPath: string,
  outputDir: string
): Promise<PdfToWordResult> {
  const isValidPdf = await validatePdfHeader(inputPdfPath);
  if (!isValidPdf) {
    throw new Error('The uploaded file is not a valid PDF or has corrupted headers.');
  }

  const outputFilename = `fileconvr_converted_${Date.now()}.docx`;
  const outputPath = path.join(outputDir, outputFilename);

  // Resolve Python script path safely
  const candidatePath1 = path.resolve(process.cwd(), 'scripts/convert_pdf_to_word.py');
  const candidatePath2 = path.resolve(process.cwd(), 'backend/scripts/convert_pdf_to_word.py');
  const scriptPath = existsSync(candidatePath1) ? candidatePath1 : candidatePath2;

  // Parameterized process execution: array arguments prevents shell injection
  const args = [scriptPath, inputPdfPath, outputPath];

  const executionResult = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    execFile(config.pythonPath, args, { timeout: 60000 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`PDF to Word engine failed: ${error.message}. ${stderr || stdout}`));
      } else {
        resolve({ stdout, stderr });
      }
    });
  });

  let parsedOutput: {
    success: boolean;
    pageCount?: number;
    totalTextLength?: number;
    isScanned?: boolean;
    ocrRequired?: boolean;
    error?: string;
  };

  try {
    // Find JSON line in stdout (in case fitz printed deprecation warnings)
    const lines = executionResult.stdout.trim().split('\n');
    const jsonLine = lines.reverse().find((l) => l.trim().startsWith('{') && l.trim().endsWith('}'));
    if (!jsonLine) {
      throw new Error(`Invalid engine output: ${executionResult.stdout}`);
    }
    parsedOutput = JSON.parse(jsonLine);
  } catch (parseErr: any) {
    throw new Error(`Failed to parse conversion result: ${parseErr.message}`);
  }

  if (!parsedOutput.success) {
    throw new Error(parsedOutput.error || 'Unknown failure during PDF to Word conversion.');
  }

  const stats = await fs.stat(outputPath);

  let notes: string | undefined;
  if (parsedOutput.ocrRequired) {
    notes =
      'Document appears to be scanned or contains image-only text layers. Text was not directly selectable, so OCR processing (Milestone 5) is recommended for editable text layers.';
  }

  return {
    outputPath,
    outputFilename,
    fileSizeBytes: stats.size,
    pageCount: parsedOutput.pageCount || 1,
    isScanned: parsedOutput.isScanned || false,
    ocrRequired: parsedOutput.ocrRequired || false,
    notes,
  };
}
