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

   const currentDirectory = process.cwd();
   process.chdir(distPath);

   const version: string = fs.readJsonSync(path.join(directory, 'package.json')).version;
   const tag = version.includes('-next') ? ' --tag next' : '';

   c.execSync('npm publish ' + directory + ' --access public' + tag);

   if (directory !== currentDirectory) {
      process.chdir(currentDirectory);
   }

   c.end(operation);
}

function publishCore(): void {
   const operation = c.begin('Publish M3 Odin Core');

   c.npmRun('build:lib-core', c.projectDirectory());
   const directory = c.projectDirectory('projects/infor-up/m3-odin');
   publishNpm(directory);

   c.end(operation);
}

function publishAngular(): void {
   const operation = c.begin('Publish M3 Odin Angular');

   c.npmRun('build:lib-angular', c.projectDirectory());
   const projectDistDirectory = c.projectDirectory('dist/infor-up/m3-odin-angular');
   publishNpm(projectDistDirectory);

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
