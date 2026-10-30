import fs from 'node:fs/promises';
import { db, ProcessingJobRecord } from '../db/index.js';
import { resolveSafePath, fileExists } from '../utils/storage.js';

export interface CreateJobInput {
  userId?: string | null;
  anonymousId?: string | null;
  toolType: string;
  inputFilename?: string;
  inputSizeBytes?: number | bigint;
  taskId?: string;
  ttlMinutes?: number;
}

export interface UpdateJobInput {
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  outputFilename?: string;
  outputSizeBytes?: number | bigint;
  mimeType?: string;
  pageCount?: number;
  downloadUrl?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface JobQueryOptions {
  page?: number;
  limit?: number;
  toolType?: string;
  status?: string;
}

/**
 * Create a new processing job record in DB
 */
export async function createJob(params: CreateJobInput): Promise<ProcessingJobRecord> {
  const ttl = (params.ttlMinutes || 60) * 60 * 1000;
  const expiresAt = new Date(Date.now() + ttl);

  return db.processingJob.create({
    data: {
      userId: params.userId || null,
      anonymousId: params.anonymousId || null,
      toolType: params.toolType,
      status: 'PROCESSING',
      inputFilename: params.inputFilename || null,
      inputSizeBytes: params.inputSizeBytes !== undefined ? BigInt(params.inputSizeBytes) : null,
      taskId: params.taskId || null,
      expiresAt,
    },
  });
}

/**
 * Update job progress / result upon completion or error
 */
export async function updateJob(jobId: string, params: UpdateJobInput): Promise<ProcessingJobRecord> {
  const completedAt = ['COMPLETED', 'FAILED', 'CANCELLED'].includes(params.status) ? new Date() : undefined;

  return db.processingJob.update({
    where: { id: jobId },
    data: {
      status: params.status,
      outputFilename: params.outputFilename,
      outputSizeBytes: params.outputSizeBytes !== undefined ? BigInt(params.outputSizeBytes) : undefined,
      mimeType: params.mimeType,
      pageCount: params.pageCount,
      downloadUrl: params.downloadUrl,
      errorCode: params.errorCode,
      errorMessage: params.errorMessage,
      completedAt,
    },
  });
}

/**
 * Get paginated list of jobs for an authenticated user with filtering
 */
export async function getJobsForUser(userId: string, options: JobQueryOptions = {}) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(50, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (options.toolType) where.toolType = options.toolType;
  if (options.status) where.status = options.status;

  const [totalCount, rawJobs] = await Promise.all([
    db.processingJob.count({ where }),
    db.processingJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  // Check file availability on disk for each job
  const jobs = await Promise.all(
    rawJobs.map(async (job) => {
      let isFileAvailable = false;
      if (job.taskId && job.outputFilename && job.status === 'COMPLETED') {
        const isExpired = job.expiresAt.getTime() < Date.now();
        if (!isExpired) {
          try {
            const filePath = resolveSafePath(job.taskId, job.outputFilename);
            isFileAvailable = await fileExists(filePath);
          } catch {
            isFileAvailable = false;
          }
        }
      }

      return {
        id: job.id,
        toolType: job.toolType,
        status: job.status,
        inputFilename: job.inputFilename,
        outputFilename: job.outputFilename,
        mimeType: job.mimeType,
        inputSizeBytes: job.inputSizeBytes !== null ? Number(job.inputSizeBytes) : null,
        outputSizeBytes: job.outputSizeBytes !== null ? Number(job.outputSizeBytes) : null,
        pageCount: job.pageCount,
        taskId: job.taskId,
        downloadUrl: isFileAvailable ? job.downloadUrl : null,
        isFileAvailable,
        errorCode: job.errorCode,
        errorMessage: job.errorMessage,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        expiresAt: job.expiresAt,
      };
    })
  );

  return {
    jobs,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    },
  };
}

/**
 * Get a specific job by ID, ensuring user authorization
 */
export async function getJobById(jobId: string, userId?: string) {
  const job = await db.processingJob.findUnique({ where: { id: jobId } });
  if (!job) return null;

  // Enforce access authorization
  if (userId && job.userId && job.userId !== userId) {
    throw new Error('Unauthorized to view this job record.');
  }

  let isFileAvailable = false;
  if (job.taskId && job.outputFilename && job.status === 'COMPLETED') {
    const isExpired = job.expiresAt.getTime() < Date.now();
    if (!isExpired) {
      try {
        const filePath = resolveSafePath(job.taskId, job.outputFilename);
        isFileAvailable = await fileExists(filePath);
      } catch {
        isFileAvailable = false;
      }
    }
  }

  return {
    id: job.id,
    userId: job.userId,
    toolType: job.toolType,
    status: job.status,
    inputFilename: job.inputFilename,
    outputFilename: job.outputFilename,
    mimeType: job.mimeType,
    inputSizeBytes: job.inputSizeBytes !== null ? Number(job.inputSizeBytes) : null,
    outputSizeBytes: job.outputSizeBytes !== null ? Number(job.outputSizeBytes) : null,
    pageCount: job.pageCount,
    taskId: job.taskId,
    downloadUrl: isFileAvailable ? job.downloadUrl : null,
    isFileAvailable,
    errorCode: job.errorCode,
    errorMessage: job.errorMessage,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
    expiresAt: job.expiresAt,
  };
}

/**
 * Delete a job record from history
 */
export async function deleteJob(jobId: string, userId: string) {
  const job = await db.processingJob.findUnique({ where: { id: jobId } });
  if (!job) {
    throw new Error('Job record not found.');
  }

  if (job.userId !== userId) {
    throw new Error('Unauthorized to delete this job record.');
  }

  return db.processingJob.delete({ where: { id: jobId } });
}
