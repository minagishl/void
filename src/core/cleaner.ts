import { remove } from '../utils/fs.js';
import type { DetectedFile, RemovalResult, RemovalSummary } from '../types/index.js';

/**
 * Remove a single file or directory
 */
export async function removeFile(file: DetectedFile): Promise<RemovalResult> {
  try {
    await remove(file.path);
    return {
      path: file.path,
      success: true,
    };
  } catch (error) {
    return {
      path: file.path,
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Remove multiple files
 */
export async function removeFiles(files: DetectedFile[]): Promise<RemovalSummary> {
  const results: RemovalResult[] = [];
  let totalSizeFreed = 0;

  for (const file of files) {
    const result = await removeFile(file);
    results.push(result);

    if (result.success) {
      totalSizeFreed += file.size;
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  return {
    totalFiles: files.length,
    successCount,
    failureCount,
    totalSizeFreed,
    results,
  };
}

/**
 * Simulate file removal (dry run)
 */
export function simulateRemoval(files: DetectedFile[]): RemovalSummary {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return {
    totalFiles: files.length,
    successCount: files.length,
    failureCount: 0,
    totalSizeFreed: totalSize,
    results: files.map((file) => ({
      path: file.path,
      success: true,
    })),
  };
}
