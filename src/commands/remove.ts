import { findAppByName } from '../core/scanner.js';
import { detectFilesForApp } from '../core/detector.js';
import { removeFiles, simulateRemoval } from '../core/cleaner.js';
import { loadConfig, isAppExcluded } from '../utils/config.js';
import { startSpinner, succeedSpinner } from '../ui/spinner.js';
import { selectFiles, confirmRemoval, confirmAppRemoval } from '../ui/prompts.js';
import { info, warning, error, printRemovalSummary } from '../ui/output.js';
import { getSize } from '../utils/fs.js';
import { FileType, type DetectedFile } from '../types/index.js';
import chalk from 'chalk';

/**
 * Remove subcommand - interactively remove files for an app
 */
export async function removeCommand(appName?: string): Promise<void> {
  if (!appName) {
    error('Please specify an application name.');
    info('Usage: void remove <app-name>');
    return;
  }

  const config = await loadConfig();

  // Find the app
  const spinner = startSpinner(`Searching for "${appName}"...`);
  const matchingApps = await findAppByName(appName);
  succeedSpinner(spinner, `Found ${matchingApps.length} matching application(s)`);

  if (matchingApps.length === 0) {
    warning(`No applications found matching "${appName}"`);
    return;
  }

  if (matchingApps.length > 1) {
    console.log();
    console.log(chalk.bold('Multiple applications found:'));
    matchingApps.forEach((app, index) => {
      console.log(`${index + 1}. ${app.name}${app.bundleId ? ` (${app.bundleId})` : ''}`);
    });
    info('Please be more specific with the app name.');
    return;
  }

  const app = matchingApps[0];

  // Check if app is excluded
  if (isAppExcluded(app.bundleId, config.excludedApps)) {
    warning(`${app.name} is excluded from cleanup.`);
    return;
  }

  // Detect files
  const detectSpinner = startSpinner('Detecting leftover files...');
  const files = await detectFilesForApp(app, config);
  succeedSpinner(detectSpinner, `Found ${files.length} file(s)`);

  if (files.length === 0) {
    info('No leftover files found for this application.');
    return;
  }

  console.log();
  console.log(chalk.bold(`${app.name}`));
  if (app.bundleId) {
    console.log(chalk.dim(`Bundle ID: ${app.bundleId}`));
  }
  console.log();

  // Let user select files
  const selectedFiles = await selectFiles(files);

  if (selectedFiles.length === 0) {
    warning('No files selected. Nothing to remove.');
    return;
  }

  // Ask if user wants to remove the app bundle itself
  const removeAppBundle = await confirmAppRemoval(app.name, app.path);

  let filesToRemove = selectedFiles;

  // Add app bundle to removal list if confirmed
  if (removeAppBundle) {
    const appSize = await getSize(app.path);
    const appFile: DetectedFile = {
      path: app.path,
      size: appSize,
      type: FileType.ApplicationSupport,
      isDirectory: true,
    };
    filesToRemove = [...selectedFiles, appFile];
  }

  // Confirm removal
  const totalSize = filesToRemove.reduce((sum, file) => sum + file.size, 0);
  const confirmed = await confirmRemoval(filesToRemove.length, totalSize);

  if (!confirmed) {
    warning('Removal cancelled.');
    return;
  }

  // Remove files
  const removeSpinner = startSpinner('Removing files...');
  const summary = config.dryRun ? simulateRemoval(filesToRemove) : await removeFiles(filesToRemove);
  succeedSpinner(removeSpinner, 'Done!');

  // Show summary
  printRemovalSummary(summary);
}
