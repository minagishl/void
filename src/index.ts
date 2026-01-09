#!/usr/bin/env node

import { Command } from 'commander';
import { interactiveMenu } from './commands/index.js';
import { scanCommand } from './commands/scan.js';
import { removeCommand } from './commands/remove.js';
import { leftoversCommand } from './commands/leftovers.js';
import { configCommand } from './commands/config.js';

const program = new Command();

program
  .name('void')
  .description('Interactive CLI tool for cleaning up leftover application files on macOS')
  .version('1.0.0')
  .action(async () => {
    // If no subcommand provided, run interactive menu
    await interactiveMenu();
  });

program
  .command('scan [app-name]')
  .description('Scan for leftover files (optionally for a specific app)')
  .action(async (appName?: string) => {
    await scanCommand(appName);
  });

program
  .command('remove [app-name]')
  .description('Remove leftover files for a specific app')
  .action(async (appName?: string) => {
    await removeCommand(appName);
  });

program
  .command('leftovers')
  .description('Find and remove orphaned files from uninstalled apps')
  .action(async () => {
    await leftoversCommand();
  });

program
  .command('config')
  .description('Configure scan locations and exclusions')
  .action(async () => {
    await configCommand();
  });

program.parse(process.argv);
