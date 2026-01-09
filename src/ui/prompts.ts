import { select, confirm, checkbox, input } from '@inquirer/prompts';
import { formatSize } from '../utils/fs.js';
import type { DetectedFile, AppWithFiles } from '../types/index.js';

/**
 * Prompt to select an application
 */
export async function selectApp(apps: AppWithFiles[]): Promise<AppWithFiles | null> {
  if (apps.length === 0) {
    return null;
  }

  const choices = apps.map((appWithFiles) => ({
    name: `${appWithFiles.app.name} (${appWithFiles.files.length} files, ${formatSize(appWithFiles.totalSize)})`,
    value: appWithFiles,
  }));

  try {
    return await select({
      message: 'Select an application:',
      choices,
    });
  } catch {
    // User cancelled
    return null;
  }
}

/**
 * Prompt to select files
 */
export async function selectFiles(files: DetectedFile[]): Promise<DetectedFile[]> {
  if (files.length === 0) {
    return [];
  }

  const choices = files.map((file) => ({
    name: `[${file.type}] ${file.path} (${formatSize(file.size)})`,
    value: file,
    checked: true,
  }));

  try {
    return await checkbox({
      message: 'Select files to remove:',
      choices,
    });
  } catch {
    // User cancelled
    return [];
  }
}

/**
 * Prompt for action (Cancel, Back, Remove)
 */
export async function selectAction(): Promise<'cancel' | 'back' | 'remove'> {
  try {
    return await select({
      message: 'What would you like to do?',
      choices: [
        { name: 'Remove selected files', value: 'remove' },
        { name: 'Back to app selection', value: 'back' },
        { name: 'Cancel', value: 'cancel' },
      ],
    });
  } catch {
    return 'cancel';
  }
}

/**
 * Confirm file removal
 */
export async function confirmRemoval(fileCount: number, totalSize: number): Promise<boolean> {
  try {
    return await confirm({
      message: `Are you sure you want to remove ${fileCount} file(s) (${formatSize(totalSize)})?`,
      default: false,
    });
  } catch {
    return false;
  }
}

/**
 * Select orphaned files to remove
 */
export async function selectOrphanedFiles(
  orphanedGroups: Array<{ appName: string; files: DetectedFile[]; totalSize: number }>
): Promise<DetectedFile[]> {
  if (orphanedGroups.length === 0) {
    return [];
  }

  const choices = orphanedGroups.map((group) => ({
    name: `${group.appName} (${group.files.length} files, ${formatSize(group.totalSize)})`,
    value: group.files,
    checked: false,
  }));

  try {
    const selected = await checkbox({
      message: 'Select orphaned file groups to remove:',
      choices,
    });

    // Flatten the array of arrays
    return selected.flat();
  } catch {
    return [];
  }
}

/**
 * Prompt for text input
 */
export async function promptInput(message: string, defaultValue?: string): Promise<string | null> {
  try {
    return await input({
      message,
      default: defaultValue,
    });
  } catch {
    return null;
  }
}

/**
 * Prompt for yes/no confirmation
 */
export async function promptConfirm(message: string, defaultValue = true): Promise<boolean> {
  try {
    return await confirm({
      message,
      default: defaultValue,
    });
  } catch {
    return false;
  }
}

/**
 * Select configuration option
 */
export async function selectConfigOption(): Promise<string | null> {
  try {
    return await select({
      message: 'Select a configuration option:',
      choices: [
        { name: 'Toggle scan locations', value: 'locations' },
        { name: 'Manage excluded apps', value: 'excluded' },
        { name: 'Toggle dry run mode', value: 'dryrun' },
        { name: 'Reset to defaults', value: 'reset' },
        { name: 'Exit', value: 'exit' },
      ],
    });
  } catch {
    return null;
  }
}

/**
 * Confirm app bundle removal
 */
export async function confirmAppRemoval(appName: string, appPath: string): Promise<boolean> {
  try {
    return await confirm({
      message: `Do you also want to remove the application bundle itself?\n  ${appName} (${appPath})`,
      default: false,
    });
  } catch {
    return false;
  }
}
