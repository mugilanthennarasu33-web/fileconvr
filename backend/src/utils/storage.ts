import fs from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';

/**
 * Ensures the temporary storage directory exists.
 */
export async function ensureStorageDirectories(): Promise<void> {
  await fs.mkdir(config.tempStorageDir, { recursive: true });
}

/**
 * Creates an isolated directory for a specific task using a UUID.
 */
export async function createTaskDirectory(): Promise<{ taskId: string; taskDir: string }> {
  const taskId = uuidv4();
  const taskDir = path.join(config.tempStorageDir, taskId);
  await fs.mkdir(taskDir, { recursive: true });
  return { taskId, taskDir };
}

/**
 * Validates that a file path resolves strictly within the intended task directory,
 * preventing path traversal attacks.
 */
export function resolveSafePath(taskId: string, filename: string): string {
  // Validate taskId: must strictly be alphanumeric with dashes/underscores (e.g. UUID)
  if (!taskId || !/^[a-zA-Z0-9_-]+$/.test(taskId) || taskId.includes('..') || taskId.includes('/') || taskId.includes('\\')) {
    throw new Error('Security Violation: Invalid task identifier.');
  }

  // Reject path traversal in filename
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw new Error('Security Violation: Invalid filename or path traversal detected.');
  }

  // Sanitize filename: strip directory separators and invalid characters
  const sanitizedFilename = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!sanitizedFilename || sanitizedFilename === '.' || sanitizedFilename === '..') {
    throw new Error('Security Violation: Invalid filename.');
  }

  const baseStorageDir = path.resolve(config.tempStorageDir);
  const taskDir = path.resolve(baseStorageDir, taskId);

  // Check that taskDir is strictly inside baseStorageDir
  if (!taskDir.startsWith(baseStorageDir + path.sep)) {
    throw new Error('Security Violation: Task directory traversal detected.');
  }

  const resolvedPath = path.resolve(taskDir, sanitizedFilename);

  // Check that resolved path is strictly inside taskDir
  if (!resolvedPath.startsWith(taskDir + path.sep)) {
    throw new Error('Security Violation: Invalid file path or attempted path traversal.');
  }

  return resolvedPath;
}

/**
 * Removes a task directory and all its files.
 */
export async function cleanupTaskDirectory(taskId: string): Promise<void> {
  const taskDir = path.join(config.tempStorageDir, taskId);
  try {
    if (existsSync(taskDir)) {
      await fs.rm(taskDir, { recursive: true, force: true });
    }
  } catch (err) {
    console.error(`Error cleaning up task directory ${taskId}:`, err);
  }
}

/**
 * Verifies if a file exists.
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}
