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
        var tag = process.env.TAG ? ' --tag ' + process.env.TAG : '';
        var currentDirectory = process.cwd();
        process.chdir(distPath);
        c.execSync('npm publish ' + directory + ' --access public' + tag);
        if (directory !== currentDirectory) {
            process.chdir(currentDirectory);
        }
        c.end(operation);
    }
    function publishCore() {
        var operation = c.begin('Publish M3 Odin Core');
        var directory = path.join(__dirname, '../../m3-odin/src/core');
        c.runClean(directory);
        c.buildTypeScript(directory, compilerPath);
        publishNpm(directory);
        c.end(operation);
    }
    function publishAngular() {
        var operation = c.begin('Publish M3 Odin Angular');
        var directory = path.join(__dirname, '../../m3-odin/src/angular');
        c.runClean(directory);
        c.buildNgc(directory, ngcCompilerPath);
        // Move files in dist directory from /dist/src/angular to /dist and remove src directory
        var ngcOutputDirectory = path.join(directory, 'dist/src/angular');
        var distDirectory = path.join(directory, 'dist');
        var files = fs.readdirSync(ngcOutputDirectory);
        c.copyFiles(ngcOutputDirectory, distDirectory, files);
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            fs.removeSync(path.join(ngcOutputDirectory, file));
        }
        publishNpm(directory);
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
