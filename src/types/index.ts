/**
 * Core application information
 */
export interface AppInfo {
  name: string;
  path: string;
  bundleId?: string;
  bundleName?: string;
  executable?: string;
}

/**
 * File types for categorization
 */
export enum FileType {
  Cache = 'Cache',
  Preference = 'Preference',
  Log = 'Log',
  SavedState = 'Saved State',
  Cookie = 'Cookie',
  WebKit = 'WebKit',
  ApplicationSupport = 'Application Support',
  Unknown = 'Unknown',
}

/**
 * Detected leftover file information
 */
export interface DetectedFile {
  path: string;
  size: number;
  type: FileType;
  isDirectory: boolean;
}

/**
 * Application with its detected files
 */
export interface AppWithFiles {
  app: AppInfo;
  files: DetectedFile[];
  totalSize: number;
}

/**
 * Orphaned files (leftovers from uninstalled apps)
 */
export interface OrphanedFiles {
  appName: string;
  bundleId?: string;
  files: DetectedFile[];
  totalSize: number;
}

/**
 * Scan locations configuration
 */
export interface ScanLocations {
  caches: boolean;
  preferences: boolean;
  applicationSupport: boolean;
  logs: boolean;
  savedState: boolean;
  cookies: boolean;
  webkit: boolean;
  systemWide: boolean;
}

/**
 * User configuration
 */
export interface Config {
  scanLocations: ScanLocations;
  excludedApps: string[];
  dryRun: boolean;
  aggressiveMode: boolean;
}

/**
 * File removal result
 */
export interface RemovalResult {
  path: string;
  success: boolean;
  error?: string;
}

/**
 * Removal summary
 */
export interface RemovalSummary {
  totalFiles: number;
  successCount: number;
  failureCount: number;
  totalSizeFreed: number;
  results: RemovalResult[];
}

/**
 * Parsed Info.plist data
 */
export interface PlistData {
  CFBundleIdentifier?: string;
  CFBundleName?: string;
  CFBundleExecutable?: string;
  CFBundleDisplayName?: string;
  [key: string]: unknown;
}
