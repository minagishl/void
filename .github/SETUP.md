# GitHub Actions Setup Guide

This project uses GitHub Actions for continuous integration and automated publishing to npm.

## Workflows

### 1. CI (Continuous Integration)

**File**: `.github/workflows/ci.yml`

**Triggers**:

- Push to `main` branch
- Pull requests to `main` branch

**Jobs**:

- **lint-and-format**: Runs ESLint and Prettier checks
- **build**: Builds the project and uploads artifacts

### 2. Release

**File**: `.github/workflows/release.yml`

**Triggers**:

- Push tags matching `v*.*.*` (e.g., `v1.0.0`, `v2.1.3`)

**Jobs**:

- Runs linting and formatting checks
- Builds the project
- Updates package.json version from tag
- Publishes to npm with provenance signatures
- Creates a GitHub release with build artifacts

### 3. Test

**File**: `.github/workflows/test.yml`

**Triggers**:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs**:

- Tests on multiple OS (Ubuntu, macOS)
- Tests on multiple Node.js versions (18.x, 20.x, 22.x)
- Runs linting, formatting, build, and CLI tests

## Required Secrets

To enable automatic publishing to npm, you need to set up the following secret in your GitHub repository:

### NPM_TOKEN

1. Go to [npmjs.com](https://www.npmjs.com/) and log in
2. Click on your profile icon → "Access Tokens"
3. Click "Generate New Token" → "Classic Token"
4. Select "Automation" type (allows publishing from CI/CD)
5. Copy the generated token
6. Go to your GitHub repository → Settings → Secrets and variables → Actions
7. Click "New repository secret"
8. Name: `NPM_TOKEN`
9. Value: Paste the token from step 5
10. Click "Add secret"

## Release Process

### Automated Release (Recommended)

1. Update the version in your working branch:

   ```bash
   npm version patch  # for bug fixes (1.0.0 -> 1.0.1)
   npm version minor  # for new features (1.0.0 -> 1.1.0)
   npm version major  # for breaking changes (1.0.0 -> 2.0.0)
   ```

2. Push the changes and tags:

   ```bash
   git push origin main --follow-tags
   ```

3. GitHub Actions will automatically:
   - Run all checks (lint, format, build)
   - Publish to npm with provenance
   - Create a GitHub release

### Manual Release

If you need to publish manually:

```bash
# Build the project
bun run build

# Publish to npm (requires npm login)
npm publish --provenance --access public
```

## Provenance

This project uses npm's provenance feature, which:

- Cryptographically links the published package to its source code
- Provides transparency about where and how the package was built
- Can be verified using `npm audit signatures`

## Troubleshooting

### Release workflow fails with "OIDC token missing"

This means GitHub's OIDC token provider is not enabled. Make sure:

1. The workflow has `id-token: write` permission (already configured)
2. Your repository settings allow GitHub Actions to use OIDC tokens

### npm publish fails with 403 error

Check:

1. `NPM_TOKEN` secret is correctly set
2. The token has "Automation" type permissions
3. The token is not expired
4. You have publish access to the `@minagishl` scope

### Version mismatch

The release workflow automatically updates `package.json` version from the git tag. Make sure:

1. The tag format is `vX.Y.Z` (e.g., `v1.0.0`)
2. The tag is pushed to GitHub before the workflow runs

## Badges

Add these badges to your README.md:

```markdown
[![CI](https://github.com/minagishl/void/actions/workflows/ci.yml/badge.svg)](https://github.com/minagishl/void/actions/workflows/ci.yml)
[![Release](https://github.com/minagishl/void/actions/workflows/release.yml/badge.svg)](https://github.com/minagishl/void/actions/workflows/release.yml)
[![npm version](https://badge.fury.io/js/%40minagishl%2Fvoid.svg)](https://www.npmjs.com/package/@minagishl/void)
```
