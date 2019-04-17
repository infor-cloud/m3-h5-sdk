import * as fs from 'fs-extra';
import * as path from 'path';
import * as c from './common';

c.title('Pack M3 Odin');

const compilerPath = resolveTypeScriptCompilerPath();
const ngcCompilerPath = resolveNgcCompilerPath();
const distPath = resolveDistPath();

packCore();
packAngular();
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

   const directory = path.join(__dirname, '../../m3-odin/src/core');
   c.runClean(directory);
   c.buildTypeScript(directory, compilerPath);

   packNpm(directory);

   c.end(operation);
}

function packAngular(): void {
   const operation = c.begin('Pack M3 Odin Angular');

   const directory = path.join(__dirname, '../../m3-odin/src/angular');
   c.runClean(directory);
   c.buildNgc(directory, ngcCompilerPath);

   // Move files in dist directory from /dist/src/angular to /dist and remove src directory
   const ngcOutputDirectory = path.join(directory, 'dist/src/angular');
   const distDirectory = path.join(directory, 'dist');
   const files = fs.readdirSync(ngcOutputDirectory);
   c.copyFiles(ngcOutputDirectory, distDirectory, files);
   for (const file of files) {
      fs.removeSync(path.join(ngcOutputDirectory, file));
   }

   packNpm(directory);

   c.end(operation);
}

function packCli(): void {
   const operation = c.begin('Pack M3 Odin CLI');

   const directory = path.join(__dirname, '../');
   c.buildTypeScript(directory, compilerPath);

   packNpm(directory);

   c.end(operation);
}