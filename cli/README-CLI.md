# Odin CLI
A command-line tool for creating and developing web applications with Odin.

## Install
```
npm install -g @infor-up/m3-odin-cli
```

## Quick start
The `odin new` command will help you to interactively set up a new application.
```
> odin new
> cd myProject/
> npm install
> odin serve --port 8080
```

## Usage
The globally install NPM package will add `odin` to your PATH. It accepts the following commands:

### Help
```
# Show available commands and options:
> odin --help

# Show help for the 'new' command.
> odin new --help
```

### New
```
# Interactively create a new project
> odin new

# Create a basic project with no view frameworks or style libraries:
> odin new projectName

# Create an Angular project
> odin new projectName --angular

# Create an Angular project with SOHO
> odin new projectName --angular --soho

# Create an Angular project prepared with an M3 proxy
> odin new projectName --angular --proxy 'https://my.m3.environment:1234'

# Create a project with SOHO style & controls, but no Angular
> odin new projectName --soho

# Create a project with Material Design controls, but no Angular
> odin new projectName --material
```
You can always use the `--proxy` option when creating a new project to configure the API proxy. You can also modify it by changing the URL in `odin.json` or using the `odin set m3-proxy` command.

### Serve
The `serve` command will start a web server and build tools.
```
> odin serve

> odin serve --port 8080
```

### Build
The `build` command is used to build your code for production use. It will perform minification, tree-shaking and other optimizations and output the result to the `dist/` directory.
```
> odin build
```

### Set
The `set` command can be used to configure an existing project:
```
# Set project name
> odin set name myNewProjectName

# Configure M3 Proxy
> odin set m3-proxy https://example.com

# Configure ION API Proxy
> odin set ion-proxy https://ion.example.com/tenant
```
This is the preferred way to configuring things, rather than manually editing `odin.json`.

Available configuration keys are:
* name
* m3-proxy
* ion-proxy

## Angular Configuration
Odin depends on [`@angular/cli`](https://github.com/angular/angular-cli) for creating, serving and building Angular projects. Most of the configuration is read from `angular.json`. You can make changes to this file if you want to for instance:
- enable verbose logging
- enable sourcemaps
- add vendor scripts and assets

Note that the Odin CLI depends on some configuration to remain unchanged. For instance:
- Project name (handled in `odin.json`)
- Proxy (handled in `odin.json`)
- Output path (should always be `"dist"`)

The dev server (`odin serve`) must be restarted for changes to take effect.

### Example: Enabling sourcemaps in production builds
1. Open `angular.json`
2. Find the configuration for production builds (`projects > [projectName] > architect > build > configurations > production`)
3. Add `"sourceMap": true`
4. Build with `odin build`

### Example: Change SOHO theme
1. Open `angular.json`
2. Find references to `ids-enterprise/dist/css/light-theme.css` and replace it with the theme of your choice.

### Example: Remove SOHO languages
All SOHO languages are included in the bundle by default. To reduce the size and load-time of your application, you can remove any languages that you do not want to support.
1. Open `angular.json`
2. Find the `scripts` list which contain paths to e.g `"node_modules/ids-enterprise/dist/js/cultures/sv-SE.js"` and remove languages that you will not support.
