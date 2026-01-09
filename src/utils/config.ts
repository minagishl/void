import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { exists } from './fs.js';
import type { Config } from '../types/index.js';

const CONFIG_DIR = join(homedir(), '.void');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: Config = {
  scanLocations: {
    caches: true,
    preferences: true,
    applicationSupport: true,
    logs: true,
    savedState: true,
    cookies: true,
    webkit: true,
    systemWide: false,
  },
  excludedApps: [
    'com.apple.Safari',
    'com.apple.Finder',
    'com.apple.SystemUIServer',
    'com.apple.dock',
    'com.apple.loginwindow',
  ],
  dryRun: false,
  aggressiveMode: false,
};

/**
 * Ensure config directory exists
 */
async function ensureConfigDir(): Promise<void> {
  if (!exists(CONFIG_DIR)) {
    await mkdir(CONFIG_DIR, { recursive: true });
  }
}

/**
 * Load configuration from file
 */
export async function loadConfig(): Promise<Config> {
  try {
    await ensureConfigDir();

    if (!exists(CONFIG_FILE)) {
      // Create default config file if it doesn't exist
      await saveConfig(DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }

    const content = await readFile(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(content) as Config;

    // Merge with default config to ensure all properties exist
    return {
      ...DEFAULT_CONFIG,
      ...config,
      scanLocations: {
        ...DEFAULT_CONFIG.scanLocations,
        ...config.scanLocations,
      },
    };
  } catch {
    // Return default config if loading fails
    return DEFAULT_CONFIG;
  }
}

/**
 * Save configuration to file
 */
export async function saveConfig(config: Config): Promise<void> {
  try {
    await ensureConfigDir();
    await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    throw new Error(`Failed to save configuration: ${(error as Error).message}`);
  }
}

/**
 * Reset configuration to defaults
 */
export async function resetConfig(): Promise<void> {
  await saveConfig(DEFAULT_CONFIG);
}

/**
 * Get config file path
 */
export function getConfigPath(): string {
  return CONFIG_FILE;
}

/**
 * Check if an app is excluded
 */
export function isAppExcluded(bundleId: string | undefined, excludedApps: string[]): boolean {
  if (!bundleId) {
    return false;
  }
  return excludedApps.includes(bundleId);
}
