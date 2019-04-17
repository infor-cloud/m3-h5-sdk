import * as fs from 'fs-extra';
import * as path from 'path';
import * as c from './common';

c.title('Publish M3 Odin');

const compilerPath = resolveCompilerPath();
const ngcCompilerPath = resolveNgcCompilerPath();
const distPath = resolveDistPath();

// You will need to login before running this, eg npm login
// Test with npm whoami

publishCore();
publishAngular();
publishCli();

function resolveDistPath(): string {
   const directory = path.join(__dirname, '../../dist');
   c.createDirectory(directory);
   return directory;
}

function resolveCompilerPath(): string {
   return path.join(__dirname, '../node_modules/typescript/bin/tsc');
}

function resolveNgcCompilerPath(): string {
   return path.join(__dirname, '../../m3-odin/node_modules/.bin/ngc');
}

function publishNpm(directory: string): void {
   const operation = c.begin('Publish NPM');
   console.log('Publish directory: ' + directory);
   console.log('Output directory: ' + distPath);

   var currentDirectory = process.cwd();
   process.chdir(distPath);

   c.execSync('npm publish ' + directory);

   if (directory !== currentDirectory) {
      process.chdir(currentDirectory);
   }

   c.end(operation);
}

function publishCore(): void {
   const operation = c.begin('Publish M3 Odin Core');

   const directory = path.join(__dirname, '../../m3-odin/src/core');
   c.runClean(directory);
   c.buildTypeScript(directory, compilerPath);

   publishNpm(directory);

   c.end(operation);
}

function publishAngular(): void {
   const operation = c.begin('Publish M3 Odin Angular');

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

   publishNpm(directory);

   c.end(operation);
}

function publishCli(): void {
   const operation = c.begin('Publish M3 Odin CLI');

   const directory = path.join(__dirname, '../');
   c.runClean(directory);
   c.buildTypeScript(directory, compilerPath);

   publishNpm(directory);

   c.end(operation);
}