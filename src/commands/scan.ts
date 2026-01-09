import { scanApplications, findAppByName } from '../core/scanner.js';
import { detectFilesForApp } from '../core/detector.js';
import { loadConfig, isAppExcluded } from '../utils/config.js';
import { formatSize } from '../utils/fs.js';
import { startSpinner, succeedSpinner } from '../ui/spinner.js';
import { info, warning, printTableHeader, printTableRow, separator } from '../ui/output.js';
import chalk from 'chalk';

/**
 * Scan subcommand - show detected files for apps
 */
export async function scanCommand(appName?: string): Promise<void> {
  const config = await loadConfig();

  if (appName) {
    // Scan for a specific app
    const spinner = startSpinner(`Searching for "${appName}"...`);
    const matchingApps = await findAppByName(appName);
    succeedSpinner(spinner, `Found ${matchingApps.length} matching application(s)`);

    if (matchingApps.length === 0) {
      warning(`No applications found matching "${appName}"`);
      return;
    }

    for (const app of matchingApps) {
      if (isAppExcluded(app.bundleId, config.excludedApps)) {
        info(`${app.name} is excluded from scanning.`);
        continue;
      }

      console.log();
      console.log(chalk.bold(app.name));
      if (app.bundleId) {
        console.log(chalk.dim(`Bundle ID: ${app.bundleId}`));
      }
      separator();

      const detectSpinner = startSpinner('Detecting leftover files...');
      const files = await detectFilesForApp(app, config);
      succeedSpinner(detectSpinner, `Found ${files.length} file(s)`);

      if (files.length === 0) {
        info('No leftover files found.');
        continue;
      }

      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      console.log(`Total size: ${chalk.yellow(formatSize(totalSize))}`);
      console.log();

      // Group by type
      const filesByType = new Map<string, typeof files>();
      files.forEach((file) => {
        const type = file.type;
        if (!filesByType.has(type)) {
          filesByType.set(type, []);
        }
        filesByType.get(type)!.push(file);
      });

      // Print files grouped by type
      filesByType.forEach((typeFiles, type) => {
        console.log(chalk.bold(`${type} (${typeFiles.length}):`));
        typeFiles.forEach((file) => {
          console.log(`  • ${file.path} ${chalk.dim(formatSize(file.size))}`);
        });
        console.log();
      });
    }
  } else {
    // Scan all apps
    const spinner = startSpinner('Scanning all applications...');
    const apps = await scanApplications();
    succeedSpinner(spinner, `Found ${apps.length} applications`);

    const filteredApps = apps.filter((app) => !isAppExcluded(app.bundleId, config.excludedApps));

    if (filteredApps.length === 0) {
      warning('No applications found.');
      return;
    }

    const detectSpinner = startSpinner('Detecting leftover files...');
    const appsWithFiles: Array<{ name: string; fileCount: number; totalSize: number }> = [];

    for (const app of filteredApps) {
      const files = await detectFilesForApp(app, config);
      if (files.length > 0) {
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        appsWithFiles.push({
          name: app.name,
          fileCount: files.length,
          totalSize,
        });
      }
    }

    succeedSpinner(detectSpinner, 'Scan complete');

    if (appsWithFiles.length === 0) {
      info('No leftover files found. Your system is clean!');
      return;
    }

    console.log();
    printTableHeader([chalk.bold('Application'), chalk.bold('Files'), chalk.bold('Total Size')]);

    appsWithFiles
      .sort((a, b) => b.totalSize - a.totalSize)
      .forEach((app) => {
        printTableRow([
          app.name.padEnd(40),
          String(app.fileCount).padEnd(10),
          formatSize(app.totalSize).padEnd(15),
        ]);
      });

    console.log();
    const grandTotal = appsWithFiles.reduce((sum, app) => sum + app.totalSize, 0);
    info(
      `Total: ${chalk.yellow(formatSize(grandTotal))} across ${appsWithFiles.length} applications`
    );
  }
}
