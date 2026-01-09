import { loadConfig, saveConfig, resetConfig, getConfigPath } from '../utils/config.js';
import { selectConfigOption, promptConfirm, promptInput } from '../ui/prompts.js';
import { success, info, warning, separator } from '../ui/output.js';
import { checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';

/**
 * Config subcommand - interactive configuration management
 */
export async function configCommand(): Promise<void> {
  let continueLoop = true;

  while (continueLoop) {
    const config = await loadConfig();

    console.log();
    console.log(chalk.bold('Configuration'));
    separator();
    console.log(`Config file: ${chalk.dim(getConfigPath())}`);
    console.log();

    const option = await selectConfigOption();

    if (!option || option === 'exit') {
      continueLoop = false;
      break;
    }

    switch (option) {
      case 'locations': {
        // Toggle scan locations
        const currentLocations = config.scanLocations;
        const choices = [
          { name: 'Caches', value: 'caches', checked: currentLocations.caches },
          { name: 'Preferences', value: 'preferences', checked: currentLocations.preferences },
          {
            name: 'Application Support',
            value: 'applicationSupport',
            checked: currentLocations.applicationSupport,
          },
          { name: 'Logs', value: 'logs', checked: currentLocations.logs },
          { name: 'Saved State', value: 'savedState', checked: currentLocations.savedState },
          { name: 'Cookies', value: 'cookies', checked: currentLocations.cookies },
          { name: 'WebKit', value: 'webkit', checked: currentLocations.webkit },
          {
            name: 'System-wide locations (requires admin)',
            value: 'systemWide',
            checked: currentLocations.systemWide,
          },
        ];

        try {
          const selected = await checkbox({
            message: 'Select scan locations:',
            choices,
          });

          // Update config
          config.scanLocations = {
            caches: selected.includes('caches'),
            preferences: selected.includes('preferences'),
            applicationSupport: selected.includes('applicationSupport'),
            logs: selected.includes('logs'),
            savedState: selected.includes('savedState'),
            cookies: selected.includes('cookies'),
            webkit: selected.includes('webkit'),
            systemWide: selected.includes('systemWide'),
          };

          await saveConfig(config);
          success('Scan locations updated.');
        } catch {
          // User cancelled
          warning('Cancelled.');
        }
        break;
      }

      case 'excluded': {
        // Manage excluded apps
        console.log();
        console.log(chalk.bold('Excluded Apps:'));
        if (config.excludedApps.length === 0) {
          info('No apps excluded.');
        } else {
          config.excludedApps.forEach((bundleId, index) => {
            console.log(`${index + 1}. ${bundleId}`);
          });
        }
        console.log();

        const action = await promptInput('Add bundle ID to exclude (or leave empty to skip):');

        if (action && action.trim() !== '') {
          const bundleId = action.trim();
          if (!config.excludedApps.includes(bundleId)) {
            config.excludedApps.push(bundleId);
            await saveConfig(config);
            success(`Added ${bundleId} to exclusion list.`);
          } else {
            warning('Bundle ID already in exclusion list.');
          }
        }

        // Option to remove
        if (config.excludedApps.length > 0) {
          const shouldRemove = await promptConfirm('Remove an excluded app?', false);

          if (shouldRemove) {
            const removeId = await promptInput('Enter bundle ID to remove:');
            if (removeId && config.excludedApps.includes(removeId)) {
              config.excludedApps = config.excludedApps.filter((id) => id !== removeId);
              await saveConfig(config);
              success(`Removed ${removeId} from exclusion list.`);
            } else {
              warning('Bundle ID not found in exclusion list.');
            }
          }
        }
        break;
      }

      case 'dryrun': {
        // Toggle dry run mode
        config.dryRun = !config.dryRun;
        await saveConfig(config);
        success(`Dry run mode ${config.dryRun ? 'enabled' : 'disabled'}.`);
        break;
      }

      case 'reset': {
        // Reset to defaults
        const confirmed = await confirm({
          message: 'Are you sure you want to reset configuration to defaults?',
          default: false,
        });

        if (confirmed) {
          await resetConfig();
          success('Configuration reset to defaults.');
        } else {
          warning('Reset cancelled.');
        }
        break;
      }
    }
  }

  info('Configuration saved.');
}
