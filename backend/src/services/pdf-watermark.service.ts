import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { validatePdfHeader, parsePageRanges } from '../utils/validators.js';

export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type WatermarkPageSelection = 'all' | 'odd' | 'even' | string;

export interface TextWatermarkOptions {
  text: string;
  fontSize?: number;
  color?: string; // Hex string e.g. '#FF0000' or '#333333'
  opacity?: number; // 0.0 - 1.0
  rotation?: number; // degrees, e.g. 45
  position?: WatermarkPosition;
  pages?: WatermarkPageSelection;
  layer?: 'above' | 'below';
}

export interface ImageWatermarkOptions {
  imagePath: string;
  imageMimeType?: string;
  scale?: number; // 0.1 - 2.0
  opacity?: number; // 0.0 - 1.0
  rotation?: number; // degrees
  position?: WatermarkPosition;
  pages?: WatermarkPageSelection;
  layer?: 'above' | 'below';
}

export interface WatermarkResult {
  outputPath: string;
  outputFilename: string;
  fileSizeBytes: number;
  pageCount: number;
  watermarkedPagesCount: number;
}

function parseHexColor(hex: string = '#888888') {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16) / 255;
    const g = parseInt(cleanHex[1] + cleanHex[1], 16) / 255;
    const b = parseInt(cleanHex[2] + cleanHex[2], 16) / 255;
    return rgb(isNaN(r) ? 0.5 : r, isNaN(g) ? 0.5 : g, isNaN(b) ? 0.5 : b);
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    return rgb(isNaN(r) ? 0.5 : r, isNaN(g) ? 0.5 : g, isNaN(b) ? 0.5 : b);
  }
  return rgb(0.5, 0.5, 0.5);
}

function resolveTargetPages(selection: WatermarkPageSelection = 'all', totalPages: number): number[] {
  if (selection === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  if (selection === 'odd') {
    return Array.from({ length: totalPages }, (_, i) => i).filter((i) => (i + 1) % 2 !== 0);
  }
  if (selection === 'even') {
    return Array.from({ length: totalPages }, (_, i) => i).filter((i) => (i + 1) % 2 === 0);
  }
  // Custom range string e.g. "1-3, 5"
  return parsePageRanges(selection, totalPages);
}

function calculatePositionCoordinates(
  pageWidth: number,
  pageHeight: number,
  contentWidth: number,
  contentHeight: number,
  rotationAngleDeg: number,
  position: WatermarkPosition = 'middle-center',
  margin: number = 30
): { x: number; y: number } {
  const rad = (rotationAngleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const bbW = Math.abs(contentWidth * cos) + Math.abs(contentHeight * sin);
  const bbH = Math.abs(contentWidth * sin) + Math.abs(contentHeight * cos);

  const halfBbW = bbW / 2;
  const halfBbH = bbH / 2;

  let targetCenterX = pageWidth / 2;
  let targetCenterY = pageHeight / 2;

  // Horizontal alignment
  if (position.includes('left')) {
    targetCenterX = Math.min(pageWidth / 2, margin + halfBbW);
  } else if (position.includes('right')) {
    targetCenterX = Math.max(pageWidth / 2, pageWidth - margin - halfBbW);
  }

  // Vertical alignment
  if (position.startsWith('top')) {
    targetCenterY = Math.max(pageHeight / 2, pageHeight - margin - halfBbH);
  } else if (position.startsWith('bottom')) {
    targetCenterY = Math.min(pageHeight / 2, margin + halfBbH);
  }

  // Back-calculate (x, y) so that center after rotation lands on (targetCenterX, targetCenterY)
  const x = targetCenterX - ((contentWidth / 2) * cos - (contentHeight / 2) * sin);
  const y = targetCenterY - ((contentWidth / 2) * sin + (contentHeight / 2) * cos);

  return { x, y };
}

/**
 * Apply text watermark to PDF
 */
export async function applyTextWatermark(
  pdfPath: string,
  options: TextWatermarkOptions,
  outputDir: string
): Promise<WatermarkResult> {
  const isValid = await validatePdfHeader(pdfPath);
  if (!isValid) {
    throw new Error('Provided file is not a valid PDF.');
  }

  if (!options.text || !options.text.trim()) {
    throw new Error('Watermark text cannot be empty.');
  }

  const fileBytes = await fs.readFile(pdfPath);
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(fileBytes);
  } catch (err: any) {
    throw new Error(`Failed to load PDF for watermarking: ${err.message}`);
  }

  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontSize = options.fontSize && options.fontSize > 0 ? options.fontSize : 36;
  const color = parseHexColor(options.color || '#e11d48');
  const opacity = options.opacity !== undefined ? Math.max(0.01, Math.min(1, options.opacity)) : 0.3;
  const rotationAngle = options.rotation !== undefined ? options.rotation : 45;
  const position = options.position || 'middle-center';

  const totalPages = doc.getPageCount();
  const targetPages = resolveTargetPages(options.pages, totalPages);

  const textWidth = font.widthOfTextAtSize(options.text, fontSize);
  const textHeight = font.heightAtSize(fontSize);

  for (const pageIdx of targetPages) {
    const page = doc.getPage(pageIdx);
    const { width: pWidth, height: pHeight } = page.getSize();

    const { x, y } = calculatePositionCoordinates(
      pWidth,
      pHeight,
      textWidth,
      textHeight,
      rotationAngle,
      position,
      30
    );

    page.drawText(options.text, {
      x,
      y,
      size: fontSize,
      font,
      color,
      opacity,
      rotate: degrees(rotationAngle),
    });
  }

  const outputFilename = `fileconvr_watermarked_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  const pdfBytes = await doc.save({ useObjectStreams: true });
  await fs.writeFile(outputPath, pdfBytes);

  const stats = await fs.stat(outputPath);

  return {
    outputPath,
    outputFilename,
    fileSizeBytes: stats.size,
    pageCount: totalPages,
    watermarkedPagesCount: targetPages.length,
  };
}

/**
 * Apply image watermark to PDF
 */
export async function applyImageWatermark(
  pdfPath: string,
  imagePath: string,
  options: ImageWatermarkOptions,
  outputDir: string
): Promise<WatermarkResult> {
  const isValidPdf = await validatePdfHeader(pdfPath);
  if (!isValidPdf) {
    throw new Error('Provided file is not a valid PDF.');
  }

  const pdfBytes = await fs.readFile(pdfPath);
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(pdfBytes);
  } catch (err: any) {
    throw new Error(`Failed to load PDF for watermarking: ${err.message}`);
  }

  const imageBytes = await fs.readFile(imagePath);
  const ext = path.extname(imagePath).toLowerCase();

  let embeddedImage;
  try {
    if (ext === '.png') {
      embeddedImage = await doc.embedPng(imageBytes);
    } else if (ext === '.jpg' || ext === '.jpeg') {
      embeddedImage = await doc.embedJpg(imageBytes);
    } else {
      // Try png then jpg
      try {
        embeddedImage = await doc.embedPng(imageBytes);
      } catch {
        embeddedImage = await doc.embedJpg(imageBytes);
      }
    }
  } catch (err: any) {
    throw new Error(`Failed to decode watermark image. Only valid PNG and JPEG images are supported: ${err.message}`);
  }

  const scale = options.scale !== undefined && options.scale > 0 ? options.scale : 0.5;
  const opacity = options.opacity !== undefined ? Math.max(0.01, Math.min(1, options.opacity)) : 0.35;
  const rotationAngle = options.rotation !== undefined ? options.rotation : 0;
  const position = options.position || 'middle-center';

  const origWidth = embeddedImage.width;
  const origHeight = embeddedImage.height;

  const totalPages = doc.getPageCount();
  const targetPages = resolveTargetPages(options.pages, totalPages);

  for (const pageIdx of targetPages) {
    const page = doc.getPage(pageIdx);
    const { width: pWidth, height: pHeight } = page.getSize();

    // Scale image relative to page size, capped by scale parameter
    const maxAllowedWidth = pWidth * 0.7 * scale;
    const maxAllowedHeight = pHeight * 0.7 * scale;
    const scaleFactor = Math.min(maxAllowedWidth / origWidth, maxAllowedHeight / origHeight, scale);

    const imgWidth = origWidth * scaleFactor;
    const imgHeight = origHeight * scaleFactor;

    const { x, y } = calculatePositionCoordinates(
      pWidth,
      pHeight,
      imgWidth,
      imgHeight,
      rotationAngle,
      position,
      30
    );

    page.drawImage(embeddedImage, {
      x,
      y,
      width: imgWidth,
      height: imgHeight,
      opacity,
      rotate: degrees(rotationAngle),
    });
  }

  const outputFilename = `fileconvr_watermarked_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  const savedBytes = await doc.save({ useObjectStreams: true });
  await fs.writeFile(outputPath, savedBytes);

  const stats = await fs.stat(outputPath);

  return {
    outputPath,
    outputFilename,
    fileSizeBytes: stats.size,
    pageCount: totalPages,
    watermarkedPagesCount: targetPages.length,
  };
}
