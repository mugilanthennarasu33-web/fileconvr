import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, degrees } from 'pdf-lib';
import { RotationAngle, RotationTarget } from '../types/index.js';
import { validatePdfHeader } from '../utils/validators.js';

export interface RotateResult {
  outputPath: string;
  outputFilename: string;
  fileSizeBytes: number;
  pageCount: number;
  rotatedPagesCount: number;
}

export async function rotatePdf(
  filePath: string,
  angle: RotationAngle,
  target: RotationTarget,
  outputDir: string
): Promise<RotateResult> {
  const isValid = await validatePdfHeader(filePath);
  if (!isValid) {
    throw new Error('Provided file is not a valid PDF.');
  }

  const fileBytes = await fs.readFile(filePath);
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(fileBytes);
  } catch (err: any) {
    throw new Error(`Failed to load PDF for rotation: ${err.message}`);
  }

  const pages = doc.getPages();
  let rotatedCount = 0;

  for (const page of pages) {
    const { width, height } = page.getSize();
    const isLandscape = width > height;
    const isPortrait = height >= width;

    let shouldRotate = false;
    if (target === 'all') {
      shouldRotate = true;
    } else if (target === 'landscape' && isLandscape) {
      shouldRotate = true;
    } else if (target === 'portrait' && isPortrait) {
      shouldRotate = true;
    }

    if (shouldRotate) {
      const currentRotation = page.getRotation().angle;
      const newRotation = (currentRotation + angle) % 360;
      page.setRotation(degrees(newRotation));
      rotatedCount++;
    }
  }

  const outputFilename = `fileconvr_rotated_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  const pdfBytes = await doc.save({ useObjectStreams: true });
  await fs.writeFile(outputPath, pdfBytes);

  const stats = await fs.stat(outputPath);

  return {
    outputPath,
    outputFilename,
    fileSizeBytes: stats.size,
    pageCount: pages.length,
    rotatedPagesCount: rotatedCount,
  };
}
