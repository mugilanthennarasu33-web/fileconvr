import { Request } from 'express';
import { checkQuota, recordUsage } from './quota.service.js';
import { createJob, updateJob } from './job-history.service.js';

export interface ExecuteJobOptions<T> {
  req: Request;
  toolType: string;
  inputFilename?: string;
  fileCount?: number;
  totalSizeBytes?: number;
  execute: () => Promise<T>;
}

export async function executeTrackedJob<
  T extends {
    outputFilename?: string;
    fileSizeBytes?: number | bigint;
    pageCount?: number;
    mimeType?: string;
  }
>(options: ExecuteJobOptions<T>): Promise<T> {
  const { req, toolType, execute } = options;
  const taskId = req.taskId;

  // 1. Calculate file count and total size
  let fileCount = options.fileCount ?? 1;
  let totalSizeBytes = options.totalSizeBytes ?? 0;

  if (options.fileCount === undefined) {
    if (req.file) {
      fileCount = 1;
      totalSizeBytes = req.file.size;
    } else if (req.files) {
      if (Array.isArray(req.files)) {
        fileCount = req.files.length;
        totalSizeBytes = req.files.reduce((sum, f) => sum + (f.size || 0), 0);
      } else {
        const allFiles = Object.values(req.files).flat();
        fileCount = allFiles.length;
        totalSizeBytes = allFiles.reduce((sum, f) => sum + (f.size || 0), 0);
      }
    }
  }

  // 2. Check Quota
  const { limits } = await checkQuota({
    userId: req.user?.id,
    anonymousId: req.anonymousId,
    tier: req.user?.tier,
    fileCount,
    totalSizeBytes,
  });

  // 3. Create persistent job record in DB (status: PROCESSING)
  const defaultInputFilename =
    req.file?.originalname ||
    (Array.isArray(req.files) ? req.files.map((f) => f.originalname).join(', ') : undefined);

  const job = await createJob({
    userId: req.user?.id,
    anonymousId: req.anonymousId,
    toolType,
    inputFilename: options.inputFilename || defaultInputFilename,
    inputSizeBytes: totalSizeBytes,
    taskId,
    ttlMinutes: limits.fileRetentionMinutes,
  });

  try {
    // 4. Run operation
    const result = await execute();

    // 5. Update Job Success in DB (status: COMPLETED)
    await updateJob(job.id, {
      status: 'COMPLETED',
      outputFilename: result.outputFilename,
      outputSizeBytes: result.fileSizeBytes,
      pageCount: result.pageCount,
      mimeType: result.mimeType || 'application/pdf',
      downloadUrl: taskId && result.outputFilename ? `/api/pdf/download/${taskId}/${result.outputFilename}` : undefined,
    });

    // 6. Record usage quota consumption (successful operations consume daily count)
    await recordUsage({
      userId: req.user?.id,
      anonymousId: req.anonymousId,
      operationType: toolType,
      bytesProcessed: result.fileSizeBytes || totalSizeBytes,
      jobId: job.id,
    });

    return result;
  } catch (err: any) {
    // 7. Update Job Failure in DB (status: FAILED) - Failed ops do not consume quota
    await updateJob(job.id, {
      status: 'FAILED',
      errorCode: err.code || err.name || 'PROCESSING_ERROR',
      errorMessage: (err.message || 'Operation failed').substring(0, 200),
    });

    throw err;
  }
}
