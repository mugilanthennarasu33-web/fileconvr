import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, degrees } from 'pdf-lib';
import { validatePdfHeader } from '../utils/validators.js';

export interface PageOperation {
  originalIndex: number;
  rotation?: number; // 0, 90, 180, 270
}

export interface OrganizeResult {
  outputPath: string;
  outputFilename: string;
  fileSizeBytes: number;
  pageCount: number;
  originalPageCount: number;
}

export async function organizePdf(
  filePath: string,
  operations: PageOperation[],
  outputDir: string
): Promise<OrganizeResult> {
  const isValid = await validatePdfHeader(filePath);
  if (!isValid) {
    throw new Error('Provided file is not a valid PDF.');
  }

  if (!operations || !Array.isArray(operations) || operations.length === 0) {
    throw new Error('Operations list cannot be empty. At least one page must remain in the document.');
  }

  const fileBytes = await fs.readFile(filePath);
  let sourceDoc: PDFDocument;
  try {
    sourceDoc = await PDFDocument.load(fileBytes);
  } catch (err: any) {
    throw new Error(`Failed to load source PDF: ${err.message}`);
  }

  const originalPageCount = sourceDoc.getPageCount();
  if (originalPageCount === 0) {
    throw new Error('The uploaded PDF has no pages.');
  }

  // Validate all operations
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    if (typeof op.originalIndex !== 'number' || !Number.isInteger(op.originalIndex)) {
      throw new Error(`Invalid page operation at index ${i}: originalIndex must be an integer.`);
    }
    if (op.originalIndex < 0 || op.originalIndex >= originalPageCount) {
      throw new Error(
        `Invalid page index ${op.originalIndex} at operation index ${i}. Document only contains ${originalPageCount} pages (0-${originalPageCount - 1}).`
      );
    }
    if (op.rotation !== undefined) {
      if (typeof op.rotation !== 'number' || !Number.isInteger(op.rotation)) {
        throw new Error(`Invalid rotation value at operation index ${i}. Must be an integer angle.`);
      }
    }
  }

  // Create new destination document and copy pages in the specified order
  const destDoc = await PDFDocument.create();

  for (const op of operations) {
    const [copiedPage] = await destDoc.copyPages(sourceDoc, [op.originalIndex]);
    if (op.rotation) {
      const currentRotation = copiedPage.getRotation().angle;
      const combined = (((currentRotation + op.rotation) % 360) + 360) % 360;
      copiedPage.setRotation(degrees(combined));
    }
    destDoc.addPage(copiedPage);
  }

  const outputFilename = `fileconvr_organized_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  const pdfBytes = await destDoc.save({ useObjectStreams: true });
  await fs.writeFile(outputPath, pdfBytes);

  const stats = await fs.stat(outputPath);

  return {
    outputPath,
    outputFilename,
    fileSizeBytes: stats.size,
    pageCount: destDoc.getPageCount(),
    originalPageCount,
  };
}
