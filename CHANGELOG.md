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
* **core:** `MIResponse` properly handles partial errors [#77](https://github.com/infor-cloud/m3-h5-sdk/issues/75)
* **cli:** New projects uses ids-enterprise-ng version 7.8, which [contains a fix for Chrome users on Mac OS Big Sur](https://github.com/infor-design/enterprise/issues/4612)
* **cli:** New IDS projects waits for asynchronous `Soho.Locale.set` on app initialization.

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
* **cli:** New `experimental-login` command for multi-tenant login
* **angular:** Possibility to configure `IonApiService` using the injectable `IonApiConfig`

## Bug fixes
* **angular:**  `IonApiService` no longer uses `XMLHttpRequest.withCredentials` by default. This was causing CORS issues in some environments [#41](https://github.com/infor-cloud/m3-h5-sdk/issues/41)
* **cli:** The development proxy will not forward CSRF requests and headers when proxying M3 requests to ION API.
* **cli:** The development proxy will modify the Origin header so that POST requests are accepted by ION API.

## Dependency updates
* **cli:** Upgrade to Angular 9
* **cli:** Requires NodeJS 12.x (LTS)
* **cli:** No longer uses `node-sass`, which was not working on newer NodeJS versions.

## BREAKING CHANGES
There have been major version updates to many dependencies. These require NodeJS 12.x (LTS) to be installed.

The IDS Angular Components require changes to `angular.json` to properly fetch assets, styles and scripts. New projects will not need to be changed, but older ones do. See **Upgrading** section above.

# 2.2.1

## Bug fixes
* **core:** Properly set CurrentCompany, CurrentDivision & CurrentLanguage on UserContext. Fixes [#27](https://github.com/infor-cloud/m3-h5-sdk/issues/27) and [#7](https://github.com/infor-cloud/m3-h5-sdk/issues/7)

# 2.2.0

## Features
* **core:** Include CSRF token in requests to /m3api-rest. *This will be required in future versions of M3*.

If you for any reason want to opt out from this feature, you can do so by setting the `IMIRequest.enableCsrf` property to `false`:

```typescript
const request: IMIRequest = {
  program: "...",
  transaction: "...",
  enableCsrf: false,
};
```

# Older
For older releases, see https://github.com/infor-cloud/m3-h5-sdk/releases
