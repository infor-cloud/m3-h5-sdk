import fs from 'fs-extra';
import path from 'path';
import { begin, createDirectory, deleteFiles, end, execSync, relativePath, removeDirectory, title, updatePackageVersion, zip } from './common.js';
title('Pack M3 Odin Samples');
const versionNumber = fs.readJSONSync(relativePath("../package.json")).version;
const proxyUrl = 'https://m3.server:25000';
const distPath = ensureDirectory('../../dist');
const tempPath = ensureEmptyDirectory('../../dist/temp');
const boilerplatePath = path.join('../../m3-odin/boilerplate');
const sampleSourcePath = path.join('../../m3-odin/src');
const sampleAppsPath = path.join('../../m3-odin/src/app');
packSamples();
function deleteTempDirectory() {
    const operation = begin('Delete temp directory');
    try {
        console.log('Removing directory: ' + tempPath);
        fs.removeSync(tempPath);
    }
    catch (error) {
        console.log("Caught error", error);
    }
    end(operation);
}
function ensureEmptyDirectory(directoryPath) {
    const directory = relativePath(directoryPath);
    removeDirectory(directory);
    createDirectory(directory);
    return directory;
}
function ensureDirectory(directoryPath) {
    const directory = relativePath(directoryPath);
    createDirectory(directory);
    return directory;
}
async function packSamples() {
    const currentDirectory = process.cwd();
    const sohoSampleSourceName = 'soho-app';
    const sohoSampleName = 'infor-m3-odin-sample-soho';
    await packSampleApp(sohoSampleSourceName, sohoSampleName, true);
    const materialSampleSourceName = 'material-app';
    const materialSampleName = 'infor-m3-odin-sample-material';
    await packSampleApp(materialSampleSourceName, materialSampleName);
    process.chdir(currentDirectory);
    deleteTempDirectory();
}
async function packSampleApp(sampleSourceName, sampleName, isSoho) {
    const operation = begin('Packing Angular ' + (isSoho ? 'Soho' : 'Material') + ' sample');
    const sampleTargetPath = path.join(tempPath, sampleName);
    const sourceTargetPath = path.join(sampleTargetPath, 'src');
    const appTargetPath = path.join(sampleTargetPath, 'src/app');
    createProject(sampleName, isSoho);
    deleteFiles(appTargetPath, fs.readdirSync(appTargetPath));
    const typingsFilename = 'typings.d.ts';
    const typingsPath = path.join(sampleSourcePath, typingsFilename);
    console.log('Copying file: ' + typingsPath);
    fs.copyFileSync(typingsPath, path.join(sourceTargetPath, typingsFilename));
    const commonName = 'common';
    const commonAppSourcePath = path.join(sampleAppsPath, commonName);
    const commonAppTargetPath = path.join(appTargetPath, commonName);
    console.log('Copying directory: ' + commonAppSourcePath + ' to ' + commonAppTargetPath);
    fs.copySync(commonAppSourcePath, commonAppTargetPath);
    const sohoAppPath = path.join(sampleAppsPath, sampleSourceName);
    fs.copySync(sohoAppPath, path.join(appTargetPath, sampleSourceName));
    const tempAppPath = path.join(tempPath, sampleName);
    copyBoilperplateFiles(sampleSourceName, path.join(boilerplatePath, sampleName), tempAppPath);
    console.log('Updating version number');
    const packageJsonPath = path.join(sampleTargetPath, 'package.json');
    updatePackageVersion(packageJsonPath, versionNumber);
    const angularJsonPath = path.join(sampleTargetPath, 'angular.json');
    addHighlightToPackageJson(packageJsonPath);
    addHighlightToAngularJson(angularJsonPath, sampleName);
    const zipFilename = sampleName + '-' + versionNumber + '.zip';
    console.log('Creating zip file: ' + zipFilename + ' from directory ' + tempAppPath);
    await zip(tempAppPath, distPath, zipFilename).then();
    end(operation);
}
function addHighlightToAngularJson(filePath, sampleName) {
    console.log('Modifying angular.json for highlightjs');
    const text = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(text);
    const options = json['projects'][sampleName]['architect']['build']['options'];
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
    const text = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(text);
    json['dependencies']['highlight.js'] = '^10.5.0';
    fs.writeFileSync(filePath, JSON.stringify(json, null, 3), 'utf8');
}
function createProject(name, isSoho) {
    const operation = begin('Creating project with M3 Odin CLI');
    const odinCliScript = relativePath("../dist/cli.js");
    const command = `node ${odinCliScript} new --skip-git --angular ${isSoho ? '--soho' : '--material'} --proxy ${proxyUrl} ${name}`;
    // const command = 'odin new --skip-git --angular ' + (isSoho ? '--soho' : '--material') + ' --proxy ' + proxyUrl + ' ' + name;
    console.log('Project name: ' + name);
    console.log('Temp directory: ' + tempPath);
    console.log('CLI command: ' + command);
    process.chdir(tempPath);
    execSync(command);
    end(operation);
}
function copyBoilperplateFiles(sampleSourceName, sourcePath, targetPath) {
    const operation = begin('Copying boilerplate files');
    const srcTargetPath = path.join(targetPath, 'src');
    const indexName = 'index.html';
    const htmlPath = path.join(sourcePath, indexName);
    console.log('Copying file: ' + htmlPath);
    fs.copyFileSync(htmlPath, path.join(srcTargetPath, indexName));
    const mainPath = path.join(sourcePath, 'main.ts');
    console.log('Copying file: ' + mainPath);
    fs.copyFileSync(mainPath, path.join(srcTargetPath, 'main.ts'));
    const appSourcePath = path.join(sourcePath, 'app');
    const appTargetPath = path.join(srcTargetPath, 'app');
    console.log('Copying directory: ' + appSourcePath + ' to ' + appTargetPath);
    fs.copySync(appSourcePath, appTargetPath);
    const sampleAppSourcePath = path.join(appSourcePath, sampleSourceName);
    const sampleAppTargetPath = path.join(appTargetPath, sampleSourceName);
    console.log('Copying directory: ' + sampleAppSourcePath + ' to ' + sampleAppTargetPath);
    fs.copySync(sampleAppSourcePath, sampleAppTargetPath);
    end(operation);
}
