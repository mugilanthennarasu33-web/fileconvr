import { Router, Request, Response, NextFunction } from 'express';
import path from 'node:path';
import {
  pdfUpload,
  imageUpload,
  wordUpload,
  excelUpload,
  pptUpload,
  watermarkUpload,
} from '../middleware/upload.js';
import { mergePdfs } from '../services/pdf-merge.service.js';
import { splitPdf } from '../services/pdf-split.service.js';
import { rotatePdf } from '../services/pdf-rotate.service.js';
import { compressPdf } from '../services/pdf-compress.service.js';
import { convertImagesToPdf } from '../services/img-to-pdf.service.js';
import { convertPdfToImages } from '../services/pdf-to-img.service.js';
import { convertWordToPdf } from '../services/word-to-pdf.service.js';
import { convertExcelToPdf } from '../services/excel-to-pdf.service.js';
import { convertPptToPdf } from '../services/ppt-to-pdf.service.js';
import { convertPdfToWord } from '../services/pdf-to-word.service.js';
import { organizePdf } from '../services/pdf-organize.service.js';
import { applyTextWatermark, applyImageWatermark } from '../services/pdf-watermark.service.js';
import { addPageNumbers } from '../services/pdf-page-numbers.service.js';
import { protectPdf } from '../services/pdf-protect.service.js';
import { unlockPdf, IncorrectPasswordError } from '../services/pdf-unlock.service.js';
import { repairPdf, UnrecoverablePdfError } from '../services/pdf-repair.service.js';
import { ocrPdf, OcrError, SUPPORTED_OCR_LANGUAGES } from '../services/pdf-ocr.service.js';
import { comparePdfs, CompareError } from '../services/pdf-compare.service.js';
import {
  summarizePdf,
  askPdf,
  AiError,
  AiProviderNotConfiguredError,
  ScannedDocumentDetectedError,
} from '../services/pdf-ai.service.js';
import {
  splitSchema,
  rotateSchema,
  compressSchema,
  imgToPdfSchema,
  organizeSchema,
  textWatermarkSchema,
  imageWatermarkSchema,
  pageNumbersSchema,
  protectSchema,
  unlockSchema,
} from '../utils/validators.js';
import { resolveSafePath, fileExists } from '../utils/storage.js';
import { ApiSuccessResponse, ProcessedFileInfo } from '../types/index.js';
import { executeTrackedJob } from '../services/job-tracker.js';
import { db } from '../db/index.js';

const router = Router();

/**
 * POST /api/pdf/merge
 * Merges 2 or more PDF documents.
 */
router.post(
  '/merge',
  pdfUpload.array('files', 25),
  async (req: Request, res: Response<ApiSuccessResponse<ProcessedFileInfo>>, next: NextFunction) => {
    try {
      if ((req as any).fileValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: (req as any).fileValidationError,
          },
        } as any);
        return;
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length < 2) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_FILES',
            message: 'Merging requires at least 2 PDF files to be uploaded.',
          },
        } as any);
        return;
      }

      const taskId = req.taskId!;
      const taskDir = req.taskDir!;
      const filePaths = files.map((f) => f.path);

      const result = await executeTrackedJob({
        req,
        toolType: 'merge',
        fileCount: files.length,
        totalSizeBytes: files.reduce((sum, f) => sum + f.size, 0),
        inputFilename: files.map((f) => f.originalname).join(', '),
        execute: () => mergePdfs(filePaths, taskDir),
      });

      res.status(200).json({
        success: true,
        message: 'PDFs merged successfully.',
        data: {
          taskId,
          downloadUrl: `/api/pdf/download/${taskId}/${result.outputFilename}`,
          outputFilename: result.outputFilename,
          mimeType: 'application/pdf',
          fileSizeBytes: result.fileSizeBytes,
          pageCount: result.pageCount,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/pdf/split
 * Splits or extracts pages from a PDF document by range.
 */
router.post(
  '/split',
  pdfUpload.single('file'),
  async (req: Request, res: Response<ApiSuccessResponse<ProcessedFileInfo>>, next: NextFunction) => {
    try {
      if ((req as any).fileValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: (req as any).fileValidationError,
          },
        } as any);
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'FILE_MISSING',
            message: 'A PDF file is required for splitting.',
          },
        } as any);
        return;
      }

      const params = splitSchema.parse(req.body);
      const taskId = req.taskId!;
      const taskDir = req.taskDir!;

      const result = await executeTrackedJob({
        req,
        toolType: 'split',
        execute: () => splitPdf(file.path, params.ranges, params.mergeResult, taskDir),
      });

      res.status(200).json({
        success: true,
        message: 'PDF split successfully.',
        data: {
          taskId,
          downloadUrl: `/api/pdf/download/${taskId}/${result.outputFilename}`,
          outputFilename: result.outputFilename,
          mimeType: result.mimeType,
          fileSizeBytes: result.fileSizeBytes,
          pageCount: result.pageCount,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/pdf/rotate
 * Rotates pages within a PDF.
 */
router.post(
  '/rotate',
  pdfUpload.single('file'),
  async (req: Request, res: Response<ApiSuccessResponse<ProcessedFileInfo>>, next: NextFunction) => {
    try {
      if ((req as any).fileValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: (req as any).fileValidationError,
          },
        } as any);
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'FILE_MISSING',
            message: 'A PDF file is required for rotation.',
          },
        } as any);
        return;
      }

      const params = rotateSchema.parse(req.body);
      const taskId = req.taskId!;
      const taskDir = req.taskDir!;

      const result = await executeTrackedJob({
        req,
        toolType: 'rotate',
        execute: () => rotatePdf(file.path, params.angle, params.target, taskDir),
      });

      res.status(200).json({
        success: true,
        message: `Rotated ${result.rotatedPagesCount} page(s) by ${params.angle} degrees.`,
        data: {
          taskId,
          downloadUrl: `/api/pdf/download/${taskId}/${result.outputFilename}`,
          outputFilename: result.outputFilename,
          mimeType: 'application/pdf',
          fileSizeBytes: result.fileSizeBytes,
          pageCount: result.pageCount,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/pdf/compress
 * Compresses a PDF document.
 */
router.post(
  '/compress',
  pdfUpload.single('file'),
  async (req: Request, res: Response<ApiSuccessResponse<ProcessedFileInfo>>, next: NextFunction) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'FILE_MISSING',
            message: 'A PDF file is required for compression.',
          },
        } as any);
        return;
      }

      const params = compressSchema.parse(req.body);
      const taskId = req.taskId!;
      const taskDir = req.taskDir!;

      const result = await executeTrackedJob({
        req,
        toolType: 'compress',
        execute: async () => {
          const res = await compressPdf(file.path, params.level, taskDir);
          return {
            ...res,
            fileSizeBytes: res.compressedSizeBytes,
          };
        },
      });

      res.status(200).json({
        success: true,
        message: `Compressed PDF with ${params.level} optimization. Saved ${result.savedPercentage}% file size.`,
        data: {
          taskId,
          downloadUrl: `/api/pdf/download/${taskId}/${result.outputFilename}`,
          outputFilename: result.outputFilename,
          mimeType: 'application/pdf',
          fileSizeBytes: result.compressedSizeBytes,
          originalSizeBytes: result.originalSizeBytes,
          savedPercentage: result.savedPercentage,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/pdf/img-to-pdf
 * Converts one or more JPG/PNG/WebP images into a single PDF.
 */
router.post(
  '/img-to-pdf',
  imageUpload.array('images', 30),
  async (req: Request, res: Response<ApiSuccessResponse<ProcessedFileInfo>>, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'FILE_MISSING',
            message: 'At least one image file is required for conversion.',
          },
        } as any);
        return;
      }

      const params = imgToPdfSchema.parse(req.body);
      const taskId = req.taskId!;
      const taskDir = req.taskDir!;
      const imagePaths = files.map((f) => f.path);

      const result = await executeTrackedJob({
        req,
        toolType: 'img-to-pdf',
        fileCount: files.length,
        totalSizeBytes: files.reduce((sum, f) => sum + f.size, 0),
        inputFilename: files.map((f) => f.originalname).join(', '),
        execute: () =>
          convertImagesToPdf(
            imagePaths,
            {
              pageSize: params.pageSize,
              orientation: params.orientation,
              margin: params.margin,
            },
            taskDir
          ),
      });

      res.status(200).json({
        success: true,
        message: `Converted ${result.pageCount} image(s) to PDF.`,
        data: {
          taskId,
          downloadUrl: `/api/pdf/download/${taskId}/${result.outputFilename}`,
          outputFilename: result.outputFilename,
          mimeType: 'application/pdf',
          fileSizeBytes: result.fileSizeBytes,
          pageCount: result.pageCount,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/pdf/pdf-to-img
 * Converts a PDF document into JPG images (single JPG or ZIP archive).
 */
router.post(
  '/pdf-to-img',
  pdfUpload.single('file'),
  async (req: Request, res: Response<ApiSuccessResponse<ProcessedFileInfo>>, next: NextFunction) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'FILE_MISSING',
            message: 'A PDF file is required for image conversion.',
          },
        } as any);
        return;
      }

      const taskId = req.taskId!;
      const taskDir = req.taskDir!;

      const result = await executeTrackedJob({
        req,
        toolType: 'pdf-to-img',
        execute: () => convertPdfToImages(file.path, taskDir),
      });

      res.status(200).json({
        success: true,
        message: `Converted PDF (${result.pageCount} page(s)) to image.`,
        data: {
          taskId,
          downloadUrl: `/api/pdf/download/${taskId}/${result.outputFilename}`,
          outputFilename: result.outputFilename,
          mimeType: result.mimeType,
          fileSizeBytes: result.fileSizeBytes,
          pageCount: result.pageCount,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/pdf/word-to-pdf
 * Converts a Word document (.docx, .doc) to PDF.
 */
router.post(
  '/word-to-pdf',
  wordUpload.single('file'),
  async (req: Request, res: Response<ApiSuccessResponse<ProcessedFileInfo>>, next: NextFunction) => {
    try {
      if ((req as any).fileValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: (req as any).fileValidationError,
          },
        } as any);
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'FILE_MISSING',
            message: 'A Word (.docx, .doc) file is required for conversion.',
          },
        } as any);
        return;
      }

      const taskId = req.taskId!;
      const taskDir = req.taskDir!;

      const result = await executeTrackedJob({
        req,
        toolType: 'word-to-pdf',
        execute: () => convertWordToPdf(file.path, taskDir),
      });

      res.status(200).json({
        success: true,
        message: 'Word document converted to PDF successfully.',
        data: {
          taskId,
          downloadUrl: `/api/pdf/download/${taskId}/${result.outputFilename}`,
          outputFilename: result.outputFilename,
          mimeType: 'application/pdf',
          fileSizeBytes: result.fileSizeBytes,
          pageCount: result.pageCount,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/pdf/excel-to-pdf
 * Converts an Excel spreadsheet (.xlsx, .xls) to PDF.
 */
router.post(
  '/excel-to-pdf',
  excelUpload.single('file'),
  async (req: Request, res: Response<ApiSuccessResponse<ProcessedFileInfo>>, next: NextFunction) => {
    try {
      if ((req as any).fileValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: (req as any).fileValidationError,
          },
        } as any);
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'FILE_MISSING',
            message: 'An Excel (.xlsx, .xls) file is required for conversion.',
          },
        } as any);
        return;
      }

      const taskId = req.taskId!;
      const taskDir = req.taskDir!;

      const result = await executeTrackedJob({
        req,
        toolType: 'excel-to-pdf',
        execute: () => convertExcelToPdf(file.path, taskDir),
      });

      res.status(200).json({
        success: true,
        message: `Excel spreadsheet (${result.sheetCount} sheet(s)) converted to PDF successfully.`,
        data: {
          taskId,
          downloadUrl: `/api/pdf/download/${taskId}/${result.outputFilename}`,
          outputFilename: result.outputFilename,
          mimeType: 'application/pdf',
          fileSizeBytes: result.fileSizeBytes,
          pageCount: result.pageCount,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/pdf/ppt-to-pdf
 * Converts a PowerPoint presentation (.pptx, .ppt) to PDF.
 */
router.post(
  '/ppt-to-pdf',
  pptUpload.single('file'),
  async (req: Request, res: Response<ApiSuccessResponse<ProcessedFileInfo>>, next: NextFunction) => {
    try {
      if ((req as any).fileValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: (req as any).fileValidationError,
          },
        } as any);
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'FILE_MISSING',
            message: 'A PowerPoint (.pptx, .ppt) file is required for conversion.',
          },
        } as any);
        return;
      }

      const taskId = req.taskId!;
      const taskDir = req.taskDir!;

      const result = await executeTrackedJob({
        req,
        toolType: 'ppt-to-pdf',
        execute: () => convertPptToPdf(file.path, taskDir),
      });

      res.status(200).json({
        success: true,
        message: `PowerPoint presentation (${result.pageCount} slide(s)) converted to PDF successfully.`,
        data: {
          taskId,
          downloadUrl: `/api/pdf/download/${taskId}/${result.outputFilename}`,
          outputFilename: result.outputFilename,
          mimeType: 'application/pdf',
          fileSizeBytes: result.fileSizeBytes,
          pageCount: result.pageCount,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/pdf/pdf-to-word
 * Converts a PDF document into an editable Word .docx document.
 */
router.post(
  '/pdf-to-word',
  pdfUpload.single('file'),
  async (req: Request, res: Response<ApiSuccessResponse<ProcessedFileInfo & { isScanned?: boolean; ocrRequired?: boolean }>>, next: NextFunction) => {
    try {
      if ((req as any).fileValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: (req as any).fileValidationError,
          },
        } as any);
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'FILE_MISSING',
            message: 'A PDF file is required for conversion to Word.',
          },
        } as any);
        return;
      }

      const taskId = req.taskId!;
      const taskDir = req.taskDir!;

      const result = await executeTrackedJob({
        req,
        toolType: 'pdf-to-word',
        execute: () => convertPdfToWord(file.path, taskDir),
      });

      res.status(200).json({
        success: true,
        message: result.notes || 'PDF converted to editable Word document successfully.',
        data: {
          taskId,
          downloadUrl: `/api/pdf/download/${taskId}/${result.outputFilename}`,
          outputFilename: result.outputFilename,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          fileSizeBytes: result.fileSizeBytes,
          pageCount: result.pageCount,
          isScanned: result.isScanned,
          ocrRequired: result.ocrRequired,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/pdf/organize
 * Reorder, rotate, delete, or duplicate pages in a PDF document.
 */
router.post(
  '/organize',
  pdfUpload.single('file'),
  async (req: Request, res: Response<ApiSuccessResponse<ProcessedFileInfo>>, next: NextFunction) => {
    try {
      if ((req as any).fileValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: (req as any).fileValidationError,
          },
        } as any);
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FILE',
            message: 'A PDF file is required for page organization.',
          },
        } as any);
        return;
      }

      const parseResult = organizeSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: parseResult.error.errors[0]?.message || 'Invalid page operations specification.',
          },
        } as any);
        return;
      }

      const taskId = req.taskId!;
      const taskDir = req.taskDir!;

      const result = await executeTrackedJob({
        req,
        toolType: 'organize',
        execute: () => organizePdf(file.path, parseResult.data.operations, taskDir),
      });

      res.status(200).json({
        success: true,
        message: 'PDF pages organized successfully.',
        data: {
          taskId,
          downloadUrl: `/api/pdf/download/${taskId}/${result.outputFilename}`,
          outputFilename: result.outputFilename,
          mimeType: 'application/pdf',
          fileSizeBytes: result.fileSizeBytes,
          pageCount: result.pageCount,
        },
      });
    } catch (err: any) {
      if (err.message && (err.message.includes('Invalid page') || err.message.includes('cannot be empty') || err.message.includes('exceeds'))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PAGE_OPERATION',
            message: err.message,
          },
        } as any);
        return;
      }
      next(err);
    }
  }
);

/**
 * POST /api/pdf/watermark-text
 * Applies a customizable text watermark across specified pages.
 */
router.post(
  '/watermark-text',
  pdfUpload.single('file'),
  async (req: Request, res: Response<ApiSuccessResponse<ProcessedFileInfo>>, next: NextFunction) => {
    try {
      if ((req as any).fileValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: (req as any).fileValidationError,
          },
        } as any);
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FILE',
            message: 'A PDF file is required to apply a watermark.',
          },
        } as any);
        return;
      }

      const parseResult = textWatermarkSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: parseResult.error.errors[0]?.message || 'Invalid text watermark parameters.',
          },
        } as any);
        return;
      }

      const taskId = req.taskId!;
      const taskDir = req.taskDir!;

      const result = await executeTrackedJob({
        req,
        toolType: 'watermark-text',
        execute: () => applyTextWatermark(file.path, parseResult.data, taskDir),
      });

      res.status(200).json({
        success: true,
        message: 'Text watermark applied successfully.',
        data: {
          taskId,
          downloadUrl: `/api/pdf/download/${taskId}/${result.outputFilename}`,
          outputFilename: result.outputFilename,
          mimeType: 'application/pdf',
          fileSizeBytes: result.fileSizeBytes,
          pageCount: result.pageCount,
        },
      });
    } catch (err: any) {
      if (err.message && (err.message.includes('Page number') || err.message.includes('Invalid page range'))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PAGE_RANGE',
            message: err.message,
          },
        } as any);
        return;
      }
      next(err);
    }
  }
);

/**
 * POST /api/pdf/watermark-image
 * Applies a customizable image watermark (PNG/JPEG) across specified pages.
 */
router.post(
  '/watermark-image',
  watermarkUpload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  async (req: Request, res: Response<ApiSuccessResponse<ProcessedFileInfo>>, next: NextFunction) => {
    try {
      if ((req as any).fileValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: (req as any).fileValidationError,
          },
        } as any);
        return;
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const pdfFile = files?.['file']?.[0];
      const imageFile = files?.['image']?.[0];

      if (!pdfFile || !imageFile) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FILES',
            message: 'Both a PDF document ("file") and a watermark image ("image") are required.',
          },
        } as any);
        return;
      }

      const parseResult = imageWatermarkSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: parseResult.error.errors[0]?.message || 'Invalid image watermark parameters.',
          },
        } as any);
        return;
      }

      const taskId = req.taskId!;
      const taskDir = req.taskDir!;

      const result = await executeTrackedJob({
        req,
        toolType: 'watermark-image',
        fileCount: 2,
        totalSizeBytes: (pdfFile.size || 0) + (imageFile.size || 0),
        inputFilename: `${pdfFile.originalname}, ${imageFile.originalname}`,
        execute: () =>
          applyImageWatermark(
            pdfFile.path,
            imageFile.path,
            {
              ...parseResult.data,
              imagePath: imageFile.path,
              imageMimeType: imageFile.mimetype,
            },
            taskDir
          ),
      });

      res.status(200).json({
        success: true,
        message: 'Image watermark applied successfully.',
        data: {
          taskId,
          downloadUrl: `/api/pdf/download/${taskId}/${result.outputFilename}`,
          outputFilename: result.outputFilename,
          mimeType: 'application/pdf',
          fileSizeBytes: result.fileSizeBytes,
          pageCount: result.pageCount,
        },
      });
    } catch (err: any) {
      if (err.message && (err.message.includes('Page number') || err.message.includes('Invalid page range'))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PAGE_RANGE',
            message: err.message,
          },
        } as any);
        return;
      }
      next(err);
    }
  }
);

/**
 * POST /api/pdf/page-numbers
 * Adds configurable page numbering to a PDF document.
 */
router.post(
  '/page-numbers',
  pdfUpload.single('file'),
  async (req: Request, res: Response<ApiSuccessResponse<ProcessedFileInfo>>, next: NextFunction) => {
    try {
      if ((req as any).fileValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: (req as any).fileValidationError,
          },
        } as any);
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FILE',
            message: 'A PDF file is required to add page numbers.',
          },
        } as any);
        return;
      }

      const parseResult = pageNumbersSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: parseResult.error.errors[0]?.message || 'Invalid page numbering parameters.',
          },
        } as any);
        return;
      }

      const taskId = req.taskId!;
      const taskDir = req.taskDir!;

      const result = await executeTrackedJob({
        req,
        toolType: 'page-numbers',
        execute: () => addPageNumbers(file.path, parseResult.data, taskDir),
      });

      res.status(200).json({
        success: true,
        message: 'Page numbers added successfully.',
        data: {
          taskId,
          downloadUrl: `/api/pdf/download/${taskId}/${result.outputFilename}`,
          outputFilename: result.outputFilename,
          mimeType: 'application/pdf',
          fileSizeBytes: result.fileSizeBytes,
          pageCount: result.pageCount,
        },
      });
    } catch (err: any) {
      if (err.message && (err.message.includes('Page number') || err.message.includes('Invalid range'))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PAGE_RANGE',
            message: err.message,
          },
        } as any);
        return;
      }
      next(err);
    }
  }
);

/**
 * POST /api/pdf/protect
 * Encrypts a PDF document with standard AES-256 password protection.
 */
router.post(
  '/protect',
  pdfUpload.single('file'),
  async (req: Request, res: Response<ApiSuccessResponse<ProcessedFileInfo>>, next: NextFunction) => {
    try {
      if ((req as any).fileValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: (req as any).fileValidationError,
          },
        } as any);
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FILE',
            message: 'A PDF file is required for encryption.',
          },
        } as any);
        return;
      }

      const parseResult = protectSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: parseResult.error.errors[0]?.message || 'Password is required.',
          },
        } as any);
        return;
      }

      const taskId = req.taskId!;
      const taskDir = req.taskDir!;

      const result = await executeTrackedJob({
        req,
        toolType: 'protect',
        execute: () => protectPdf(file.path, parseResult.data, taskDir),
      });

      res.status(200).json({
        success: true,
        message: 'PDF protected successfully with AES-256 encryption.',
        data: {
          taskId,
          downloadUrl: `/api/pdf/download/${taskId}/${result.outputFilename}`,
          outputFilename: result.outputFilename,
          mimeType: 'application/pdf',
          fileSizeBytes: result.fileSizeBytes,
          pageCount: result.pageCount,
        },
      });
    } catch (err: any) {
      if (err.message && err.message.includes('already password-protected')) {
        res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_PROTECTED',
            message: err.message,
          },
        } as any);
        return;
      }
      next(err);
    }
  }
);

/**
 * POST /api/pdf/unlock
 * Removes password protection from an authorized PDF document.
 */
router.post(
  '/unlock',
  pdfUpload.single('file'),
  async (req: Request, res: Response<ApiSuccessResponse<ProcessedFileInfo>>, next: NextFunction) => {
    try {
      if ((req as any).fileValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: (req as any).fileValidationError,
          },
        } as any);
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FILE',
            message: 'A PDF file is required to unlock.',
          },
        } as any);
        return;
      }

      const parseResult = unlockSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: parseResult.error.errors[0]?.message || 'Invalid unlock parameters.',
          },
        } as any);
        return;
      }

      const taskId = req.taskId!;
      const taskDir = req.taskDir!;

      const result = await executeTrackedJob({
        req,
        toolType: 'unlock',
        execute: () => unlockPdf(file.path, parseResult.data.password, taskDir),
      });

      res.status(200).json({
        success: true,
        message: 'PDF unlocked successfully. Encryption removed.',
        data: {
          taskId,
          downloadUrl: `/api/pdf/download/${taskId}/${result.outputFilename}`,
          outputFilename: result.outputFilename,
          mimeType: 'application/pdf',
          fileSizeBytes: result.fileSizeBytes,
          pageCount: result.pageCount,
        },
      });
    } catch (err: any) {
      if (err instanceof IncorrectPasswordError || (err.message && err.message.includes('Incorrect password'))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INCORRECT_PASSWORD',
            message: 'Authentication failed: Incorrect password provided for this document.',
          },
        } as any);
        return;
      }
      next(err);
    }
  }
);

/**
 * POST /api/pdf/ocr
 * Performs OCR text recognition on scanned or image-heavy PDFs and generates a searchable PDF.
 */
router.post(
  '/ocr',
  pdfUpload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if ((req as any).fileValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: (req as any).fileValidationError,
          },
        });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE_UPLOADED',
            message: 'A PDF document must be uploaded for OCR processing.',
          },
        });
        return;
      }

      const language = (req.body.language as string) || 'eng';
      const forceAllPages = req.body.forceAllPages === 'true' || req.body.forceAllPages === true;
      const simulateMissingEngine = req.body.simulateMissingEngine === 'true';

      const taskId = req.taskId!;
      const taskDir = req.taskDir!;

      const result = await executeTrackedJob({
        req,
        toolType: 'ocr',
        fileCount: 1,
        totalSizeBytes: file.size,
        inputFilename: file.originalname,
        execute: () => ocrPdf(file.path, taskDir, { language, forceAllPages, simulateMissingEngine }),
      });

      res.status(200).json({
        success: true,
        message: result.statusMessage,
        data: {
          taskId,
          downloadUrl: `/api/pdf/download/${taskId}/${result.outputFilename}`,
          outputFilename: result.outputFilename,
          fileSizeBytes: result.fileSizeBytes,
          originalSizeBytes: result.originalSizeBytes,
          pageCount: result.pageCount,
          pagesOcred: result.pagesOcred,
          detectedScannedPages: result.detectedScannedPages,
          language: result.language,
          languageName: result.languageName,
          extractedText: result.extractedText,
          wordsExtracted: result.wordsExtracted,
          accuracyNote: result.accuracyNote,
        },
      });
    } catch (err: any) {
      if (err instanceof OcrError) {
        const statusCode = err.code === 'OCR_ENGINE_NOT_AVAILABLE' ? 503 : 400;
        res.status(statusCode).json({
          success: false,
          error: {
            code: err.code,
            message: err.message,
          },
        });
        return;
      }
      next(err);
    }
  }
);

/**
 * POST /api/pdf/repair
 * Best-effort recovery and repair of damaged or corrupt PDF documents.
 */
router.post(
  '/repair',
  pdfUpload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if ((req as any).fileValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: (req as any).fileValidationError,
          },
        });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE_UPLOADED',
            message: 'A damaged or corrupted PDF document must be uploaded for repair.',
          },
        });
        return;
      }

      const taskId = req.taskId!;
      const taskDir = req.taskDir!;

      const result = await executeTrackedJob({
        req,
        toolType: 'repair',
        fileCount: 1,
        totalSizeBytes: file.size,
        inputFilename: file.originalname,
        execute: () => repairPdf(file.path, taskDir),
      });

      res.status(200).json({
        success: true,
        message: result.statusMessage,
        data: {
          taskId,
          downloadUrl: `/api/pdf/download/${taskId}/${result.outputFilename}`,
          outputFilename: result.outputFilename,
          fileSizeBytes: result.fileSizeBytes,
          originalSizeBytes: result.originalSizeBytes,
          pageCount: result.pageCount,
          reconstructedPagesCount: result.reconstructedPagesCount,
          statusMessage: result.statusMessage,
        },
      });
    } catch (err: any) {
      if (err instanceof UnrecoverablePdfError) {
        res.status(422).json({
          success: false,
          error: {
            code: err.code || 'UNRECOVERABLE_PDF',
            message: err.message,
          },
        });
        return;
      }
      next(err);
    }
  }
);

/**
 * POST /api/pdf/compare
 * Compares two PDF documents for textual diffs and visual pixel differences.
 */
router.post(
  '/compare',
  pdfUpload.fields([
    { name: 'file1', maxCount: 1 },
    { name: 'file2', maxCount: 1 },
    { name: 'files', maxCount: 2 },
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if ((req as any).fileValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: (req as any).fileValidationError,
          },
        });
        return;
      }

      const filesObj = (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};
      let file1: Express.Multer.File | undefined;
      let file2: Express.Multer.File | undefined;

      if (filesObj['file1']?.[0] && filesObj['file2']?.[0]) {
        file1 = filesObj['file1'][0];
        file2 = filesObj['file2'][0];
      } else if (filesObj['files'] && filesObj['files'].length >= 2) {
        file1 = filesObj['files'][0];
        file2 = filesObj['files'][1];
      }

      if (!file1 || !file2) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_FILES',
            message: 'Comparison requires two PDF documents (either fields "file1" and "file2" or 2 files in "files").',
          },
        });
        return;
      }

      const taskId = req.taskId!;
      const taskDir = req.taskDir!;
      const totalSize = file1.size + file2.size;

      const result = await executeTrackedJob({
        req,
        toolType: 'compare',
        fileCount: 2,
        totalSizeBytes: totalSize,
        inputFilename: `${file1.originalname} vs ${file2.originalname}`,
        execute: () => comparePdfs(file1!.path, file2!.path, taskDir),
      });

      res.status(200).json({
        success: true,
        message: result.areIdentical
          ? 'Documents are identical in both text and layout.'
          : 'Document comparison completed with differences detected.',
        data: {
          taskId,
          downloadUrl: `/api/pdf/download/${taskId}/${result.reportFilename}`,
          reportFilename: result.reportFilename,
          areIdentical: result.areIdentical,
          doc1PageCount: result.doc1PageCount,
          doc2PageCount: result.doc2PageCount,
          comparedPagesCount: result.comparedPagesCount,
          pagesWithTextChanges: result.pagesWithTextChanges,
          pagesWithVisualChanges: result.pagesWithVisualChanges,
          totalAddedLines: result.totalAddedLines,
          totalRemovedLines: result.totalRemovedLines,
          overallSimilarityScore: result.overallSimilarityScore,
          pageComparisons: result.pageComparisons,
          disclaimer: result.disclaimer,
        },
      });
    } catch (err: any) {
      if (err instanceof CompareError) {
        res.status(400).json({
          success: false,
          error: {
            code: err.code,
            message: err.message,
          },
        });
        return;
      }
      next(err);
    }
  }
);

/**
 * POST /api/pdf/summarize
 * Generates an executive summary, key insights, and action items with page citations.
 */
router.post(
  '/summarize',
  pdfUpload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if ((req as any).fileValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: (req as any).fileValidationError,
          },
        });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE_UPLOADED',
            message: 'A PDF document must be uploaded for summarization.',
          },
        });
        return;
      }

      const detailLevel = (req.body.detailLevel as 'concise' | 'standard' | 'detailed') || 'standard';
      const taskId = req.taskId!;
      const taskDir = req.taskDir!;

      const result = await executeTrackedJob({
        req,
        toolType: 'ai-summary',
        fileCount: 1,
        totalSizeBytes: file.size,
        inputFilename: file.originalname,
        execute: () => summarizePdf(file.path, taskDir, { detailLevel }),
      });

      res.status(200).json({
        success: true,
        message: 'Document summarized successfully.',
        data: {
          taskId,
          summary: result.summary,
          keyInsights: result.keyInsights,
          actionItems: result.actionItems,
          pageCitations: result.pageCitations,
          pageCount: result.pageCount,
          totalCharacters: result.totalCharacters,
          modelUsed: result.modelUsed,
          disclaimer: result.disclaimer,
        },
      });
    } catch (err: any) {
      if (err instanceof AiProviderNotConfiguredError) {
        res.status(503).json({
          success: false,
          error: {
            code: err.code,
            message: err.message,
          },
        });
        return;
      }
      if (err instanceof ScannedDocumentDetectedError) {
        res.status(400).json({
          success: false,
          error: {
            code: err.code,
            message: err.message,
            charCount: err.charCount,
          },
        });
        return;
      }
      if (err instanceof AiError) {
        const status = err.code === 'AI_RATE_LIMIT' ? 429 : 400;
        res.status(status).json({
          success: false,
          error: {
            code: err.code,
            message: err.message,
          },
        });
        return;
      }
      next(err);
    }
  }
);

/**
 * POST /api/pdf/ask
 * Answers user questions about the document with factual answers and page citations.
 */
router.post(
  '/ask',
  pdfUpload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if ((req as any).fileValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: (req as any).fileValidationError,
          },
        });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE_UPLOADED',
            message: 'A PDF document must be uploaded to ask questions.',
          },
        });
        return;
      }

      const question = req.body.question as string;
      if (!question || !question.trim()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_QUESTION',
            message: 'A question must be provided in the request body.',
          },
        });
        return;
      }

      const taskId = req.taskId!;
      const taskDir = req.taskDir!;

      const result = await executeTrackedJob({
        req,
        toolType: 'ai-qa',
        fileCount: 1,
        totalSizeBytes: file.size,
        inputFilename: file.originalname,
        execute: () => askPdf(file.path, question, taskDir),
      });

      res.status(200).json({
        success: true,
        message: 'Question answered successfully.',
        data: {
          taskId,
          question: result.question,
          answer: result.answer,
          pageCitations: result.pageCitations,
          pageCount: result.pageCount,
          modelUsed: result.modelUsed,
          disclaimer: result.disclaimer,
        },
      });
    } catch (err: any) {
      if (err instanceof AiProviderNotConfiguredError) {
        res.status(503).json({
          success: false,
          error: {
            code: err.code,
            message: err.message,
          },
        });
        return;
      }
      if (err instanceof ScannedDocumentDetectedError) {
        res.status(400).json({
          success: false,
          error: {
            code: err.code,
            message: err.message,
            charCount: err.charCount,
          },
        });
        return;
      }
      if (err instanceof AiError) {
        const status = err.code === 'AI_RATE_LIMIT' ? 429 : 400;
        res.status(status).json({
          success: false,
          error: {
            code: err.code,
            message: err.message,
          },
        });
        return;
      }
      next(err);
    }
  }
);

/**
 * GET /api/pdf/download/:taskId/:filename
 * Safely downloads a generated file by task ID with job authorization checks.
 */
router.get('/download/:taskId/:filename', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = String(req.params.taskId || '');
    const filename = String(req.params.filename || '');

    if (!taskId || !filename) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETERS',
          message: 'Invalid download parameters.',
        },
      });
      return;
    }

    let safeFilePath: string;
    try {
      safeFilePath = resolveSafePath(taskId, filename);
    } catch {
      res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'Requested file not found or has expired.',
        },
      });
      return;
    }

    // Check authorization & expiration if job is registered
    const existingJob = await db.processingJob.findFirst({ where: { taskId } });
    if (existingJob) {
      // If job belongs to a registered user, prevent unauthorized downloads
      if (existingJob.userId && (!req.user || req.user.id !== existingJob.userId)) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not authorized to download files from this job.',
          },
        });
        return;
      }

      // Check job expiration
      if (existingJob.expiresAt && existingJob.expiresAt.getTime() < Date.now()) {
        res.status(410).json({
          success: false,
          error: {
            code: 'FILE_EXPIRED',
            message: 'This generated file has expired and is no longer available.',
          },
        });
        return;
      }
    }

    const exists = await fileExists(safeFilePath);

    if (!exists) {
      res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'Requested file not found or has expired.',
        },
      });
      return;
    }

    const ext = path.extname(safeFilePath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.zip') contentType = 'application/zip';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else if (ext === '.doc') contentType = 'application/msword';
    else if (ext === '.xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    else if (ext === '.pptx') contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    else if (ext === '.json') contentType = 'application/json';

    const isInline = req.query.inline === 'true';
    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      isInline ? 'inline' : `attachment; filename="${path.basename(safeFilePath)}"`
    );

    res.sendFile(safeFilePath);
  } catch (err) {
    next(err);
  }
});

export default router;
