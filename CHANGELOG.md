# 8.0.0

## TODO

- Review all changed files and discard unnecessary changes.
- Rebase on top of master branch.
- Update version to 8.0.0.
- Remove this TODO.

## BREAKING CHANGES

All M3 MI API requests will now use version 2 end-points as default. Any differencies in response format should be handled by existing utility classes and interfaces, e.g. `MIService` and `MIRecord`, not requiring any code changes except a rebuild of applications.

There are a few differences regarding meta data. The v2 end-points do not natively support the includeMetadata flag. This version of the SDK will instead perform an additional call to MRS001MI LstAdtFieldInf and then combine the results.
For M3 API v1 calls the SDK injected the metadata in multiple parts of the response, both in record, records and also in a separate metadata property. Since this is quite redundant the SDK will only include metadata in the specific property for M3 API v2 calls.

Note: V1 API calls maintain the legacy behavior where the URL parameter `;metadata=true` is always sent to the M3 API (regardless of the includeMetadata setting) to avoid breaking existing applications. This legacy behavior will be removed when V1 support is discontinued. V2 API calls correctly respect the includeMetadata flag (defaulting to false when omitted).

It is still **highly recommended** to verify correct behavior of all API calls used in your applications!

In case of any issues the M3 API v1 end-points can still be used by passing a new optional property in the options of the MIRequest: `version: 1 || 2`.

## Change log

- Implemented parallel execution paths for M3 API v1 and v2 end-points.
- Added `version` as new property in `IMIOptions`.
- Changed default version from 1 to 2 (can be overridden per request).
- Implemented `typedOutput` support for V2 endpoints (automatic type conversion for dates and numbers based on metadata).
- V2 error handling now matches V1 behavior: errors are returned via the success callback as `IMIResponse` objects with error properties, not as HTTP errors.
- V2 metadata fetching: When `typedOutput: true`, metadata is automatically fetched for type conversion but only included in the response if `includeMetadata: true`.

# 7.2.0

- Added new `login-cloud` command.
- `odin new` command has been modified to accept a value for portal url.

## Notes

- To use the new `login-cloud` command in an existing project, you need to update your `odin.json` file to include the following properties (update with your own urls):
  ```json
  {
    "m3Url": "https://m3xyz.m3.xyz.inforcloudsuite.com",
    "portalUrl": "https://mingle-xyz-portal.xyz.inforcloudsuite.com"
  }
  ```

# 7.1.1

- Export of MIUtil and Bookmark classes.

# 7.1.0

## Updated dependencies

- Fix version for `ids-enterprise-ng` to be at `18.2.4`.

## Known Issues

-

# 7.0.0

## BREAKING CHANGES

There have been major version updates to angular and ids-enterprise-ng dependencies. These require NodeJS >= 18.13.0 ([See Angular Version compatability](https://angular.dev/reference/versions)) to be installed.
Built-in support for Material Design has been removed.

## Updated dependencies

- Angular 18
- IDS Enterprise Components 18

## Upgrading from version 6

1. Install a supported `node` version (>=18.13.0). Recommended to use [nvm](https://github.com/nvm-sh/nvm) if you need to switch between different node versions.

2. Install the latest CLI:

```sh
npm i -g @infor-up/m3-odin-cli@latest
```

3. Remove current `node_modules` and `package-lock.json` from your project.
4. Update all Angular 18 dependencies to `"^18.2.4"` in your package.json file.
5. Update `ids-enterprise-ng` to `"18.2.4"`
6. Run `npm install`

## Upgrading - alternative

1. With newest `m3-odin-cli` installed globally, create a new project.
2. Open project and copy the `dependencies` and `peerDependencies`
3. Add copied dependiencies to your project, remove duplicated old ones.
4. Remove old `node_modules` and `package-lock.json`
5. Run `npm install`

## Known Issues

- `ids-enterprise-ng` >`18.2.4` is not working at the time of writing.

# 6.0.0

## BREAKING CHANGES

There have been major version updates to many dependencies. These require NodeJS 16.x (LTS) to be installed.

## Updated dependencies

- Angular 14
- IDS Enterprise Components 14

## Upgrading from version 5

(Based on a newly created project with Odin version 5.0.0 `odin new --soho --angular`)

1. Install the latest CLI:

```sh
npm i -g @infor-up/m3-odin-cli@latest
```

2. Upgrade from Angular 12 to 13 (since `ng update` doesn't handle skipping versions):

```sh
# NOTE: I needed --force to deal with npm peerDependencies mistmatching in some packages
ng update @angular/core@13 @angular/cli@13 --force
```

3. Stage/commit changes so that the working directory is clean (alternatively use `--allow-dirty` below)
4. Upgrade from Angular 13 to 14, and other dependencies including Odin:

```sh
# NOTE: You might want to add karma, jasmine and other dev dependencies here as well.
# The update command won't do anything special when upgrading them, but you might need it to sync peer dependencies
ng update @angular/core @angular/cli ids-enterprise-ng @infor-up/m3-odin @infor-up/m3-odin-angular rxjs typescript
```

## Known Issues

- Issue with installing conflicting dependencies: https://github.com/infor-cloud/m3-h5-sdk/issues/146
- Some have reported an issue with running `ng test` after upgrading Karma. See [this diff in karma.conf.js](https://github.com/infor-cloud/m3-h5-sdk/pull/147/files#diff-cb1252fe3e31974e46fa65268f681b2c20e9023cefd39dfd03fc7a267124b73e) for how to replace the deprecated `"karma-coverage-istanbul-reporter"` plugin with the `"karma-coverage"` plugin.

# 5.0.0

## Changes

- **cli:** New IDS/Soho projects now uses the "new"/"uplift" theme by default, since this is the default theme in H5. Older applications are not affected by this.
- **samples:** Added a Theme sample

## Updated dependencies

- Angular 12
- IDS Enterprise Components 10.1

## Upgrading from version 4

1. Install the latest CLI

```
npm i -g @infor-up/m3-odin-cli@latest
```

2. Upgrade existing project dependencies:

```
ng update @infor-up/m3-odin @infor-up/m3-odin-angular @angular/cli @angular/core ids-enterprise-ng
```

# 4.0.0

## Changes

- **all:** Updated dependencies
- **cli:** The `experimental-login` command is now `login`. [See here](https://github.com/infor-cloud/m3-h5-sdk/issues/55#issuecomment-651713612) for more.
- **samples:** Now using Highlight.js 10 in samples, fixed an issue where highlighting was not properly initialized.

## Updated Dependencies

- IDS Enterprise Components 9.1
- Angular 11
- Typescript 4
- Highlight.js 10

## Upgrading from version 3

1. Install the latest CLI:

```
npm i -g @infor-up/m3-odin-cli@latest
```

2. Upgrade existing project dependencies (assuming IDS & Angular is used):

```
ng update @infor-up/m3-odin @infor-up/m3-odin-angular @angular/cli @angular/core ids-enterprise-ng codelyzer
```

# 3.0.2

## Bug fixes

- **core:** `MIResponse` properly handles partial errors [#77](https://github.com/infor-cloud/m3-h5-sdk/issues/75)
- **cli:** New projects uses ids-enterprise-ng version 7.8, which [contains a fix for Chrome users on Mac OS Big Sur](https://github.com/infor-design/enterprise/issues/4612)
- **cli:** New IDS projects waits for asynchronous `Soho.Locale.set` on app initialization.

# 3.0.1

This release contains major updates to dependencies (TypeScript, Angular, IDS Enterprise Components and more). It also contains a new (experimental) way of signing in to multi-tenant environments during development.

## Upgrading

Existing projects can be updated with `ng update`. The process may differ depending on how the project is set up, and what other dependencies are installed. For a typical project using the IDS Angular Components, the following should do most of the work:

```bash
ng update @infor-up/m3-odin @infor-up/m3-odin-angular @angular/core@9 @angular/cli@9 ids-enterprise-ng codelyzer typescript@3.8
```

Don't forget to install the latest `@infor-up/m3-odin-cli`.

The IDS Angular Components may require changes to `angular.json`. See [IDS Quickstart guide](https://github.com/infor-design/enterprise-ng/blob/master/docs/QUICKSTART.md) or [this diff](https://github.com/infor-cloud/m3-h5-sdk/compare/v2.2.1...v3.0.1#diff-c7890ab62092b26852224e2b1eaed9b3)

Further update instructions are given by the `ng update` command and https://update.angular.io/

You may also need to install NodeJS 12.x (LTS).

## Features

- **cli:** New `experimental-login` command for multi-tenant login
- **angular:** Possibility to configure `IonApiService` using the injectable `IonApiConfig`

## Bug fixes

- **angular:** `IonApiService` no longer uses `XMLHttpRequest.withCredentials` by default. This was causing CORS issues in some environments [#41](https://github.com/infor-cloud/m3-h5-sdk/issues/41)
- **cli:** The development proxy will not forward CSRF requests and headers when proxying M3 requests to ION API.
- **cli:** The development proxy will modify the Origin header so that POST requests are accepted by ION API.

## Dependency updates

- **cli:** Upgrade to Angular 9
- **cli:** Requires NodeJS 12.x (LTS)
- **cli:** No longer uses `node-sass`, which was not working on newer NodeJS versions.

## BREAKING CHANGES

There have been major version updates to many dependencies. These require NodeJS 12.x (LTS) to be installed.

The IDS Angular Components require changes to `angular.json` to properly fetch assets, styles and scripts. New projects will not need to be changed, but older ones do. See **Upgrading** section above.

# 2.2.1

## Bug fixes

- **core:** Properly set CurrentCompany, CurrentDivision & CurrentLanguage on UserContext. Fixes [#27](https://github.com/infor-cloud/m3-h5-sdk/issues/27) and [#7](https://github.com/infor-cloud/m3-h5-sdk/issues/7)

# 2.2.0

## Features

- **core:** Include CSRF token in requests to /m3api-rest. _This will be required in future versions of M3_.

If you for any reason want to opt out from this feature, you can do so by setting the `IMIRequest.enableCsrf` property to `false`:

```typescript
const request: IMIRequest = {
  program: '...',
  transaction: '...',
  enableCsrf: false,
};
```

# Older

For older releases, see https://github.com/infor-cloud/m3-h5-sdk/releases
