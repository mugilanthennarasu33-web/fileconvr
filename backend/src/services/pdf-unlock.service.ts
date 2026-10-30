import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { config } from '../config.js';
import { validatePdfHeader } from '../utils/validators.js';

export interface UnlockResult {
  outputPath: string;
  outputFilename: string;
  fileSizeBytes: number;
  pageCount: number;
  wasEncrypted: boolean;
  unlocked: boolean;
}

export class IncorrectPasswordError extends Error {
  constructor(message: string = 'Authentication failed: Incorrect password provided for this document.') {
    super(message);
    this.name = 'IncorrectPasswordError';
  }
}

export async function unlockPdf(
  inputPdfPath: string,
  password: string = '',
  outputDir: string
): Promise<UnlockResult> {
  const isValid = await validatePdfHeader(inputPdfPath);
  if (!isValid) {
    throw new Error('Provided file is not a valid PDF.');
  }

  const outputFilename = `fileconvr_unlocked_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  const candidatePath1 = path.resolve(process.cwd(), 'scripts/unlock_pdf.py');
  const candidatePath2 = path.resolve(process.cwd(), 'backend/scripts/unlock_pdf.py');
  const scriptPath = existsSync(candidatePath1) ? candidatePath1 : candidatePath2;

  const payload = {
    inputPath: inputPdfPath,
    outputPath,
    password: password || '',
  };

  try {
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
        reject(new Error(`Failed to start decryption engine: ${err.message}`));
      });

      child.on('close', (code) => {
        // Note: exit code 1 might carry an authError JSON in stdout
        resolve({ stdout, stderr });
      });

      // Pass sensitive password strictly through stdin
      child.stdin.write(JSON.stringify(payload));
      child.stdin.end();
    });

    let parsed: {
      success: boolean;
      pageCount?: number;
      wasEncrypted?: boolean;
      unlocked?: boolean;
      authError?: boolean;
      error?: string;
    };

    try {
      const lines = executionResult.stdout.trim().split('\n');
      const jsonLine = lines.reverse().find((l) => l.trim().startsWith('{') && l.trim().endsWith('}'));
      if (!jsonLine) {
        throw new Error(`Invalid output from decryption engine: ${executionResult.stdout || executionResult.stderr}`);
      }
      parsed = JSON.parse(jsonLine);
    } catch (err: any) {
      throw new Error(`Failed to parse decryption result: ${err.message}`);
    }

    if (!parsed.success) {
      if (parsed.authError) {
        throw new IncorrectPasswordError(parsed.error);
      }
      throw new Error(parsed.error || 'Failed to unlock PDF.');
    }

    const stats = await fs.stat(outputPath);

    return {
      outputPath,
      outputFilename,
      fileSizeBytes: stats.size,
      pageCount: parsed.pageCount || 0,
      wasEncrypted: parsed.wasEncrypted ?? true,
      unlocked: true,
    };
  } finally {
    // Proactively clear sensitive password strings from memory
    (payload as any).password = '';
  }
}
