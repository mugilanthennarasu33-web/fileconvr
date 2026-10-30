import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { config } from '../config.js';
import { validatePdfHeader } from '../utils/validators.js';

export interface ProtectOptions {
  password: string;
  ownerPassword?: string;
}

export interface ProtectResult {
  outputPath: string;
  outputFilename: string;
  fileSizeBytes: number;
  pageCount: number;
  encryptionStandard: string;
  isProtected: boolean;
}

export async function protectPdf(
  inputPdfPath: string,
  options: ProtectOptions,
  outputDir: string
): Promise<ProtectResult> {
  const isValid = await validatePdfHeader(inputPdfPath);
  if (!isValid) {
    throw new Error('Provided file is not a valid PDF.');
  }

  if (!options.password || options.password.trim().length === 0) {
    throw new Error('Password cannot be empty.');
  }

  const outputFilename = `fileconvr_protected_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  const candidatePath1 = path.resolve(process.cwd(), 'scripts/protect_pdf.py');
  const candidatePath2 = path.resolve(process.cwd(), 'backend/scripts/protect_pdf.py');
  const scriptPath = existsSync(candidatePath1) ? candidatePath1 : candidatePath2;

  const payload = {
    inputPath: inputPdfPath,
    outputPath,
    password: options.password,
    ownerPassword: options.ownerPassword || options.password,
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
        reject(new Error(`Failed to start encryption engine: ${err.message}`));
      });

      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(stderr || stdout || `Encryption failed with code ${code}`));
        } else {
          resolve({ stdout, stderr });
        }
      });

      // Pass sensitive password strictly through stdin to prevent CLI process exposure
      child.stdin.write(JSON.stringify(payload));
      child.stdin.end();
    });

    let parsed: {
      success: boolean;
      pageCount?: number;
      encryptionStandard?: string;
      isProtected?: boolean;
      error?: string;
    };

    try {
      const lines = executionResult.stdout.trim().split('\n');
      const jsonLine = lines.reverse().find((l) => l.trim().startsWith('{') && l.trim().endsWith('}'));
      if (!jsonLine) {
        throw new Error(`Invalid output from encryption engine: ${executionResult.stdout}`);
      }
      parsed = JSON.parse(jsonLine);
    } catch (err: any) {
      throw new Error(`Failed to parse encryption result: ${err.message}`);
    }

    if (!parsed.success) {
      throw new Error(parsed.error || 'Failed to password protect PDF.');
    }

    const stats = await fs.stat(outputPath);

    return {
      outputPath,
      outputFilename,
      fileSizeBytes: stats.size,
      pageCount: parsed.pageCount || 0,
      encryptionStandard: parsed.encryptionStandard || 'AES-256',
      isProtected: true,
    };
  } finally {
    // Proactively overwrite payload and clear sensitive strings from memory
    (payload as any).password = '';
    (payload as any).ownerPassword = '';
  }
}
