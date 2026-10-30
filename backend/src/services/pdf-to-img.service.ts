import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { pdf } from 'pdf-to-img';
import sharp from 'sharp';
import archiver from 'archiver';
import { validatePdfHeader } from '../utils/validators.js';

export interface PdfToImgResult {
  outputPath: string;
  outputFilename: string;
  fileSizeBytes: number;
  mimeType: string;
  pageCount: number;
}

export async function convertPdfToImages(
  pdfPath: string,
  outputDir: string,
  scale: number = 2.0
): Promise<PdfToImgResult> {
  const isValid = await validatePdfHeader(pdfPath);
  if (!isValid) {
    throw new Error('Provided file is not a valid PDF.');
  }

  const pdfBuffer = await fs.readFile(pdfPath);
  const doc = await pdf(pdfBuffer, { scale });

  const imageBuffers: Buffer[] = [];
  for await (const pageImg of doc) {
    // Re-encode through sharp for clean JPEG compression
    const jpgBuffer = await sharp(pageImg).jpeg({ quality: 90 }).toBuffer();
    imageBuffers.push(jpgBuffer);
  }

  if (imageBuffers.length === 0) {
    throw new Error('No pages were found to convert in the PDF document.');
  }

  if (imageBuffers.length === 1) {
    // Single page output: deliver single .jpg directly
    const outputFilename = `fileconvr_page_1_${Date.now()}.jpg`;
    const outputPath = path.join(outputDir, outputFilename);
    await fs.writeFile(outputPath, imageBuffers[0]);

    const stats = await fs.stat(outputPath);
    return {
      outputPath,
      outputFilename,
      fileSizeBytes: stats.size,
      mimeType: 'image/jpeg',
      pageCount: 1,
    };
  } else {
    // Multiple pages: package into a ZIP archive
    const zipFilename = `fileconvr_pages_${Date.now()}.zip`;
    const zipPath = path.join(outputDir, zipFilename);
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    const archivePromise = new Promise<void>((resolve, reject) => {
      output.on('close', () => resolve());
      archive.on('error', (err) => reject(err));
    });

    archive.pipe(output);

    for (let i = 0; i < imageBuffers.length; i++) {
      archive.append(imageBuffers[i], { name: `page-${i + 1}.jpg` });
    }

    await archive.finalize();
    await archivePromise;

    const stats = await fs.stat(zipPath);
    return {
      outputPath: zipPath,
      outputFilename: zipFilename,
      fileSizeBytes: stats.size,
      mimeType: 'application/zip',
      pageCount: imageBuffers.length,
    };
  }
}
