# M3 Odin

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.0-rc.5.

---

## Packaging & publishing

### Update version

The version script will updated the version in the package.json files for each package. The commands below assumes the working directory `m3-odin`

`npm run odin-update-version 2.0.0`

### Create package files

The pack script will create npm packages in the `/dist` directory in the root.

`npm run odin-pack`

### Publish packages

`npm login`

`npm run odin-publish`

### Update version and publish packages

`npm run odin-publish-version 2.0.0`

### Build documentation

`npm run odin-documentation`

### Package documentation

`npm run odin-pack-documentation`

### Package samples

`npm run odin-pack-samples`

### Package SDK

Packs the NPM packages, documentation and samples in the dist directory.
`npm run odin-pack-sdk`

---

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:8080/`. The app will automatically reload if you change any of the source files.

Run `ng serve --proxy-config proxy.conf.json` for a dev server with proxy for M3 MI.

_Proxy test URL:
http://localhost:8080/m3api-rest/execute/MNS150MI/GetUserData_

Run
`ng serve --ssl --ssl-key private.pem --ssl-cert public.pem
ng serve --host hostname --ssl --ssl-key private.pem --ssl-cert public.pem` to serve with SSL.

---

## VS Code tasks

**Use `Ctrl + Shift + P` in VS Code and type `"tasks"` to see a full list of available tasks.**

#### Build tasks

**Use `Ctrl + Shift + B` in VS Code to see a list of available build tasks.**

Run `Dev: start (Dev)` for a dev server with a proxy configuration.

Run `Dev: build aot (Dev)` to build the Sample project using aot compilation.

Run `Core: build (Core)` to build the Core project.

Run `Angular: build (Odin Angular)` to build the Odin Angular project.

Run `CLI: watch (CLI)` to build and watch the CLI project.

Run `CLI: build (CLI)` to build the CLI project.

#### Test tasks

Run `npm: test (Dev)` to run all unit tests continously.

Run `npm: test:once (Dev)` to run all unit tests as a single-run.

---

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

---

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

---

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

---

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

---

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
