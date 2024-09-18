import fs from 'fs-extra';
import path from 'path';
import { begin, end, execSync, relativePath, replaceAll, title } from './common.js';

title('Update M3 Odin versions');

const directories = [
   'm3-odin/projects/infor-up/m3-odin',
   'm3-odin/projects/infor-up/m3-odin-angular',
   'm3-odin',
   'cli'
];

const files = [
   'm3-odin/package-lock.json',
   'm3-odin/projects/infor-up/m3-odin-angular/package.json',
   'cli/boilerplate/basic/package.json',
   'cli/boilerplate/angular/package.json',
   'cli/boilerplate/angular-soho/package.json',
];


updateVersions();

function updateVersions(): void {
   const version = getVersion();
   if (!version) {
      const message = 'Version parameter missing';
      console.log(message);
      throw new Error(message);
   }

   const currentDirectory = process.cwd();
   const baseDirectory = relativePath('../../');

   let directory;

   for (let directory of directories) {
      directory = path.join(baseDirectory, directory);
      updateVersionWithNpm(directory, version);
   }

   const keyNames = ['@infor-up/m3-odin', '@infor-up/m3-odin-angular', '@infor-up/m3-odin-cli'];
   for (const file of files) {
      const filename = path.join(baseDirectory, file);
      updateVersionInFile(filename, version, keyNames);
   }

   process.chdir(currentDirectory);
}

function updateVersionInFile(filename: string, version: string, names: string[]): void {
   const operation = begin('Update versions in file');
   console.log('Filename: ' + filename);

   let content = fs.readFileSync(filename, 'utf8');
   const json = JSON.parse(content);
   const existingVersion = findExistingVersion(json, names);

   if (existingVersion) {
      console.log('Found existing version: ' + existingVersion);
      console.log('Replacing with version: ' + version);

      for (const name of names) {
         const search = `"${name}": "${existingVersion}"`;
         const replace = `"${name}": "${version}"`;
         content = replaceAll(content, search, replace);
      }

      fs.writeFileSync(filename, content, 'utf8');
   } else {
      console.error('No existing version found');
   }

   end(operation);
}

function findExistingVersion(json: any, names: string[]): string | null {
   if (typeof json !== 'object') {
      return null;
   }

   const keys = Object.keys(json);
   for (const key of keys) {
      let value = json[key];
      if (value && typeof value === 'string') {
         for (const name of names) {
            if (key === name) {
               return value;
            }
         }
      }
      value = findExistingVersion(value, names);
      if (value) {
         return value;
      }
   }
   return null;
}

function updateVersionWithNpm(directory: string, version: string): void {
   const operation = begin('Update npm version');
   console.log('Directory: ' + directory);
   console.log('Version: ' + version);

   process.chdir(directory);
   execSync('npm version ' + version + ' --allow-same-version');

   end(operation);
}

function getVersion(): string | null {
   const argv = process.argv;
   if (argv.length >= 3) {
      return argv[2];
   }
   return null;
}
