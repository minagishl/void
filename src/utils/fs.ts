import { stat, readdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import type { DetectedFile } from '../types/index.js';

/**
 * Get the size of a file or directory (recursive)
 */
export async function getSize(path: string): Promise<number> {
  try {
    const stats = await stat(path);

    if (stats.isFile()) {
      return stats.size;
    }

    if (stats.isDirectory()) {
      const files = await readdir(path);
      const sizes = await Promise.all(files.map((file) => getSize(join(path, file))));
      return sizes.reduce((total, size) => total + size, 0);
    }

    return 0;
  } catch {
    return 0;
  }
}

/**
 * Format bytes to human-readable format
 */
export function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Check if a path exists
 */
export function exists(path: string): boolean {
  return existsSync(path);
}

/**
 * Remove a file or directory
 */
export async function remove(path: string): Promise<void> {
  try {
    await rm(path, { recursive: true, force: true });
  } catch (error) {
    throw new Error(`Failed to remove ${path}: ${(error as Error).message}`);
  }
}

/**
 * Get all files in a directory (non-recursive)
 */
export async function getFilesInDirectory(path: string): Promise<string[]> {
  try {
    if (!exists(path)) {
      return [];
    }

    const stats = await stat(path);
    if (!stats.isDirectory()) {
      return [];
    }

    const files = await readdir(path);
    return files.map((file) => join(path, file));
  } catch {
    return [];
  }
}

/**
 * Check if a path is a directory
 */
export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Create a DetectedFile object from a path
 */
export async function createDetectedFile(
  path: string,
  type: import('../types/index.js').FileType
): Promise<DetectedFile | null> {
  try {
    if (!exists(path)) {
      return null;
    }

    const size = await getSize(path);
    const isDir = await isDirectory(path);

    return {
      path,
      size,
      type,
      isDirectory: isDir,
    };
  } catch {
    return null;
  }
}
