# void

Interactive CLI tool for cleaning up leftover application files on macOS.

Similar to AppCleaner, `void` helps you find and remove leftover files from applications, freeing up disk space and keeping your system clean.

## Features

- **Smart Detection** - Automatically detects leftover files by scanning common macOS locations
- **App-Specific Cleanup** - Target specific applications or scan everything at once
- **Orphaned Files** - Find files from apps you've already uninstalled
- **Safe by Default** - Always confirms before deletion and excludes system apps
- **Configurable** - Customize scan locations and excluded apps
- **Interactive UI** - Beautiful terminal interface with easy navigation

## Installation

Install globally via npm:

```bash
npm install -g @minagishl/void
```

Or using Bun:

```bash
bun add -g @minagishl/void
```

## Requirements

- macOS (Darwin)
- Node.js >= 18.0.0

## Usage

### Interactive Mode (Default)

Run `void` without any arguments to launch the interactive menu:

```bash
void
```

This will:

1. Scan your installed applications
2. Detect leftover files for each app
3. Let you select an app to clean
4. Show you exactly what will be deleted
5. Allow you to select specific files or choose all
6. Confirm before removing anything

### Scan for Leftover Files

Scan all applications:

```bash
void scan
```

Scan a specific application:

```bash
void scan Chrome
void scan "Visual Studio Code"
```

This displays a table showing:

- Application name
- Number of leftover files
- Total size of files

### Remove Files

Remove leftover files for a specific app:

```bash
void remove Chrome
void remove "Visual Studio Code"
```

This will:

1. Find the app
2. Detect leftover files
3. Let you select which files to remove
4. Confirm before deletion
5. Show a summary of removed files

### Find Orphaned Files

Find files from apps you've already uninstalled:

```bash
void leftovers
```

This scans your Library directories for files that don't match any currently installed application.

### Configure Settings

Open the interactive configuration menu:

```bash
void config
```

Configuration options:

- **Scan Locations** - Choose which directories to scan:
  - Caches
  - Preferences
  - Application Support
  - Logs
  - Saved State
  - Cookies
  - WebKit
  - System-wide locations (requires admin)
- **Excluded Apps** - Add/remove apps from scanning
- **Dry Run Mode** - Preview what would be deleted without actually deleting
- **Reset to Defaults** - Restore default configuration

### Help

Display help information:

```bash
void --help
void <command> --help
```

## What Gets Detected

`void` scans the following locations for leftover files:

**User Library** (`~/Library/`):

- `Caches/[bundle-id]` or `Caches/[app-name]`
- `Preferences/[bundle-id].plist`
- `Application Support/[app-name]`
- `Logs/[app-name]`
- `Saved Application State/[bundle-id].savedState`
- `Cookies/[bundle-id]`
- `WebKit/[bundle-id]`

**System Library** (`/Library/`) - Optional:

- `Caches/[bundle-id]`
- `Preferences/[bundle-id].plist`
- `Application Support/[app-name]`
- `Logs/[app-name]`

Files are matched by:

1. Bundle ID (e.g., `com.google.Chrome`)
2. Application name (case-insensitive)

## Configuration

Configuration is stored at `~/.void/config.json`.

Default excluded apps:

- `com.apple.Safari`
- `com.apple.Finder`
- `com.apple.SystemUIServer`
- `com.apple.dock`
- `com.apple.loginwindow`

You can modify this list using `void config`.

## Safety

`void` is designed to be safe:

- Always asks for confirmation before deletion
- Shows full file paths before removing
- Excludes critical system apps by default
- Supports dry-run mode
- Never deletes app bundles themselves
- Handles permission errors gracefully

**Note**: Always review files before deletion. While `void` is careful, it's your responsibility to verify what gets removed.

## Examples

### Example 1: Clean up Chrome

```bash
$ void remove Chrome

Searching for "Chrome"... ✓ Found 1 matching application(s)
Detecting leftover files... ✓ Found 15 file(s)

Google Chrome
Bundle ID: com.google.Chrome

? Select files to remove:
  ✓ [Cache] ~/Library/Caches/com.google.Chrome (245.32 MB)
  ✓ [Preference] ~/Library/Preferences/com.google.Chrome.plist (12.45 KB)
  ✓ [Application Support] ~/Library/Application Support/Google/Chrome (1.23 GB)
  ...

? What would you like to do? Remove selected files
? Are you sure you want to remove 15 file(s) (1.48 GB)? Yes

Removing files... ✓ Done!

─────────────────────────────────────────────────────────
Removal Summary:
Total files: 15
Successfully removed: 15
Space freed: 1.48 GB
─────────────────────────────────────────────────────────
```

### Example 2: Scan everything

```bash
$ void scan

Scanning all applications... ✓ Found 127 applications
Detecting leftover files... ✓ Scan complete

Application                              Files      Total Size
──────────────────────────────────────────────────────────────
Visual Studio Code                       23         892.45 MB
Slack                                    12         456.78 MB
Google Chrome                            15         345.67 MB
...
```

### Example 3: Find orphaned files

```bash
$ void leftovers

Scanning for orphaned files... ✓ Found 8 orphaned file group(s)

Orphaned Files:
──────────────────────────────────────────────────────────
1. Old App Name (com.company.oldapp)
   Files: 5, Size: 123.45 MB
2. Another App
   Files: 12, Size: 456.78 MB
...
```

## Development

Built with:

- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [@inquirer/prompts](https://github.com/SBoudrias/Inquirer.js) - Interactive prompts
- [Chalk](https://github.com/chalk/chalk) - Terminal styling
- [Ora](https://github.com/sindresorhus/ora) - Loading spinners

### Building from Source

```bash
# Clone the repository
git clone https://github.com/minagishl/void.git
cd void

# Install dependencies with Bun
bun install

# Run in development mode
bun run dev

# Build for production
bun run build

# The compiled output will be in dist/
```

### Available Scripts

```bash
# Development
bun run dev              # Run CLI in development mode

# Building
bun run build            # Build for production with minification

# Code Quality
bun run lint             # Run ESLint
bun run lint:fix         # Fix ESLint errors automatically
bun run format           # Format code with Prettier
bun run format:check     # Check code formatting
```

### Git Hooks

This project uses Husky for Git hooks:

- **pre-commit**: Runs lint-staged (ESLint + Prettier on staged files)
- **pre-push**: Runs full lint and format check

### Release Process

Releases are automated via GitHub Actions. To create a new release:

1. Update version in `package.json`:

   ```bash
   npm version patch|minor|major
   ```

2. Push the tag to GitHub:

   ```bash
   git push origin main --tags
   ```

3. GitHub Actions will automatically:
   - Run linting and formatting checks
   - Build the project
   - Publish to npm with provenance
   - Create a GitHub release

**Note**: You need to set the `NPM_TOKEN` secret in your GitHub repository settings.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [AppCleaner](https://freemacsoft.net/appcleaner/)
- Built with love for the macOS community

---

**Warning**: This tool modifies your file system. Always ensure you have backups before removing files. The author is not responsible for any data loss.
