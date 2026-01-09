import { scanApplications } from '../core/scanner.js';
import { detectFilesForApp } from '../core/detector.js';
import { removeFiles } from '../core/cleaner.js';
import { loadConfig, isAppExcluded } from '../utils/config.js';
import { startSpinner, succeedSpinner } from '../ui/spinner.js';
import {
  selectApp,
  selectFiles,
  selectAction,
  confirmRemoval,
  confirmAppRemoval,
} from '../ui/prompts.js';
import { printWelcome, printRemovalSummary, info, warning } from '../ui/output.js';
import { getSize } from '../utils/fs.js';
import { FileType, type AppWithFiles, type DetectedFile } from '../types/index.js';

/**
 * Interactive main menu (default when no arguments provided)
 */
export async function interactiveMenu(): Promise<void> {
  printWelcome();

  // Load configuration
  const config = await loadConfig();

  // Scan for applications
  const spinner = startSpinner('Scanning for applications...');
  const apps = await scanApplications();
  succeedSpinner(spinner, `Found ${apps.length} applications`);

  // Filter out excluded apps
  const filteredApps = apps.filter((app) => !isAppExcluded(app.bundleId, config.excludedApps));

  if (filteredApps.length === 0) {
    warning('No applications found.');
    return;
  }

  // Detect files for each app
  const detectSpinner = startSpinner('Detecting leftover files...');
  const appsWithFiles: AppWithFiles[] = [];

  for (const app of filteredApps) {
    const files = await detectFilesForApp(app, config);
    if (files.length > 0) {
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      appsWithFiles.push({ app, files, totalSize });
    }
  }

  succeedSpinner(detectSpinner, `Found leftover files for ${appsWithFiles.length} applications`);

  if (appsWithFiles.length === 0) {
    info('No leftover files found. Your system is clean!');
    return;
  }

  // Main loop
  let continueLoop = true;

  while (continueLoop) {
    // Select an app
    const selectedAppWithFiles = await selectApp(appsWithFiles);

    if (!selectedAppWithFiles) {
      // User cancelled
      return;
    }

    // Show files and let user select which ones to remove
    const selectedFiles = await selectFiles(selectedAppWithFiles.files);

    if (selectedFiles.length === 0) {
      warning('No files selected.');
      continue;
    }

    // Ask if user wants to remove the app bundle itself
    const removeAppBundle = await confirmAppRemoval(
      selectedAppWithFiles.app.name,
      selectedAppWithFiles.app.path
    );

    // Ask what to do next
    const action = await selectAction();

    switch (action) {
      case 'remove': {
        let filesToRemove = selectedFiles;
        let removeApp = false;

        // Add app bundle to removal list if confirmed
        if (removeAppBundle) {
          const appSize = await getSize(selectedAppWithFiles.app.path);
          const appFile: DetectedFile = {
            path: selectedAppWithFiles.app.path,
            size: appSize,
            type: FileType.ApplicationSupport,
            isDirectory: true,
          };
          filesToRemove = [...selectedFiles, appFile];
          removeApp = true;
        }

        // Confirm removal
        const totalSize = filesToRemove.reduce((sum, file) => sum + file.size, 0);
        const confirmed = await confirmRemoval(filesToRemove.length, totalSize);

        if (!confirmed) {
          warning('Removal cancelled.');
          continue;
        }

        // Remove files
        const removeSpinner = startSpinner('Removing files...');
        const summary = config.dryRun
          ? await import('../core/cleaner.js').then((m) => m.simulateRemoval(filesToRemove))
          : await removeFiles(filesToRemove);
        succeedSpinner(removeSpinner, 'Done!');

        // Show summary
        printRemovalSummary(summary);

        // If app bundle was removed, remove from list
        if (removeApp) {
          const index = appsWithFiles.indexOf(selectedAppWithFiles);
          appsWithFiles.splice(index, 1);
        } else {
          // Update the app's file list
          const updatedFiles = selectedAppWithFiles.files.filter(
            (file) => !selectedFiles.includes(file)
          );

          if (updatedFiles.length === 0) {
            // Remove app from list if no files left
            const index = appsWithFiles.indexOf(selectedAppWithFiles);
            appsWithFiles.splice(index, 1);
          } else {
            // Update the app's files
            selectedAppWithFiles.files = updatedFiles;
            selectedAppWithFiles.totalSize = updatedFiles.reduce((sum, file) => sum + file.size, 0);
          }
        }

        if (appsWithFiles.length === 0) {
          info('All leftover files have been cleaned!');
          return;
        }

        break;
      }

      case 'back':
        // Go back to app selection
        continue;

      case 'cancel':
        // Exit
        continueLoop = false;
        break;
    }
  }
}
