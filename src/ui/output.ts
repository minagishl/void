import chalk from 'chalk';
import { formatSize } from '../utils/fs.js';
import type { DetectedFile, RemovalSummary } from '../types/index.js';

/**
 * Print success message
 */
export function success(message: string): void {
  console.log(chalk.green('✓'), message);
}

/**
 * Print error message
 */
export function error(message: string): void {
  console.log(chalk.red('✗'), message);
}

/**
 * Print warning message
 */
export function warning(message: string): void {
  console.log(chalk.yellow('⚠'), message);
}

/**
 * Print info message
 */
export function info(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}

/**
 * Print a separator line
 */
export function separator(): void {
  console.log(chalk.gray('─'.repeat(60)));
}

/**
 * Print a file with details
 */
export function printFile(file: DetectedFile, index?: number): void {
  const prefix = index !== undefined ? `${index + 1}.` : '•';
  const type = chalk.gray(`[${file.type}]`);
  const size = chalk.yellow(formatSize(file.size));
  const path = chalk.dim(file.path);

  console.log(`${prefix} ${type} ${path} ${size}`);
}

/**
 * Print a list of files
 */
export function printFiles(files: DetectedFile[]): void {
  files.forEach((file, index) => printFile(file, index));
}

/**
 * Print removal summary
 */
export function printRemovalSummary(summary: RemovalSummary): void {
  separator();
  console.log(chalk.bold('Removal Summary:'));
  console.log(`Total files: ${chalk.cyan(summary.totalFiles)}`);
  console.log(`Successfully removed: ${chalk.green(summary.successCount)}`);

  if (summary.failureCount > 0) {
    console.log(`Failed: ${chalk.red(summary.failureCount)}`);
  }

  console.log(`Space freed: ${chalk.yellow(formatSize(summary.totalSizeFreed))}`);
  separator();

  // Print failures if any
  if (summary.failureCount > 0) {
    console.log(chalk.bold('\nFailed removals:'));
    summary.results
      .filter((r) => !r.success)
      .forEach((r) => {
        error(`${r.path}: ${r.error}`);
      });
  }
}

/**
 * Print welcome message
 */
export function printWelcome(): void {
  console.log();
  console.log(chalk.bold.cyan('void'));
  console.log(chalk.dim('Interactive CLI tool for cleaning up leftover application files'));
  console.log();
}

/**
 * Print a table header
 */
export function printTableHeader(columns: string[]): void {
  console.log(chalk.bold(columns.join(' | ')));
  separator();
}

/**
 * Print a table row
 */
export function printTableRow(values: string[]): void {
  console.log(values.join(' | '));
}
