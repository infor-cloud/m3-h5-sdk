(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs-extra", "path", "./common"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fs = require("fs-extra");
    var path = require("path");
    var c = require("./common");
    c.title('Publish M3 Odin');
    var compilerPath = resolveCompilerPath();
    var ngcCompilerPath = resolveNgcCompilerPath();
    var distPath = resolveDistPath();
    // You will need to login before running this, eg npm login
    // Test with npm whoami
    publishCore();
    publishAngular();
    publishAngularBuilder();
    publishCli();
    function resolveDistPath() {
        var directory = path.join(__dirname, '../../dist');
        c.createDirectory(directory);
        return directory;
    }
    function resolveCompilerPath() {
        return path.join(__dirname, '../node_modules/typescript/bin/tsc');
    }
    function resolveNgcCompilerPath() {
        return path.join(__dirname, '../../m3-odin/node_modules/.bin/ngc');
    }
    function publishNpm(directory) {
        var operation = c.begin('Publish NPM');
        console.log('Publish directory: ' + directory);
        console.log('Output directory: ' + distPath);
        var currentDirectory = process.cwd();
        process.chdir(distPath);
        var version = fs.readJsonSync(path.join(directory, 'package.json')).version;
        var tag = version.includes('-next') ? ' --tag next' : '';
        c.execSync('npm publish ' + directory + ' --access public' + tag);
        if (directory !== currentDirectory) {
            process.chdir(currentDirectory);
        }
        c.end(operation);
    }
    function publishCore() {
        var operation = c.begin('Publish M3 Odin Core');
        c.npmRun('build:lib-core', c.projectDirectory());
        var directory = c.projectDirectory('projects/infor-up/m3-odin');
        publishNpm(directory);
        c.end(operation);
    }
    function publishAngular() {
        var operation = c.begin('Publish M3 Odin Angular');
        c.npmRun('build:lib-angular', c.projectDirectory());
        var projectDistDirectory = c.projectDirectory('dist/infor-up/m3-odin-angular');
        publishNpm(projectDistDirectory);
        c.end(operation);
    }
    function publishAngularBuilder() {
        var operation = c.begin('Publish M3 Odin Angular Builder');
        c.npmRun('build:lib-angular-builder', c.projectDirectory());
        var projectDistDirectory = c.projectDirectory('dist/infor-up/m3-odin-angular-builder');
        publishNpm(projectDistDirectory);
        c.end(operation);
    }
    function publishCli() {
        var operation = c.begin('Publish M3 Odin CLI');
        var directory = path.join(__dirname, '../');
        c.runClean(directory);
        c.buildTypeScript(directory, compilerPath);
        publishNpm(directory);
        c.end(operation);
    }
});
