# Developer Guide

This guide explains how to build, test, and develop with the M3 H5 SDK locally.

## Prerequisites

- Node.js >= 20.11.0 (use [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows) to manage versions)
- npm (bundled with Node.js)

## Repository Structure

```
m3-h5-sdk/
├── m3-odin/          # Angular workspace containing the SDK libraries
│   ├── projects/
│   │   └── infor-up/
│   │       ├── m3-odin/          # Core library (framework-agnostic)
│   │       └── m3-odin-angular/  # Angular wrapper services
│   └── src/                      # Samples application
├── cli/              # @infor-up/m3-odin-cli package
│   ├── src/          # CLI source code
│   └── boilerplate/  # Templates for `odin new`
└── dist/             # Documentation output
```

## Building

### 1. Build the SDK libraries

```bash
cd m3-odin
npm install
npm run build:libs
```

This builds both `@infor-up/m3-odin` (core) and `@infor-up/m3-odin-angular` in sequence.

### 2. Build the CLI

```bash
cd cli
npm install
npm run build
```

## Running Tests

```bash
cd m3-odin
npm run test:once
```

This runs all unit tests for `@infor-up/m3-odin` in headless Chrome.

## Local Development with a Test App

### Recommended: npm pack (Windows & macOS)

The `npm pack` approach installs the library as a real package, avoiding the dual-package resolution issues that `file:` protocol causes on Windows with Angular's dependency injection.

```bash
# 1. Build libraries
cd m3-odin
npm run build:libs

# 2. Pack the built libraries
cd dist/infor-up/m3-odin
npm pack
# Creates infor-up-m3-odin-9.0.0.tgz

cd ../m3-odin-angular
npm pack
# Creates infor-up-m3-odin-angular-9.0.0.tgz

# 3. In your test app, install from the tarballs
cd /path/to/your-test-app
npm install /path/to/m3-h5-sdk/m3-odin/dist/infor-up/m3-odin/infor-up-m3-odin-9.0.0.tgz
npm install /path/to/m3-h5-sdk/m3-odin/dist/infor-up/m3-odin-angular/infor-up-m3-odin-angular-9.0.0.tgz
```

After making changes to the SDK, rebuild, repack, and reinstall:

```bash
# In m3-odin/
npm run build:libs

# Repack (run from each dist directory)
cd dist/infor-up/m3-odin && npm pack
cd ../m3-odin-angular && npm pack

# In your test app — clear cache and reinstall
cd /path/to/your-test-app
```

Then clear the Angular cache and reinstall (see below).

### Alternative: file protocol (macOS/Linux only)

On macOS and Linux, `file:` protocol references work well for rapid iteration:

```json
{
  "dependencies": {
    "@infor-up/m3-odin": "file:../m3-h5-sdk/m3-odin/dist/infor-up/m3-odin",
    "@infor-up/m3-odin-angular": "file:../m3-h5-sdk/m3-odin/dist/infor-up/m3-odin-angular"
  }
}
```

**Warning:** On Windows, `file:` protocol can cause Angular `NG0203` injection errors due to the bundler resolving Angular imports to different module instances. Use `npm pack` instead.

### Clearing the Angular build cache

After updating the SDK libraries, the Angular dev server may serve stale compiled code from its cache. Clear it whenever you update library dependencies:

```bash
# Linux / macOS
rm -rf .angular node_modules/.cache

# Windows (PowerShell)
Remove-Item -Recurse -Force .angular -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
```

**When to clear:**
- After running `npm install` with updated tarballs
- After upgrading the SDK version
- If you see stale behavior or errors that don't match the current source

Then restart the dev server (`odin serve` or `ng serve`).

### Testing the CLI locally

```bash
# Install the CLI globally from local source
cd cli
npm run build
npm install -g .

# Now `odin` commands use your local build
odin --version
odin new my-test-app --angular --soho --install --skip-git -p https://your-m3.example.com -po https://your-portal.example.com
```

## Quick Iteration Workflow

For rapid development:

1. Make changes to library source in `m3-odin/projects/infor-up/...`
2. Rebuild: `npm run build:libs` (takes ~3 seconds)
3. If using file protocol deps, just `npm install` in the test app
4. If using npm pack, re-pack and re-install

## Publishing (Maintainers Only)

See `release-checklist-8.0.0.md` for the full release process. The short version:

```bash
# Update version everywhere
cd m3-odin
npm run odin-update-version 9.0.0

# Build & verify
npm run build:libs

# Publish (requires npm login)
npm run odin-publish
```

## Architecture Notes

### Zoneless Change Detection

The Angular wrapper (`@infor-up/m3-odin-angular`) uses Angular's `HttpClient` for all HTTP requests. This ensures proper change detection notifications in zoneless applications (Angular 20+ with `provideZonelessChangeDetection()`).

The core library (`@infor-up/m3-odin`) also provides a standalone `AjaxHttpService` using raw `XMLHttpRequest`, which is used when the library runs outside Angular (e.g., in the basic/non-Angular template). This transport does NOT trigger Angular change detection and should not be used directly in Angular apps.

### Standalone vs NgModule

The SDK supports both patterns:

- **New apps (recommended):** Use `provideM3Odin()` in your `app.config.ts`
- **Legacy apps:** Continue using `M3OdinModule` in your `AppModule` (deprecated but functional)
