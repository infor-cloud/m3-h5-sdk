import * as fs from 'fs-extra';
import * as path from 'path';
import * as c from './common';

c.title('Pack M3 Odin');

const compilerPath = resolveTypeScriptCompilerPath();
const ngcCompilerPath = resolveNgcCompilerPath();
const distPath = resolveDistPath();

packCore();
packAngular();
packAngularBuilder();
packCli();

function resolveDistPath(): string {
   const directory = path.join(__dirname, '../../dist');
   c.createDirectory(directory);
   return directory;
}

function resolveTypeScriptCompilerPath(): string {
   return path.join(__dirname, '../node_modules/typescript/bin/tsc');
}

function resolveNgcCompilerPath(): string {
   return path.join(__dirname, '../../m3-odin/node_modules/.bin/ngc');
}

function packNpm(directory: string): void {
   const operation = c.begin('Pack NPM');
   console.log('Pack directory: ' + directory);
   console.log('Output directory: ' + distPath);

   var currentDirectory = process.cwd();
   process.chdir(distPath);

   c.execSync('npm pack ' + directory);

   if (directory !== currentDirectory) {
      process.chdir(currentDirectory);
   }

   c.end(operation);
}


function packCore(): void {
   const operation = c.begin('Pack M3 Odin Core');

   c.npmRun('build:lib-core', c.projectDirectory());
   const directory = c.projectDirectory('projects/infor-up/m3-odin');
   packNpm(directory);

   c.end(operation);
}

function packAngular(): void {
   const operation = c.begin('Pack M3 Odin Angular');
   c.npmRun('build:lib-angular', c.projectDirectory());
   const projectDistDirectory = c.projectDirectory('dist/infor-up/m3-odin-angular');
   packNpm(projectDistDirectory);

   c.end(operation);
}

function packAngularBuilder(): void {
   const operation = c.begin('Pack M3 Odin Angular Builder');
   c.npmRun('build:lib-angular-builder', c.projectDirectory());
   const projectDistDirectory = c.projectDirectory('dist/infor-up/m3-odin-angular-builder');
   packNpm(projectDistDirectory);

   c.end(operation);
}

function packCli(): void {
   const operation = c.begin('Pack M3 Odin CLI');

   const directory = path.join(__dirname, '../');
   c.buildTypeScript(directory, compilerPath);

   packNpm(directory);

   c.end(operation);
}