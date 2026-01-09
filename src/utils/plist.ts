import { exec } from 'child_process';
import { promisify } from 'util';
import type { PlistData } from '../types/index.js';

const execAsync = promisify(exec);

/**
 * Parse a macOS plist file (XML or binary format)
 * Uses the built-in plutil command to convert to JSON
 */
export async function parsePlist(plistPath: string): Promise<PlistData | null> {
  try {
    // Use plutil to convert plist to JSON format
    const { stdout } = await execAsync(`plutil -convert json -o - "${plistPath}"`);

    // Parse the JSON output
    const data = JSON.parse(stdout);
    return data as PlistData;
  } catch {
    // Return null if plist cannot be parsed
    return null;
  }
}

/**
 * Extract bundle identifier from plist data
 */
export function getBundleId(plistData: PlistData | null): string | undefined {
  return plistData?.CFBundleIdentifier;
}

/**
 * Extract bundle name from plist data
 */
export function getBundleName(plistData: PlistData | null): string | undefined {
  return plistData?.CFBundleDisplayName || plistData?.CFBundleName;
}

/**
 * Extract executable name from plist data
 */
export function getExecutableName(plistData: PlistData | null): string | undefined {
  return plistData?.CFBundleExecutable;
}
