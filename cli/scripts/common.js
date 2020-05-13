var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "archiver", "child_process", "fs-extra", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var archiver = require("archiver");
    var p = require("child_process");
    var fs = require("fs-extra");
    var path = require("path");
    exports.title = function (title) {
        console.log('');
        console.log(title);
        var separator = exports.repeat('=', title.length);
        console.log(separator);
    };
    exports.repeat = function (text, length) {
        return new Array(length + 1).join(text);
    };
    exports.round = function (value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    };
    exports.begin = function (operationName) {
        console.log('Begin: ' + operationName + '...');
        return {
            name: operationName,
            start: new Date().getTime()
        };
    };
    exports.end = function (operation) {
        var duration = new Date().getTime() - operation.start;
        var durationText;
        if (duration < 1000) {
            durationText = '(' + duration + ' milliseconds)';
        }
        else {
            durationText = '(' + exports.round(duration / 1000, 1) + ' seconds)';
        }
        console.log('End: ' + operation.name + ' ' + durationText + '\n');
    };
    exports.setWorkingDirectory = function (relativePath) {
        process.chdir(path.join(__dirname, relativePath));
        console.log('Working directory: ' + process.cwd());
    };
    exports.execNodeSync = function (command) {
        var nodeExecutable = process.env.VIRTUAL_NODE || 'node';
        command = nodeExecutable + ' ' + command;
        console.log(command);
        exports.execSync(command);
    };
    exports.execSync = function (command) {
        p.execSync(command, { stdio: 'inherit' });
    };
    exports.createDirectory = function (dir) {
        if (!fs.existsSync(dir)) {
            fs.ensureDirSync(dir);
        }
    };
    exports.removeDirectory = function (dir) {
        if (fs.existsSync(dir)) {
            fs.removeSync(dir);
        }
    };
    exports.isDirectory = function (dir) {
        var stats = fs.statSync(dir);
        return stats.isDirectory();
    };
    exports.copyFiles = function (sourcePath, targetPath, files) {
        exports.createDirectory(targetPath);
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            exports.copyFile(sourcePath, targetPath, file);
        }
    };
    exports.copyFile = function (sourcePath, targetPath, filename) {
        var source = path.join(sourcePath, filename);
        var target = path.join(targetPath, filename);
        fs.copyFileSync(source, target);
    };
    exports.deleteFiles = function (directory, files) {
        for (var _i = 0, files_2 = files; _i < files_2.length; _i++) {
            var file = files_2[_i];
            var filePath = path.join(directory, file);
            fs.removeSync(filePath);
        }
    };
    exports.replaceInFile = function (file, searchValue, replaceValue) {
        var text = fs.readFileSync(file, 'utf8');
        text = text.replace(searchValue, replaceValue);
        fs.writeFileSync(file, text, 'utf8');
    };
    /**
     * Gets the version number from a package.json file.
     *
     * @param file the absolute file path to the package.json file
     */
    exports.getPackageVersion = function (file) {
        var text = fs.readFileSync(file, 'utf8');
        var json = JSON.parse(text);
        return json['version'];
    };
    exports.updatePackageVersion = function (file, version) {
        var text = fs.readFileSync(file, 'utf8');
        var json = JSON.parse(text);
        json['version'] = version;
        fs.writeFileSync(file, JSON.stringify(json, null, 3), 'utf8');
    };
    exports.getFileExtension = function (filename) {
        return filename.substring(filename.lastIndexOf('.') + 1, filename.length) || filename;
    };
    exports.isJavaScript = function (filename) {
        return 'js' === exports.getFileExtension(filename);
    };
    exports.resolveRelativeDirectoryLocation = function (basePath, testPath) {
        // Check current directory
        var directory = path.join(basePath, testPath);
        if (fs.existsSync(directory)) {
            return './';
        }
        // Check parent directories   
        var relativeDirectory = '';
        while (true) {
            relativeDirectory += '../';
            var relativeBaseDirectory = path.join(basePath, relativeDirectory);
            if (!path.basename(relativeBaseDirectory) || !fs.existsSync(relativeBaseDirectory)) {
                break;
            }
            directory = path.join(relativeBaseDirectory, testPath);
            if (fs.existsSync(directory)) {
                return relativeDirectory;
            }
        }
        return null;
    };
    exports.runClean = function (directory) {
        var currentDirectory = process.cwd();
        process.chdir(directory);
        exports.execSync("npm run clean");
        process.chdir(currentDirectory);
    };
    exports.buildTypeScript = function (directory, compilerPath) {
        if (compilerPath === void 0) { compilerPath = ''; }
        var operation = exports.begin('Build TypeScript');
        if (!compilerPath) {
            var nodeModulesPath = exports.resolveRelativeDirectoryLocation(directory, 'node_modules');
            if (!nodeModulesPath) {
                var message = 'Failed to find node_modules directory relative to ' + directory;
                console.log(message);
                throw new Error(message);
            }
            console.log('Path to node_modules: ' + nodeModulesPath);
            compilerPath = path.join(nodeModulesPath, 'typescript/bin/tsc');
        }
        console.log('Working directory: ' + directory);
        console.log('TypeScript compiler: ' + compilerPath);
        var currentDirectory = process.cwd();
        process.chdir(directory);
        exports.execNodeSync(compilerPath);
        if (directory !== currentDirectory) {
            process.chdir(currentDirectory);
        }
        exports.end(operation);
    };
    exports.buildNgc = function (directory, compilerPath) {
        var operation = exports.begin('Build NGC');
        console.log('Working directory: ' + directory);
        console.log('NGC compiler: ' + compilerPath);
        var currentDirectory = process.cwd();
        process.chdir(directory);
        exports.execSync(compilerPath + ' -p tsconfig.json');
        if (directory !== currentDirectory) {
            process.chdir(currentDirectory);
        }
        exports.end(operation);
    };
    exports.replaceAll = function (str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    };
    exports.getTimestamp = function () {
        var tzoffset = (new Date()).getTimezoneOffset() * 60000;
        var date = (new Date(Date.now() - tzoffset)).toISOString();
        date = exports.replaceAll(date, '-', '');
        date = exports.replaceAll(date, ':', '');
        date = date.replace('T', '-');
        return date.slice(0, 15);
    };
    exports.endsWith = function (value, suffix) {
        if (!value) {
            return false;
        }
        return value.indexOf(suffix, value.length - suffix.length) !== -1;
    };
    exports.zip = function (sourceDir, destDir, name) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolvePromise, rejectPromise) {
                    var archive = archiver('zip');
                    fs.ensureDirSync(destDir);
                    var zipPath = path.join(destDir, name);
                    var output = fs.createWriteStream(zipPath);
                    output.on('close', function () {
                        resolvePromise(zipPath);
                    });
                    archive.on('error', function (error) { return rejectPromise(error); });
                    archive.pipe(output);
                    archive.glob('**/*', { cwd: sourceDir });
                    archive.finalize();
                })];
        });
    }); };
});
