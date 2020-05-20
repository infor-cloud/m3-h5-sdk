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
        define(["require", "exports", "fs-extra", "path", "./common"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fs = require("fs-extra");
    var path = require("path");
    var c = require("./common");
    c.title('Pack M3 Odin Samples');
    var versionNumber = require('../package.json').version;
    var proxyUrl = 'https://m3.server:25000';
    var distPath = ensureDirectory('../../dist');
    var tempPath = ensureEmptyDirectory('../../dist/temp');
    var boilerplatePath = path.join('../../m3-odin/boilerplate');
    var sampleSourcePath = path.join('../../m3-odin/src');
    var sampleAppsPath = path.join('../../m3-odin/src/app');
    packSamples();
    function deleteTempDirectory() {
        var operation = c.begin('Delete temp directory');
        try {
            console.log('Removing directory: ' + tempPath);
            fs.removeSync(tempPath);
        }
        catch (error) {
            console.log("Caught error", error);
        }
        c.end(operation);
    }
    function ensureEmptyDirectory(relativePath) {
        var directory = path.join(__dirname, relativePath);
        c.removeDirectory(directory);
        c.createDirectory(directory);
        return directory;
    }
    function ensureDirectory(relativePath) {
        var directory = path.join(__dirname, relativePath);
        c.createDirectory(directory);
        return directory;
    }
    function packSamples() {
        return __awaiter(this, void 0, void 0, function () {
            var currentDirectory, sohoSampleSourceName, sohoSampleName, materialSampleSourceName, materialSampleName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentDirectory = process.cwd();
                        sohoSampleSourceName = 'soho-app';
                        sohoSampleName = 'infor-m3-odin-sample-soho';
                        return [4 /*yield*/, packSampleApp(sohoSampleSourceName, sohoSampleName, true)];
                    case 1:
                        _a.sent();
                        materialSampleSourceName = 'material-app';
                        materialSampleName = 'infor-m3-odin-sample-material';
                        return [4 /*yield*/, packSampleApp(materialSampleSourceName, materialSampleName)];
                    case 2:
                        _a.sent();
                        process.chdir(currentDirectory);
                        deleteTempDirectory();
                        return [2 /*return*/];
                }
            });
        });
    }
    function packSampleApp(sampleSourceName, sampleName, isSoho) {
        return __awaiter(this, void 0, void 0, function () {
            var operation, sampleTargetPath, sourceTargetPath, appTargetPath, typingsFilename, typingsPath, commonName, commonAppSourcePath, commonAppTargetPath, sohoAppPath, tempAppPath, packageJsonPath, angularJsonPath, zipFilename;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        operation = c.begin('Packing Angular ' + (isSoho ? 'Soho' : 'Material') + ' sample');
                        sampleTargetPath = path.join(tempPath, sampleName);
                        sourceTargetPath = path.join(sampleTargetPath, 'src');
                        appTargetPath = path.join(sampleTargetPath, 'src/app');
                        createProject(sampleName, isSoho);
                        c.deleteFiles(appTargetPath, fs.readdirSync(appTargetPath));
                        typingsFilename = 'typings.d.ts';
                        typingsPath = path.join(sampleSourcePath, typingsFilename);
                        console.log('Copying file: ' + typingsPath);
                        fs.copyFileSync(typingsPath, path.join(sourceTargetPath, typingsFilename));
                        commonName = 'common';
                        commonAppSourcePath = path.join(sampleAppsPath, commonName);
                        commonAppTargetPath = path.join(appTargetPath, commonName);
                        console.log('Copying directory: ' + commonAppSourcePath + ' to ' + commonAppTargetPath);
                        fs.copySync(commonAppSourcePath, commonAppTargetPath);
                        sohoAppPath = path.join(sampleAppsPath, sampleSourceName);
                        fs.copySync(sohoAppPath, path.join(appTargetPath, sampleSourceName));
                        tempAppPath = path.join(tempPath, sampleName);
                        copyBoilperplateFiles(sampleSourceName, path.join(boilerplatePath, sampleName), tempAppPath);
                        console.log('Updating version number');
                        packageJsonPath = path.join(sampleTargetPath, 'package.json');
                        c.updatePackageVersion(packageJsonPath, versionNumber);
                        angularJsonPath = path.join(sampleTargetPath, 'angular.json');
                        addHighlightToPackageJson(packageJsonPath);
                        addHighlightToAngularJson(angularJsonPath, sampleName);
                        zipFilename = sampleName + '-' + versionNumber + '.zip';
                        console.log('Creating zip file: ' + zipFilename + ' from directory ' + tempAppPath);
                        return [4 /*yield*/, c.zip(tempAppPath, distPath, zipFilename).then()];
                    case 1:
                        _a.sent();
                        c.end(operation);
                        return [2 /*return*/];
                }
            });
        });
    }
    function addHighlightToAngularJson(filePath, sampleName) {
        console.log('Modifying angular.json for highlightjs');
        var text = fs.readFileSync(filePath, 'utf8');
        var json = JSON.parse(text);
        var options = json['projects'][sampleName]['architect']['build']['options'];
        options['assets'].push({
            'glob': '**/*.+(component|service).+(ts|html|css)',
            'input': 'src/app',
            'output': '/assets/source'
        });
        options['styles'].push('node_modules/highlight.js/styles/googlecode.css');
        fs.writeFileSync(filePath, JSON.stringify(json, null, 3), 'utf8');
    }
    function addHighlightToPackageJson(filePath) {
        console.log('Modifying package.json for highlightjs');
        var text = fs.readFileSync(filePath, 'utf-8');
        var json = JSON.parse(text);
        json['dependencies']['highlight.js'] = '^9.14.2';
        fs.writeFileSync(filePath, JSON.stringify(json, null, 3), 'utf8');
    }
    function createProject(name, isSoho) {
        var operation = c.begin('Creating project with M3 Odin CLI');
        var command = 'odin new --skip-git --angular ' + (isSoho ? '--soho' : '--material') + ' --proxy ' + proxyUrl + ' ' + name;
        console.log('Project name: ' + name);
        console.log('Temp directory: ' + tempPath);
        console.log('CLI command: ' + command);
        process.chdir(tempPath);
        c.execSync(command);
        c.end(operation);
    }
    function copyBoilperplateFiles(sampleSourceName, sourcePath, targetPath) {
        var operation = c.begin('Copying boilerplate files');
        var srcTargetPath = path.join(targetPath, 'src');
        var indexName = 'index.html';
        var htmlPath = path.join(sourcePath, indexName);
        console.log('Copying file: ' + htmlPath);
        fs.copyFileSync(htmlPath, path.join(srcTargetPath, indexName));
        var appSourcePath = path.join(sourcePath, 'app');
        var appTargetPath = path.join(srcTargetPath, 'app');
        console.log('Copying directory: ' + appSourcePath + ' to ' + appTargetPath);
        fs.copySync(appSourcePath, appTargetPath);
        var sampleAppSourcePath = path.join(appSourcePath, sampleSourceName);
        var sampleAppTargetPath = path.join(appTargetPath, sampleSourceName);
        console.log('Copying directory: ' + sampleAppSourcePath + ' to ' + sampleAppTargetPath);
        fs.copySync(sampleAppSourcePath, sampleAppTargetPath);
        c.end(operation);
    }
});
