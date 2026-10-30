import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import { ZodError } from 'zod';
import { ApiErrorResponse } from '../types/index.js';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction
): void {
  // Handle Multer upload errors
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'The uploaded file exceeds the maximum allowed file size limit.',
          details: err.message,
        },
      });
      return;
    }
    res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: `Upload error: ${err.message}`,
      },
    });
    return;
  }

  // Handle Zod Schema validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request parameters.',
        details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      },
    });
    return;
  }

  // Handle Quota and Usage limit errors
  if (err.name === 'QuotaExceededError' || err.code?.includes('QUOTA') || err.code?.includes('EXCEEDED')) {
    res.status(429).json({
      success: false,
      error: {
        code: err.code || 'QUOTA_EXCEEDED',
        message: err.message,
        details: { limit: err.limit, current: err.current },
      },
    } as any);
    return;
  }

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected internal processing error occurred.';
  const code = err.code || 'INTERNAL_ERROR';

  logger.error('Unhandled request error', { error: err, statusCode: status, errorCode: code });

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}
