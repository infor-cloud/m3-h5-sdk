import fs from 'fs-extra';
import path from 'path';
import { begin, buildTypeScript, createDirectory, end, execSync, npmRun, projectDirectory, relativePath, runClean, title } from './common.js';
title('Publish M3 Odin');
const compilerPath = resolveCompilerPath();
const ngcCompilerPath = resolveNgcCompilerPath();
const distPath = resolveDistPath();
// You will need to login before running this, eg npm login
// Test with npm whoami
publishCore();
publishAngular();
publishCli();
function resolveDistPath() {
    const directory = relativePath('../../dist');
    createDirectory(directory);
    return directory;
}
function resolveCompilerPath() {
    return relativePath('../node_modules/typescript/bin/tsc');
}
function resolveNgcCompilerPath() {
    return relativePath('../../m3-odin/node_modules/.bin/ngc');
}
function publishNpm(directory) {
    const operation = begin('Publish NPM');
    console.log('Publish directory: ' + directory);
    console.log('Output directory: ' + distPath);
    const currentDirectory = process.cwd();
    process.chdir(distPath);
    const version = fs.readJsonSync(path.join(directory, 'package.json')).version;
    const tag = version.includes('-next') ? ' --tag next' : '';
    execSync('npm publish ' + directory + ' --access public' + tag);
    if (directory !== currentDirectory) {
        process.chdir(currentDirectory);
    }
    end(operation);
}
function publishCore() {
    const operation = begin('Publish M3 Odin Core');
    npmRun('build:lib-core', projectDirectory());
    const directory = projectDirectory('projects/infor-up/m3-odin');
    publishNpm(directory);
    end(operation);
}
function publishAngular() {
    const operation = begin('Publish M3 Odin Angular');
    npmRun('build:lib-angular', projectDirectory());
    const projectDistDirectory = projectDirectory('dist/infor-up/m3-odin-angular');
    publishNpm(projectDistDirectory);
    end(operation);
}
function publishCli() {
    const operation = begin('Publish M3 Odin CLI');
    const directory = relativePath('../');
    runClean(directory);
    buildTypeScript(directory, compilerPath);
    publishNpm(directory);
    end(operation);
}
