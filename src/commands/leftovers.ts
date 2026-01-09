import { detectOrphanedFiles } from '../core/detector.js';
import { removeFiles, simulateRemoval } from '../core/cleaner.js';
import { loadConfig } from '../utils/config.js';
import { formatSize } from '../utils/fs.js';
import { startSpinner, succeedSpinner } from '../ui/spinner.js';
import { selectOrphanedFiles, confirmRemoval } from '../ui/prompts.js';
import { info, warning, printRemovalSummary, separator } from '../ui/output.js';
import chalk from 'chalk';

/**
 * Leftovers subcommand - find and remove orphaned files
 */
export async function leftoversCommand(): Promise<void> {
  const config = await loadConfig();

  // Detect orphaned files
  const spinner = startSpinner('Scanning for orphaned files...');
  const orphanedGroups = await detectOrphanedFiles(config);
  succeedSpinner(spinner, `Found ${orphanedGroups.length} orphaned file group(s)`);

  if (orphanedGroups.length === 0) {
    info('No orphaned files found. Your system is clean!');
    return;
  }

  console.log();
  console.log(chalk.bold('Orphaned Files:'));
  separator();

  // Display orphaned file groups
  let grandTotal = 0;
  orphanedGroups.forEach((group, index) => {
    console.log(
      `${index + 1}. ${chalk.cyan(group.appName)}${
        group.bundleId ? chalk.dim(` (${group.bundleId})`) : ''
      }`
    );
    console.log(
      `   Files: ${group.files.length}, Size: ${chalk.yellow(formatSize(group.totalSize))}`
    );
    grandTotal += group.totalSize;
  });

  console.log();
  separator();
  info(`Total orphaned: ${chalk.yellow(formatSize(grandTotal))}`);
  console.log();

  // Let user select which groups to remove
  const selectedFiles = await selectOrphanedFiles(orphanedGroups);

  if (selectedFiles.length === 0) {
    warning('No files selected. Nothing to remove.');
    return;
  }

  // Confirm removal
  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
  const confirmed = await confirmRemoval(selectedFiles.length, totalSize);

  if (!confirmed) {
    warning('Removal cancelled.');
    return;
  }

  // Remove files
  const removeSpinner = startSpinner('Removing orphaned files...');
  const summary = config.dryRun ? simulateRemoval(selectedFiles) : await removeFiles(selectedFiles);
  succeedSpinner(removeSpinner, 'Done!');

  // Show summary
  printRemovalSummary(summary);
}
