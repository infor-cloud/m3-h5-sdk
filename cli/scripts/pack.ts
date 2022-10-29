import { begin, buildTypeScript, createDirectory, end, execSync, npmRun, projectDirectory, relativePath, title } from './common.js';

title('Pack M3 Odin');

const compilerPath = resolveTypeScriptCompilerPath();
const ngcCompilerPath = resolveNgcCompilerPath();
const distPath = resolveDistPath();

packCore();
packAngular();
packAngularBuilder();
packCli();

function resolveDistPath(): string {
   const directory = relativePath('../../dist');
   createDirectory(directory);
   return directory;
}

function resolveTypeScriptCompilerPath(): string {
   return relativePath('../node_modules/typescript/bin/tsc');
}

function resolveNgcCompilerPath(): string {
   return relativePath('../../m3-odin/node_modules/.bin/ngc');
}

function packNpm(directory: string): void {
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


function packCore(): void {
   const operation = begin('Pack M3 Odin Core');

   npmRun('build:lib-core', projectDirectory());
   const directory = projectDirectory('projects/infor-up/m3-odin');
   packNpm(directory);

   end(operation);
}

function packAngular(): void {
   const operation = begin('Pack M3 Odin Angular');
   npmRun('build:lib-angular', projectDirectory());
   const projectDistDirectory = projectDirectory('dist/infor-up/m3-odin-angular');
   packNpm(projectDistDirectory);

   end(operation);
}

function packAngularBuilder(): void {
   const operation = begin('Pack M3 Odin Angular Builder');
   npmRun('build:lib-angular-builder', projectDirectory());
   const projectDistDirectory = projectDirectory('dist/infor-up/m3-odin-angular-builder');
   packNpm(projectDistDirectory);

   end(operation);
}

function packCli(): void {
   const operation = begin('Pack M3 Odin CLI');

   const directory = relativePath('../');
   buildTypeScript(directory, compilerPath);

   packNpm(directory);

   end(operation);
}
