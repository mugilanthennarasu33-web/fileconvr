import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { ImageMargin, ImageOrientation, ImagePageSize } from '../types/index.js';

export interface ImgToPdfOptions {
  pageSize: ImagePageSize;
  orientation: ImageOrientation;
  margin: ImageMargin;
}

export interface ImgToPdfResult {
  outputPath: string;
  outputFilename: string;
  fileSizeBytes: number;
  pageCount: number;
}

export async function convertImagesToPdf(
  imagePaths: string[],
  options: ImgToPdfOptions,
  outputDir: string
): Promise<ImgToPdfResult> {
  if (!imagePaths || imagePaths.length === 0) {
    throw new Error('At least one image is required for conversion.');
  }

  const doc = await PDFDocument.create();

  // Margins in points (72 points = 1 inch)
  const marginPt = options.margin === 'big' ? 40 : options.margin === 'small' ? 20 : 0;

  for (const imgPath of imagePaths) {
    const rawBuffer = await fs.readFile(imgPath);
    // Normalize image to PNG or JPEG using sharp to ensure clean format and valid color profiles
    const meta = await sharp(rawBuffer).metadata();
    const isPng = meta.format === 'png';

    let normalizedBuffer: Buffer;
    if (isPng) {
      normalizedBuffer = await sharp(rawBuffer).png().toBuffer();
    } else {
      normalizedBuffer = await sharp(rawBuffer).jpeg({ quality: 95 }).toBuffer();
    }

    const embeddedImage = isPng
      ? await doc.embedPng(normalizedBuffer)
      : await doc.embedJpg(normalizedBuffer);

    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    let pageWidth = imgWidth + marginPt * 2;
    let pageHeight = imgHeight + marginPt * 2;

    if (options.pageSize === 'a4') {
      pageWidth = 595.28;
      pageHeight = 841.89;
    } else if (options.pageSize === 'letter') {
      pageWidth = 612.0;
      pageHeight = 792.0;
    }

    // Determine orientation
    let applyLandscape = false;
    if (options.orientation === 'landscape') {
      applyLandscape = true;
    } else if (options.orientation === 'auto') {
      applyLandscape = imgWidth > imgHeight;
    }

    if (options.pageSize !== 'fit') {
      if (applyLandscape && pageWidth < pageHeight) {
        // Swap for landscape
        const temp = pageWidth;
        pageWidth = pageHeight;
        pageHeight = temp;
      } else if (!applyLandscape && pageWidth > pageHeight) {
        // Swap for portrait
        const temp = pageWidth;
        pageWidth = pageHeight;
        pageHeight = temp;
      }
    }

    const page = doc.addPage([pageWidth, pageHeight]);

    // Calculate dimensions to fit inside page with margins
    const availableWidth = pageWidth - marginPt * 2;
    const availableHeight = pageHeight - marginPt * 2;

    const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    // Center image on the page
    const x = marginPt + (availableWidth - scaledWidth) / 2;
    const y = marginPt + (availableHeight - scaledHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight,
    });
  }

  const outputFilename = `fileconvr_images_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  const pdfBytes = await doc.save({ useObjectStreams: true });
  await fs.writeFile(outputPath, pdfBytes);

  const stats = await fs.stat(outputPath);

  return {
    outputPath,
    outputFilename,
    fileSizeBytes: stats.size,
    pageCount: imagePaths.length,
  };
}
