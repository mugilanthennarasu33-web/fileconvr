import fs from 'node:fs/promises';
import { z } from 'zod';

/**
 * Validates whether a file on disk begins with the standard PDF header magic bytes '%PDF-'.
 */
export async function validatePdfHeader(filePath: string): Promise<boolean> {
  const handle = await fs.open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(8);
    const { bytesRead } = await handle.read(buffer, 0, 8, 0);
    if (bytesRead < 5) return false;
    const header = buffer.toString('utf8', 0, 5);
    return header === '%PDF-';
  } catch {
    return false;
  } finally {
    await handle.close();
  }
}

/**
 * Parses page range string (e.g. "1-3, 5, 8-10") into a sorted array of 0-indexed page numbers.
 */
export function parsePageRanges(rangesStr: string, totalPages: number): number[] {
  if (!rangesStr || !rangesStr.trim()) {
    throw new Error('Page ranges string cannot be empty.');
  }

  const pagesSet = new Set<number>();
  const parts = rangesStr.split(',').map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
        throw new Error(`Invalid page range interval: "${part}". Must be format start-end where start >= 1 and end >= start.`);
      }

      for (let p = start; p <= end; p++) {
        if (p > totalPages) {
          throw new Error(`Page number ${p} exceeds document total of ${totalPages} pages.`);
        }
        pagesSet.add(p - 1); // convert to 0-indexed
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (isNaN(pageNum) || pageNum < 1) {
        throw new Error(`Invalid page number: "${part}". Page numbers must be integers >= 1.`);
      }
      if (pageNum > totalPages) {
        throw new Error(`Page number ${pageNum} exceeds document total of ${totalPages} pages.`);
      }
      pagesSet.add(pageNum - 1); // convert to 0-indexed
    }
  }

  const result = Array.from(pagesSet).sort((a, b) => a - b);
  if (result.length === 0) {
    throw new Error('No valid pages selected by range.');
  }

  return result;
}

/**
 * Validation schemas for tool parameters
 */
export const splitSchema = z.object({
  ranges: z.string().min(1, 'Page range or numbers must be provided (e.g. "1-3, 5")'),
  mode: z.enum(['range', 'extract']).default('range'),
  mergeResult: z.enum(['true', 'false']).transform((val) => val === 'true').default('true'),
});

export const rotateSchema = z.object({
  angle: z.enum(['90', '180', '270']).transform((val) => parseInt(val, 10) as 90 | 180 | 270),
  target: z.enum(['all', 'portrait', 'landscape']).default('all'),
});

export const compressSchema = z.object({
  level: z.enum(['extreme', 'recommended', 'low']).default('recommended'),
});

export const imgToPdfSchema = z.object({
  pageSize: z.enum(['fit', 'a4', 'letter']).default('fit'),
  orientation: z.enum(['portrait', 'landscape', 'auto']).default('auto'),
  margin: z.enum(['none', 'small', 'big']).default('none'),
});

export const organizeSchema = z.object({
  operations: z.union([
    z.string().transform((val) => {
      try {
        const parsed = JSON.parse(val);
        if (!Array.isArray(parsed)) throw new Error();
        return parsed;
      } catch {
        throw new Error('operations must be a valid JSON array of page operations');
      }
    }),
    z.array(
      z.object({
        originalIndex: z.number().int().min(0),
        rotation: z.number().int().optional(),
      })
    ),
  ]),
});

export const textWatermarkSchema = z.object({
  text: z.string().min(1, 'Watermark text cannot be empty'),
  fontSize: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
  color: z.string().optional(),
  opacity: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
  rotation: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
  position: z.enum([
    'top-left', 'top-center', 'top-right',
    'middle-left', 'middle-center', 'middle-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ]).default('middle-center'),
  pages: z.string().default('all'),
  layer: z.enum(['above', 'below']).default('above'),
});

export const imageWatermarkSchema = z.object({
  scale: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
  opacity: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
  rotation: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
  position: z.enum([
    'top-left', 'top-center', 'top-right',
    'middle-left', 'middle-center', 'middle-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ]).default('middle-center'),
  pages: z.string().default('all'),
  layer: z.enum(['above', 'below']).default('above'),
});

export const pageNumbersSchema = z.object({
  position: z.enum([
    'bottom-left', 'bottom-center', 'bottom-right',
    'top-left', 'top-center', 'top-right'
  ]).default('bottom-center'),
  format: z.enum(['number', 'page-n', 'page-n-of-total']).default('page-n-of-total'),
  startNumber: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  fontSize: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
  color: z.string().optional(),
  margin: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
  pages: z.string().default('all'),
  excludeFirstPage: z.union([z.string(), z.boolean()]).transform((val) => val === true || val === 'true').optional(),
});

export const protectSchema = z.object({
  password: z.string().min(1, 'Password cannot be empty'),
  ownerPassword: z.string().optional(),
});

export const unlockSchema = z.object({
  password: z.string().default(''),
});
