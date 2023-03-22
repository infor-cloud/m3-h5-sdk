import { begin, buildTypeScript, createDirectory, end, execSync, npmRun, projectDirectory, relativePath, title } from './common.js';
title('Pack M3 Odin');
const compilerPath = resolveTypeScriptCompilerPath();
const ngcCompilerPath = resolveNgcCompilerPath();
const distPath = resolveDistPath();
packCore();
packAngular();
packCli();
function resolveDistPath() {
    const directory = relativePath('../../dist');
    createDirectory(directory);
    return directory;
}
function resolveTypeScriptCompilerPath() {
    return relativePath('../node_modules/typescript/bin/tsc');
}
function resolveNgcCompilerPath() {
    return relativePath('../../m3-odin/node_modules/.bin/ngc');
}
function packNpm(directory) {
    const operation = begin('Pack NPM');
    console.log('Pack directory: ' + directory);
    console.log('Output directory: ' + distPath);
    var currentDirectory = process.cwd();
    process.chdir(distPath);
    execSync('npm pack ' + directory);
    if (directory !== currentDirectory) {
        process.chdir(currentDirectory);
    }
    end(operation);
}
function packCore() {
    const operation = begin('Pack M3 Odin Core');
    npmRun('build:lib-core', projectDirectory());
    const directory = projectDirectory('dist/infor-up/m3-odin');
    packNpm(directory);
    end(operation);
}
function packAngular() {
    const operation = begin('Pack M3 Odin Angular');
    npmRun('build:lib-angular', projectDirectory());
    const projectDistDirectory = projectDirectory('dist/infor-up/m3-odin-angular');
    packNpm(projectDistDirectory);
    end(operation);
}
function packCli() {
    const operation = begin('Pack M3 Odin CLI');
    const directory = relativePath('../');
    buildTypeScript(directory, compilerPath);
    packNpm(directory);
    end(operation);
}
