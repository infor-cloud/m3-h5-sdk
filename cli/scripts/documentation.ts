import * as path from 'path';
import * as c from './common';

const name = 'M3 Odin';
const moduleFormat = 'commonjs';
const mode = 'file'; // modules | file
const includes = [
   'core',
   'angular'
];

c.title('Generate M3 Odin API documentation');
generate();

function resolveVersion(): string {
   const file = path.join(__dirname, '../../m3-odin/package.json');
   return c.getPackageVersion(file);
}

function generate(): void {
   const operation = c.begin('Generating');

   const sourceDirectory = path.join(__dirname, '../../m3-odin/src');
   const targetDirectory = path.join(__dirname, '../../m3-odin/docs');
   const version = resolveVersion();

   console.log('Version: ' + version);
   console.log('Source directory: ' + sourceDirectory);
   console.log('Target directory: ' + sourceDirectory);

   clearDirectory(targetDirectory);

   process.chdir(sourceDirectory);

   const sourceFiles = includes.join(' ');
   const fullName = name + ' - ' + version;
   let command = `typedoc --name "${fullName}" --readme none --mode ${mode} --module ${moduleFormat} --excludeExternals --externalPattern "*@angular*|*rxjs*" --excludeNotExported --excludePrivate --ignoreCompilerErrors --out "${targetDirectory}" ${sourceFiles}`;
   c.execSync(command);

   c.end(operation);
}

function clearDirectory(directory: string): void {
   const operation = c.begin('Clear directory');
   console.log('Directory name: ' + directory);
   c.removeDirectory(directory);
   c.createDirectory(directory);
   c.end(operation);
}
