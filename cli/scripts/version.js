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
    c.title('Update M3 Odin versions');
    var directories = [
        'm3-odin/src/core',
        'm3-odin/src/angular',
        'm3-odin',
        'cli'
    ];
    var files = [
        'm3-odin/package-lock.json',
        'm3-odin/src/angular/package.json',
        'cli/boilerplate/basic/package.json',
        'cli/boilerplate/basic-material/package.json',
        'cli/boilerplate/angular/package.json',
        'cli/boilerplate/angular-soho/package.json',
        'cli/boilerplate/angular-material/package.json'
    ];
    updateVersions();
    function updateVersions() {
        var version = getVersion();
        if (!version) {
            var message = 'Version parameter missing';
            console.log(message);
            throw new Error(message);
        }
        var currentDirectory = process.cwd();
        var baseDirectory = path.join(__dirname, '../../');
        var directory;
        for (var _i = 0, directories_1 = directories; _i < directories_1.length; _i++) {
            var directory_1 = directories_1[_i];
            directory_1 = path.join(baseDirectory, directory_1);
            updateVersionWithNpm(directory_1, version);
        }
        var keyNames = ['@infor-up/m3-odin', '@infor-up/m3-odin-angular', '@infor-up/m3-odin-cli'];
        for (var _a = 0, files_1 = files; _a < files_1.length; _a++) {
            var file = files_1[_a];
            var filename = path.join(baseDirectory, file);
            updateVersionInFile(filename, version, keyNames);
        }
        process.chdir(currentDirectory);
    }
    function updateVersionInFile(filename, version, names) {
        var operation = c.begin('Update versions in file');
        console.log('Filename: ' + filename);
        var content = fs.readFileSync(filename, 'utf8');
        var json = JSON.parse(content);
        var existingVersion = findExistingVersion(json, names);
        if (existingVersion) {
            console.log('Found existing version: ' + existingVersion);
            console.log('Replacing with version: ' + version);
            for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
                var name = names_1[_i];
                var search = "\"" + name + "\": \"" + existingVersion + "\"";
                var replace = "\"" + name + "\": \"" + version + "\"";
                content = c.replaceAll(content, search, replace);
            }
            fs.writeFileSync(filename, content, 'utf8');
        }
        else {
            console.error('No existing version found');
        }
        c.end(operation);
    }
    function findExistingVersion(json, names) {
        if (typeof json !== 'object') {
            return null;
        }
        var keys = Object.keys(json);
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            var value = json[key];
            if (value && typeof value === 'string') {
                for (var _a = 0, names_2 = names; _a < names_2.length; _a++) {
                    var name = names_2[_a];
                    if (key === name) {
                        return value;
                    }
                }
            }
            value = findExistingVersion(value, names);
            if (value) {
                return value;
            }
        }
        return null;
    }
    function updateVersionWithNpm(directory, version) {
        var operation = c.begin('Update npm version');
        console.log('Directory: ' + directory);
        console.log('Version: ' + version);
        process.chdir(directory);
        c.execSync('npm version ' + version + ' --allow-same-version');
        c.end(operation);
    }
    function getVersion() {
        var argv = process.argv;
        if (argv.length >= 3) {
            return argv[2];
        }
        return null;
    }
});
