import { join } from 'path';
import { homedir } from 'os';
import { getFilesInDirectory } from '../utils/fs.js';
import { parsePlist, getBundleId, getBundleName, getExecutableName } from '../utils/plist.js';
import type { AppInfo } from '../types/index.js';

const APPLICATIONS_PATHS = ['/Applications', join(homedir(), 'Applications')];

/**
 * Scan for installed applications in /Applications and ~/Applications
 */
export async function scanApplications(): Promise<AppInfo[]> {
  const apps: AppInfo[] = [];

  for (const appPath of APPLICATIONS_PATHS) {
    const files = await getFilesInDirectory(appPath);

    for (const file of files) {
      if (file.endsWith('.app')) {
        const appInfo = await getAppInfo(file);
        if (appInfo) {
          apps.push(appInfo);
        }
      }
    }
  }

  // Sort alphabetically by name
  return apps.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get application information from an app bundle
 */
export async function getAppInfo(appPath: string): Promise<AppInfo | null> {
  try {
    const appName = appPath.split('/').pop()?.replace('.app', '') || '';
    const plistPath = join(appPath, 'Contents', 'Info.plist');

    // Parse Info.plist
    const plistData = await parsePlist(plistPath);

    if (!plistData) {
      // Return basic info if plist cannot be parsed
      return {
        name: appName,
        path: appPath,
      };
    }

    return {
      name: getBundleName(plistData) || appName,
      path: appPath,
      bundleId: getBundleId(plistData),
      bundleName: getBundleName(plistData),
      executable: getExecutableName(plistData),
    };
  } catch {
    return null;
  }
}

/**
 * Find an app by name (case-insensitive, partial match)
 */
export async function findAppByName(name: string): Promise<AppInfo[]> {
  const apps = await scanApplications();
  const searchTerm = name.toLowerCase();

  return apps.filter((app) => app.name.toLowerCase().includes(searchTerm));
}

/**
 * Find an app by bundle ID
 */
export async function findAppByBundleId(bundleId: string): Promise<AppInfo | null> {
  const apps = await scanApplications();

  return apps.find((app) => app.bundleId === bundleId) || null;
}
