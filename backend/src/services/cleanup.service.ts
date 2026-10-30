import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { config } from '../config.js';

let cleanupTimer: NodeJS.Timeout | null = null;

/**
 * Sweeps temporary storage directory and removes task folders exceeding the TTL.
 */
export async function sweepExpiredTasks(): Promise<number> {
  if (!existsSync(config.tempStorageDir)) {
    return 0;
  }

  const now = Date.now();
  const maxAgeMs = config.fileTtlMinutes * 60 * 1000;
  let removedCount = 0;

  try {
    const entries = await fs.readdir(config.tempStorageDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dirPath = path.join(config.tempStorageDir, entry.name);
        try {
          const stats = await fs.stat(dirPath);
          const ageMs = now - stats.mtimeMs;

          if (ageMs > maxAgeMs) {
            await fs.rm(dirPath, { recursive: true, force: true });
            removedCount++;
          }
        } catch (dirErr) {
          console.warn(`Could not inspect or remove task folder ${entry.name}:`, dirErr);
        }
      }
    }
  } catch (err) {
    console.error('Error during expired task storage sweep:', err);
  }

  return removedCount;
}

/**
 * Starts the periodic background cleanup job.
 */
export function startPeriodicCleanup(intervalMinutes: number = 10): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
  }

  const intervalMs = intervalMinutes * 60 * 1000;
  cleanupTimer = setInterval(async () => {
    try {
      const removed = await sweepExpiredTasks();
      if (removed > 0) {
        console.log(`[Storage Cleanup] Cleared ${removed} expired task directories.`);
      }
    } catch (err) {
      console.error('[Storage Cleanup] Failure during sweep:', err);
    }
  }, intervalMs);

  // Do not hold process open if everything else finishes
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

/**
 * Stops the periodic cleanup job.
 */
export function stopPeriodicCleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}
