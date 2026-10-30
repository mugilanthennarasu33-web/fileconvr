import multer from 'multer';
import path from 'node:path';
import { Request } from 'express';
import { createTaskDirectory } from '../utils/storage.js';
import { config } from '../config.js';

// Extend Express Request interface to include taskId and taskDir
declare global {
  namespace Express {
    interface Request {
      taskId?: string;
      taskDir?: string;
    }
  }
}

const storage = multer.diskStorage({
  destination: async (req: Request, _file, cb) => {
    try {
      if (!req.taskId || !req.taskDir) {
        const { taskId, taskDir } = await createTaskDirectory();
        req.taskId = taskId;
        req.taskDir = taskDir;
      }
      cb(null, req.taskDir);
    } catch (err) {
      cb(err as Error, '');
    }
  },
  filename: (_req, file, cb) => {
    const sanitizedBase = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    // Ensure uniqueness within the task directory while keeping recognizable name
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e4);
    cb(null, `${uniquePrefix}_${sanitizedBase}`);
  },
});

export const pdfUpload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSizeBytes,
  },
  fileFilter: (req: Request, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      (req as any).fileValidationError = `Invalid file type: "${file.originalname}". Only PDF (.pdf) files are supported.`;
      cb(null, false);
    }
  },
});

export const imageUpload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSizeBytes,
  },
  fileFilter: (req: Request, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    if (allowed.includes(ext) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      (req as any).fileValidationError = `Invalid image file: "${file.originalname}". Only JPG, PNG, and WebP images are supported.`;
      cb(null, false);
    }
  },
});

export const wordUpload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSizeBytes,
  },
  fileFilter: (req: Request, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.doc', '.docx'];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      (req as any).fileValidationError = `Invalid file type: "${file.originalname}". Only Word (.docx, .doc) files are supported.`;
      cb(null, false);
    }
  },
});

export const excelUpload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSizeBytes,
  },
  fileFilter: (req: Request, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.xlsx', '.xls'];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      (req as any).fileValidationError = `Invalid file type: "${file.originalname}". Only Excel (.xlsx, .xls) files are supported.`;
      cb(null, false);
    }
  },
});

export const pptUpload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSizeBytes,
  },
  fileFilter: (req: Request, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pptx', '.ppt'];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      (req as any).fileValidationError = `Invalid file type: "${file.originalname}". Only PowerPoint (.pptx, .ppt) files are supported.`;
      cb(null, false);
    }
  },
});

export const watermarkUpload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSizeBytes,
  },
  fileFilter: (req: Request, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.fieldname === 'file') {
      if (ext === '.pdf' || file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        (req as any).fileValidationError = `Invalid file type: "${file.originalname}". Only PDF (.pdf) files are supported.`;
        cb(null, false);
      }
    } else if (file.fieldname === 'image') {
      const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
      if (allowed.includes(ext) || file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        (req as any).fileValidationError = `Invalid image file: "${file.originalname}". Only JPG and PNG images are supported.`;
        cb(null, false);
      }
    } else {
      cb(null, true);
    }
  },
});

