(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "path", "./common"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var path = require("path");
    var c = require("./common");
    var name = 'M3 Odin';
    var moduleFormat = 'commonjs';
    var mode = 'file'; // modules | file
    var includes = [
        'm3-odin',
        'm3-odin-angular'
    ];
    c.title('Generate M3 Odin API documentation');
    generate();
    function resolveVersion() {
        var file = path.join(__dirname, '../../m3-odin/package.json');
        return c.getPackageVersion(file);
    }
    function generate() {
        var operation = c.begin('Generating');
        var sourceDirectory = c.projectDirectory('projects/infor-up');
        var targetDirectory = c.projectDirectory('docs');
        var version = resolveVersion();
        console.log('Version: ' + version);
        console.log('Source directory: ' + sourceDirectory);
        console.log('Target directory: ' + sourceDirectory);
        clearDirectory(targetDirectory);
        process.chdir(sourceDirectory);
        var sourceFiles = includes.join(' ');
        var fullName = name + ' - ' + version;
        var command = "typedoc --name \"" + fullName + "\" --readme none --mode " + mode + " --module " + moduleFormat + " --excludeExternals --externalPattern \"*@angular*|*rxjs*\" --excludeNotExported --excludePrivate --ignoreCompilerErrors --out \"" + targetDirectory + "\" " + sourceFiles;
        c.execSync(command);
        c.end(operation);
    }
    function clearDirectory(directory) {
        var operation = c.begin('Clear directory');
        console.log('Directory name: ' + directory);
        c.removeDirectory(directory);
        c.createDirectory(directory);
        c.end(operation);
    }
});
