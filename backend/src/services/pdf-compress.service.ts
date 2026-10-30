import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, PDFRawStream, PDFName, PDFNumber } from 'pdf-lib';
import sharp from 'sharp';
import { CompressionLevel } from '../types/index.js';
import { validatePdfHeader } from '../utils/validators.js';

export interface CompressResult {
  outputPath: string;
  outputFilename: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  savedPercentage: number;
  compressionLevel: CompressionLevel;
}

export async function compressPdf(
  filePath: string,
  level: CompressionLevel,
  outputDir: string
): Promise<CompressResult> {
  const isValid = await validatePdfHeader(filePath);
  if (!isValid) {
    throw new Error('Provided file is not a valid PDF.');
  }

  const originalStats = await fs.stat(filePath);
  const originalSizeBytes = originalStats.size;

  const fileBytes = await fs.readFile(filePath);
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(fileBytes);
  } catch (err: any) {
    throw new Error(`Failed to load PDF for compression: ${err.message}`);
  }

  // Strip non-essential document info & metadata
  doc.setTitle('');
  doc.setAuthor('');
  doc.setSubject('');
  doc.setKeywords([]);
  doc.setProducer('fileconvr Engine');
  doc.setCreator('fileconvr Optimizer');

  // Image optimization parameters based on level
  const shouldOptimizeImages = level === 'extreme' || level === 'recommended';
  const maxWidth = level === 'extreme' ? 1200 : 1600;
  const jpegQuality = level === 'extreme' ? 60 : 75;

  if (shouldOptimizeImages) {
    const indirectObjects = doc.context.enumerateIndirectObjects();
    for (const [_ref, obj] of indirectObjects) {
      if (obj instanceof PDFRawStream) {
        const dict = obj.dict;
        const subtype = dict.get(PDFName.of('Subtype'));
        const filter = dict.get(PDFName.of('Filter'));

        // Check if object is an Image stream
        if (subtype === PDFName.of('Image')) {
          const isJpeg = filter === PDFName.of('DCTDecode');
          if (isJpeg) {
            try {
              const rawBytes = obj.contents;
              const metadata = await sharp(rawBytes).metadata();
              if (metadata.width && (metadata.width > maxWidth || metadata.format === 'jpeg')) {
                let pipeline = sharp(rawBytes);
                if (metadata.width > maxWidth) {
                  pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
                }
                const compressedBuffer = await pipeline.jpeg({ quality: jpegQuality, progressive: true }).toBuffer();

                // Only replace if the compressed version is actually smaller
                if (compressedBuffer.length < rawBytes.length) {
                  const newMeta = await sharp(compressedBuffer).metadata();
                  (obj as any).contents = compressedBuffer;
                  if (newMeta.width) dict.set(PDFName.of('Width'), PDFNumber.of(newMeta.width));
                  if (newMeta.height) dict.set(PDFName.of('Height'), PDFNumber.of(newMeta.height));
                  dict.set(PDFName.of('Length'), PDFNumber.of(compressedBuffer.length));
                }
              }
            } catch {
              // If an image stream cannot be decoded by sharp, safely keep original stream
            }
          }
        }
      }
    }
  }

  // Save with compressed object streams
  const compressedBytes = await doc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  const outputFilename = `fileconvr_compressed_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  // If the compressed output is smaller or equal, write it.
  // If original was somehow smaller (rare edge case with tiny pure vector PDFs), preserve best size.
  let finalBytes = compressedBytes;
  if (compressedBytes.length > originalSizeBytes && level === 'low') {
    finalBytes = fileBytes;
  }

  await fs.writeFile(outputPath, finalBytes);
  const finalStats = await fs.stat(outputPath);
  const compressedSizeBytes = finalStats.size;

  const savedBytes = Math.max(0, originalSizeBytes - compressedSizeBytes);
  const savedPercentage = originalSizeBytes > 0
    ? Math.round((savedBytes / originalSizeBytes) * 1000) / 10
    : 0;

  return {
    outputPath,
    outputFilename,
    originalSizeBytes,
    compressedSizeBytes,
    savedPercentage,
    compressionLevel: level,
  };
}
