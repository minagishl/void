import { join } from 'path';
import { homedir } from 'os';
import { getFilesInDirectory, createDetectedFile } from '../utils/fs.js';
import {
  FileType,
  type AppInfo,
  type DetectedFile,
  type Config,
  type OrphanedFiles,
} from '../types/index.js';
import { scanApplications } from './scanner.js';

/**
 * Get scan directories based on configuration
 */
export function getScanDirectories(config: Config): Array<{ path: string; type: FileType }> {
  const home = homedir();
  const directories: Array<{ path: string; type: FileType }> = [];

  if (config.scanLocations.caches) {
    directories.push({ path: join(home, 'Library', 'Caches'), type: FileType.Cache });
  }

  if (config.scanLocations.preferences) {
    directories.push({ path: join(home, 'Library', 'Preferences'), type: FileType.Preference });
  }

  if (config.scanLocations.applicationSupport) {
    directories.push({
      path: join(home, 'Library', 'Application Support'),
      type: FileType.ApplicationSupport,
    });
  }

  if (config.scanLocations.logs) {
    directories.push({ path: join(home, 'Library', 'Logs'), type: FileType.Log });
  }

  if (config.scanLocations.savedState) {
    directories.push({
      path: join(home, 'Library', 'Saved Application State'),
      type: FileType.SavedState,
    });
  }

  if (config.scanLocations.cookies) {
    directories.push({ path: join(home, 'Library', 'Cookies'), type: FileType.Cookie });
  }

  if (config.scanLocations.webkit) {
    directories.push({ path: join(home, 'Library', 'WebKit'), type: FileType.WebKit });
  }

  if (config.scanLocations.systemWide) {
    directories.push(
      { path: '/Library/Caches', type: FileType.Cache },
      { path: '/Library/Preferences', type: FileType.Preference },
      { path: '/Library/Application Support', type: FileType.ApplicationSupport },
      { path: '/Library/Logs', type: FileType.Log }
    );
  }

  return directories;
}

/**
 * Check if a file path matches an app (by bundle ID or name)
 */
function matchesApp(filePath: string, app: AppInfo): boolean {
  const fileName = filePath.split('/').pop() || '';
  const fileNameLower = fileName.toLowerCase();
  const appNameLower = app.name.toLowerCase();

  // Exact bundle ID match
  if (app.bundleId && fileNameLower.includes(app.bundleId.toLowerCase())) {
    return true;
  }

  // App name match (case-insensitive)
  if (fileNameLower.includes(appNameLower)) {
    return true;
  }

  // Check for plist files with bundle ID
  if (app.bundleId && fileName.endsWith('.plist')) {
    const plistName = fileName.replace('.plist', '');
    if (plistName === app.bundleId) {
      return true;
    }
  }

  return false;
}

/**
 * Detect leftover files for a specific app
 */
export async function detectFilesForApp(app: AppInfo, config: Config): Promise<DetectedFile[]> {
  const directories = getScanDirectories(config);
  const detectedFiles: DetectedFile[] = [];

  for (const { path: dirPath, type } of directories) {
    const files = await getFilesInDirectory(dirPath);

    for (const file of files) {
      if (matchesApp(file, app)) {
        const detectedFile = await createDetectedFile(file, type);
        if (detectedFile) {
          detectedFiles.push(detectedFile);
        }
      }
    }
  }

  return detectedFiles;
}

/**
 * Extract potential bundle ID from a file name
 */
function extractBundleId(fileName: string): string | null {
  // Remove .plist extension if present
  const name = fileName.replace('.plist', '').replace('.savedState', '');

  // Check if it looks like a bundle ID (com.company.app format)
  const bundleIdPattern = /^[a-z0-9]+\.[a-z0-9]+\.[a-z0-9-]+$/i;
  if (bundleIdPattern.test(name)) {
    return name;
  }

  return null;
}

/**
 * Extract app name from a file/directory name
 */
function extractAppName(fileName: string): string {
  // Remove common suffixes
  return fileName
    .replace('.plist', '')
    .replace('.savedState', '')
    .replace(/^com\.[^.]+\./, ''); // Remove bundle ID prefix if present
}

/**
 * Detect orphaned files (leftovers from uninstalled apps)
 */
export async function detectOrphanedFiles(config: Config): Promise<OrphanedFiles[]> {
  const installedApps = await scanApplications();
  const directories = getScanDirectories(config);
  const orphanedMap = new Map<string, OrphanedFiles>();

  for (const { path: dirPath, type } of directories) {
    const files = await getFilesInDirectory(dirPath);

    for (const file of files) {
      const fileName = file.split('/').pop() || '';

      // Check if this file matches any installed app
      const isInstalled = installedApps.some((app) => matchesApp(file, app));

      if (!isInstalled) {
        // Extract bundle ID or app name
        const bundleId = extractBundleId(fileName);
        const appName = extractAppName(fileName);
        const key = bundleId || appName;

        if (!orphanedMap.has(key)) {
          orphanedMap.set(key, {
            appName,
            bundleId: bundleId || undefined,
            files: [],
            totalSize: 0,
          });
        }

        const detectedFile = await createDetectedFile(file, type);
        if (detectedFile) {
          const orphaned = orphanedMap.get(key)!;
          orphaned.files.push(detectedFile);
          orphaned.totalSize += detectedFile.size;
        }
      }
    }
  }

  // Convert map to array and sort by total size (descending)
  return Array.from(orphanedMap.values()).sort((a, b) => b.totalSize - a.totalSize);
}
