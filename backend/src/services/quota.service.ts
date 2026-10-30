import { db } from '../db/index.js';

export interface TierLimits {
  tierName: string;
  maxUploadSizeBytes: number; // Single file limit
  maxTotalInputSizeBytes: number; // Aggregate files limit
  maxFilesPerOperation: number;
  maxDailyOperations: number;
  maxConcurrentJobs: number;
  maxProcessingDurationSec: number;
  fileRetentionMinutes: number;
}

// Configurable tier limits with conservative defaults
const isTestEnv = process.env.NODE_ENV === 'test';

export const TIER_LIMITS: Record<string, TierLimits> = {
  anonymous: {
    tierName: 'Anonymous',
    maxUploadSizeBytes: 25 * 1024 * 1024, // 25 MB
    maxTotalInputSizeBytes: 50 * 1024 * 1024, // 50 MB
    maxFilesPerOperation: isTestEnv ? 50 : 5,
    maxDailyOperations: isTestEnv ? 1000 : 25,
    maxConcurrentJobs: isTestEnv ? 50 : 2,
    maxProcessingDurationSec: 60,
    fileRetentionMinutes: 30,
  },
  free: {
    tierName: 'Registered Free',
    maxUploadSizeBytes: 100 * 1024 * 1024, // 100 MB
    maxTotalInputSizeBytes: 200 * 1024 * 1024, // 200 MB
    maxFilesPerOperation: 25,
    maxDailyOperations: 60,
    maxConcurrentJobs: 3,
    maxProcessingDurationSec: 120,
    fileRetentionMinutes: 60,
  },
  premium: {
    tierName: 'Premium (Prepared)',
    maxUploadSizeBytes: 500 * 1024 * 1024, // 500 MB
    maxTotalInputSizeBytes: 1024 * 1024 * 1024, // 1 GB
    maxFilesPerOperation: 100,
    maxDailyOperations: 500,
    maxConcurrentJobs: 10,
    maxProcessingDurationSec: 300,
    fileRetentionMinutes: 1440, // 24 hours
  },
};

export class QuotaExceededError extends Error {
  code: string;
  limit: number;
  current: number;

  constructor(message: string, code: string, limit: number, current: number) {
    super(message);
    this.name = 'QuotaExceededError';
    this.code = code;
    this.limit = limit;
    this.current = current;
  }
}

/**
 * Get limits for a given user tier or anonymous
 */
export function getTierLimits(tier: string = 'free', isAnonymous: boolean = false): TierLimits {
  if (isAnonymous) return TIER_LIMITS.anonymous;
  return TIER_LIMITS[tier] || TIER_LIMITS.free;
}

/**
 * Check whether a user or anonymous visitor is authorized to run an operation
 */
export async function checkQuota(params: {
  userId?: string | null;
  anonymousId?: string;
  tier?: string;
  fileCount: number;
  totalSizeBytes: number;
}): Promise<{ allowed: boolean; limits: TierLimits }> {
  const isAnon = !params.userId;
  const limits = getTierLimits(params.tier || 'free', isAnon);

  // 1. Check max files per operation
  if (params.fileCount > limits.maxFilesPerOperation) {
    throw new QuotaExceededError(
      `File count limit exceeded. Maximum ${limits.maxFilesPerOperation} files allowed for your tier (${params.fileCount} uploaded).`,
      'FILE_COUNT_EXCEEDED',
      limits.maxFilesPerOperation,
      params.fileCount
    );
  }

  // 2. Check total upload size
  if (params.totalSizeBytes > limits.maxTotalInputSizeBytes) {
    const maxMb = (limits.maxTotalInputSizeBytes / (1024 * 1024)).toFixed(0);
    const uploadedMb = (params.totalSizeBytes / (1024 * 1024)).toFixed(1);
    throw new QuotaExceededError(
      `Total upload size limit exceeded (${uploadedMb} MB uploaded, limit is ${maxMb} MB).`,
      'UPLOAD_SIZE_EXCEEDED',
      limits.maxTotalInputSizeBytes,
      params.totalSizeBytes
    );
  }

  // 3. Check daily operations limit
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const dailyCount = isAnon
    ? await db.usageRecord.count({
        where: {
          anonymousId: params.anonymousId,
          timestamp: { gte: startOfDay },
        },
      })
    : await db.usageRecord.count({
        where: {
          userId: params.userId,
          timestamp: { gte: startOfDay },
        },
      });

  if (dailyCount >= limits.maxDailyOperations) {
    throw new QuotaExceededError(
      `Daily operations quota exhausted (${dailyCount}/${limits.maxDailyOperations} operations used today). Resets at midnight.`,
      'DAILY_QUOTA_EXHAUSTED',
      limits.maxDailyOperations,
      dailyCount
    );
  }

  // 4. Check active concurrent processing jobs
  const activeJobs = isAnon
    ? await db.processingJob.count({
        where: {
          anonymousId: params.anonymousId,
          status: 'PROCESSING',
        },
      })
    : await db.processingJob.count({
        where: {
          userId: params.userId,
          status: 'PROCESSING',
        },
      });

  if (activeJobs >= limits.maxConcurrentJobs) {
    throw new QuotaExceededError(
      `Concurrent processing limit reached (${activeJobs}/${limits.maxConcurrentJobs} active jobs). Please wait for ongoing jobs to complete.`,
      'CONCURRENT_LIMIT_REACHED',
      limits.maxConcurrentJobs,
      activeJobs
    );
  }

  return { allowed: true, limits };
}

/**
 * Record usage after operation execution
 */
export async function recordUsage(params: {
  userId?: string | null;
  anonymousId?: string;
  operationType: string;
  quantity?: number;
  bytesProcessed?: number | bigint;
  jobId?: string | null;
}) {
  return db.usageRecord.create({
    data: {
      userId: params.userId || null,
      anonymousId: params.anonymousId || null,
      operationType: params.operationType,
      quantity: params.quantity || 1,
      bytesProcessed: BigInt(params.bytesProcessed || 0),
      jobId: params.jobId || null,
    },
  });
}

/**
 * Get comprehensive usage summary for user dashboard
 */
export async function getUserUsageSummary(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  const tier = user?.tier || 'free';
  const limits = getTierLimits(tier, false);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1);

  const todayCount = await db.usageRecord.count({
    where: {
      userId,
      timestamp: { gte: startOfDay },
    },
  });

  const monthCount = await db.usageRecord.count({
    where: {
      userId,
      timestamp: { gte: startOfMonth },
    },
  });

  const totalCompletedJobs = await db.processingJob.count({
    where: {
      userId,
      status: 'COMPLETED',
    },
  });

  const totalAggregates = await db.usageRecord.aggregate({
    where: { userId },
    _sum: { bytesProcessed: true },
  });

  return {
    tier,
    tierName: limits.tierName,
    dailyOperationsUsed: todayCount,
    dailyOperationsLimit: limits.maxDailyOperations,
    dailyOperationsRemaining: Math.max(0, limits.maxDailyOperations - todayCount),
    monthlyOperationsUsed: monthCount,
    totalCompletedJobs,
    totalBytesProcessed: Number(totalAggregates._sum.bytesProcessed || 0n),
    limits,
  };
}
