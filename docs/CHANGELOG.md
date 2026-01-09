# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-01-10

### Added

- Initial release
- Interactive CLI tool for cleaning up leftover application files on macOS
- `scan` command to scan applications for leftover files
- `remove` command to remove leftover files for specific applications
- `leftovers` command to find orphaned files from uninstalled applications
- `config` command for configuration management
- Detection of leftover files in Library directories (Caches, Preferences, Application Support, Logs, etc.)
- Interactive menu mode with file selection and confirmation prompts

[Unreleased]: https://github.com/minagishl/void/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/minagishl/void/releases/tag/v0.1.0
