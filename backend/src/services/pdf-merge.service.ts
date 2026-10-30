import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { validatePdfHeader } from '../utils/validators.js';

export interface MergeResult {
  outputPath: string;
  outputFilename: string;
  fileSizeBytes: number;
  pageCount: number;
}

export async function mergePdfs(filePaths: string[], outputDir: string): Promise<MergeResult> {
  if (!filePaths || filePaths.length < 2) {
    throw new Error('Merging requires at least 2 PDF documents.');
  }

  // Validate all inputs before processing
  for (const filePath of filePaths) {
    const isValid = await validatePdfHeader(filePath);
    if (!isValid) {
      throw new Error(`File is not a valid PDF or has corrupted header: ${path.basename(filePath)}`);
    }
  }

  const mergedPdf = await PDFDocument.create();
  let totalPages = 0;

  for (const filePath of filePaths) {
    const fileBytes = await fs.readFile(filePath);
    let srcDoc: PDFDocument;
    try {
      srcDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: false });
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('encrypt')) {
        throw new Error(`Cannot merge password-protected PDF: ${path.basename(filePath)}. Please unlock it first.`);
      }
      throw new Error(`Failed to parse PDF ${path.basename(filePath)}: ${err.message}`);
    }

    const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
    for (const page of copiedPages) {
      mergedPdf.addPage(page);
      totalPages++;
    }
  }

  const outputFilename = `fileconvr_merged_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, outputFilename);

  // Save with object stream optimization
  const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
  await fs.writeFile(outputPath, mergedBytes);

  const stats = await fs.stat(outputPath);

  return {
    outputPath,
    outputFilename,
    fileSizeBytes: stats.size,
    pageCount: totalPages,
  };
}
