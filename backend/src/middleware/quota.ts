import { Request, Response, NextFunction } from 'express';
import { checkQuota, QuotaExceededError, TierLimits } from '../services/quota.service.js';

declare global {
  namespace Express {
    interface Request {
      tierLimits?: TierLimits;
    }
  }
}

/**
 * Middleware generator enforcing tier quotas and operation limits before processing
 */
export function enforceQuota(operationType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let fileCount = 0;
      let totalSizeBytes = 0;

      if (req.file) {
        fileCount = 1;
        totalSizeBytes = req.file.size;
      } else if (req.files) {
        if (Array.isArray(req.files)) {
          fileCount = req.files.length;
          totalSizeBytes = req.files.reduce((sum, f) => sum + f.size, 0);
        } else {
          // Object with named fields e.g. { file: [...], image: [...] }
          const allFiles = Object.values(req.files).flat();
          fileCount = allFiles.length;
          totalSizeBytes = allFiles.reduce((sum, f) => sum + f.size, 0);
        }
      }

      // If no files attached yet (e.g. before multer), allow through to let validation handle
      if (fileCount > 0) {
        const { limits } = await checkQuota({
          userId: req.user?.id,
          anonymousId: req.anonymousId,
          tier: req.user?.tier,
          fileCount,
          totalSizeBytes,
        });

        req.tierLimits = limits;
      }

      next();
    } catch (err: any) {
      if (err instanceof QuotaExceededError) {
        res.status(429).json({
          success: false,
          error: {
            code: err.code,
            message: err.message,
            limit: err.limit,
            current: err.current,
          },
        });
        return;
      }
      next(err);
    }
  };
}
