import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import archiver from 'archiver';
import { parsePageRanges, validatePdfHeader } from '../utils/validators.js';

export interface SplitResult {
  outputPath: string;
  outputFilename: string;
  fileSizeBytes: number;
  mimeType: string;
  pageCount: number;
}

export async function splitPdf(
  filePath: string,
  rangesStr: string,
  mergeResult: boolean,
  outputDir: string
): Promise<SplitResult> {
  const isValid = await validatePdfHeader(filePath);
  if (!isValid) {
    throw new Error('Provided file is not a valid PDF.');
  }

  const fileBytes = await fs.readFile(filePath);
  let srcDoc: PDFDocument;
  try {
    srcDoc = await PDFDocument.load(fileBytes);
  } catch (err: any) {
    throw new Error(`Failed to load PDF for splitting: ${err.message}`);
  }

  const totalPages = srcDoc.getPageCount();
  if (totalPages === 0) {
    throw new Error('PDF document has no pages.');
  }

  // Parse page ranges
  const selectedIndices = parsePageRanges(rangesStr, totalPages);

  if (mergeResult || selectedIndices.length === 1) {
    // Generate a single PDF with all selected pages
    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, selectedIndices);
    for (const page of copiedPages) {
      newDoc.addPage(page);
    }

    const outputFilename = `fileconvr_split_${Date.now()}.pdf`;
    const outputPath = path.join(outputDir, outputFilename);
    const pdfBytes = await newDoc.save({ useObjectStreams: true });
    await fs.writeFile(outputPath, pdfBytes);

    const stats = await fs.stat(outputPath);
    return {
      outputPath,
      outputFilename,
      fileSizeBytes: stats.size,
      mimeType: 'application/pdf',
      pageCount: selectedIndices.length,
    };
  } else {
    // Create individual PDFs and package them into a ZIP archive
    const zipFilename = `fileconvr_split_${Date.now()}.zip`;
    const zipPath = path.join(outputDir, zipFilename);
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    const archivePromise = new Promise<void>((resolve, reject) => {
      output.on('close', () => resolve());
      archive.on('error', (err) => reject(err));
    });

    archive.pipe(output);

    for (let i = 0; i < selectedIndices.length; i++) {
      const pageIdx = selectedIndices[i];
      const singleDoc = await PDFDocument.create();
      const [copiedPage] = await singleDoc.copyPages(srcDoc, [pageIdx]);
      singleDoc.addPage(copiedPage);
      const singleBytes = await singleDoc.save({ useObjectStreams: true });
      archive.append(Buffer.from(singleBytes), { name: `page_${pageIdx + 1}.pdf` });
    }

    await archive.finalize();
    await archivePromise;

    const stats = await fs.stat(zipPath);
    return {
      outputPath: zipPath,
      outputFilename: zipFilename,
      fileSizeBytes: stats.size,
      mimeType: 'application/zip',
      pageCount: selectedIndices.length,
    };
  }
}
