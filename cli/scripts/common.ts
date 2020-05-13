import * as archiver from 'archiver';
import * as p from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface IOperation {
   name: string;
   start: number;
}

export const projectDirectory = (relativePath?: string): string => {
   const projectRoot = path.join(__dirname, '../../m3-odin');
   if (relativePath) {
      return path.join(projectRoot, relativePath);
   } else {
      return projectRoot;
   }
};

export const title = (title: string): void => {
   console.log('');
   console.log(title);
   var separator = repeat('=', title.length);
   console.log(separator);
}

export const repeat = (text: string, length: number): string => {
   return new Array(length + 1).join(text);
}

export const round = (value: number, precision: number): number => {
   var multiplier = Math.pow(10, precision || 0);
   return Math.round(value * multiplier) / multiplier;
}

export const begin = (operationName: string): IOperation => {
   console.log('Begin: ' + operationName + '...');
   return {
      name: operationName,
      start: new Date().getTime()
   };
}

export const end = (operation: IOperation): void => {
   var duration = new Date().getTime() - operation.start;
   var durationText;
   if (duration < 1000) {
      durationText = '(' + duration + ' milliseconds)';
   } else {
      durationText = '(' + round(duration / 1000, 1) + ' seconds)';
   }
   console.log('End: ' + operation.name + ' ' + durationText + '\n');
}

export const setWorkingDirectory = (relativePath: string): void => {
   process.chdir(path.join(__dirname, relativePath));
   console.log('Working directory: ' + process.cwd());
}

export const execNodeSync = (command: string): void => {
   var nodeExecutable = process.env.VIRTUAL_NODE || 'node';
   command = nodeExecutable + ' ' + command;
   console.log(command);
   execSync(command);
}

export const execSync = (command: string): void => {
   p.execSync(command, { stdio: 'inherit' });
}

export const createDirectory = (dir: string): void => {
   if (!fs.existsSync(dir)) {
      fs.ensureDirSync(dir);
   }
}

export const removeDirectory = (dir: string): void => {
   if (fs.existsSync(dir)) {
      fs.removeSync(dir);
   }
}

export const isDirectory = (dir: string): boolean => {
   const stats = fs.statSync(dir);
   return stats.isDirectory();
}

export const copyFiles = (sourcePath: string, targetPath: string, files: string[]): void => {
   createDirectory(targetPath);
   for (let file of files) {
      copyFile(sourcePath, targetPath, file);
   }
}

export const copyFile = (sourcePath: string, targetPath: string, filename: string): void => {
   var source = path.join(sourcePath, filename);
   var target = path.join(targetPath, filename);
   fs.copyFileSync(source, target);
}

export const deleteFiles = (directory: string, files: string[]): void => {
   for (let file of files) {
      var filePath = path.join(directory, file);
      fs.removeSync(filePath);
   }
}

export const replaceInFile = (file: string, searchValue: string, replaceValue: string): void => {
   var text = fs.readFileSync(file, 'utf8');
   text = text.replace(searchValue, replaceValue);
   fs.writeFileSync(file, text, 'utf8');
}

/**
 * Gets the version number from a package.json file.
 * 
 * @param file the absolute file path to the package.json file
 */
export const getPackageVersion = (file: string): string => {
   const text = fs.readFileSync(file, 'utf8');
   const json = JSON.parse(text);
   return json['version'];
}

export const updatePackageVersion = (file: string, version: string): void => {
   const text = fs.readFileSync(file, 'utf8');
   const json = JSON.parse(text);
   json['version'] = version;
   fs.writeFileSync(file, JSON.stringify(json, null, 3), 'utf8');
}

export const getFileExtension = (filename: string): string => {
   return filename.substring(filename.lastIndexOf('.') + 1, filename.length) || filename;
}

export const isJavaScript = (filename: string): boolean => {
   return 'js' === getFileExtension(filename);
}

export const resolveRelativeDirectoryLocation = (basePath: string, testPath: string): string | null => {
   // Check current directory
   let directory = path.join(basePath, testPath);
   if (fs.existsSync(directory)) {
      return './';
   }

   // Check parent directories   
   let relativeDirectory = '';
   while (true) {
      relativeDirectory += '../';
      const relativeBaseDirectory = path.join(basePath, relativeDirectory);
      if (!path.basename(relativeBaseDirectory) || !fs.existsSync(relativeBaseDirectory)) {
         break;
      }

      directory = path.join(relativeBaseDirectory, testPath);
      if (fs.existsSync(directory)) {
         return relativeDirectory;
      }
   }
   return null;
}

export const npmRun = (script: string, directory?: string): void => {
   const currentDirectory = process.cwd();
   if (directory) {
      process.chdir(directory);
   }
   execSync(`npm run ${script}`);
   process.chdir(currentDirectory);
};

export const runClean = (directory: string): void => {
   npmRun('clean', directory);
}

export const buildTypeScript = (directory: string, compilerPath: string = ''): void => {
   var operation = begin('Build TypeScript');

   if (!compilerPath) {
      const nodeModulesPath = resolveRelativeDirectoryLocation(directory, 'node_modules');
      if (!nodeModulesPath) {
         const message = 'Failed to find node_modules directory relative to ' + directory;
         console.log(message);
         throw new Error(message);
      }
      console.log('Path to node_modules: ' + nodeModulesPath);
      compilerPath = path.join(nodeModulesPath, 'typescript/bin/tsc')
   }

   console.log('Working directory: ' + directory);
   console.log('TypeScript compiler: ' + compilerPath);

   var currentDirectory = process.cwd();
   process.chdir(directory);

   execNodeSync(compilerPath);

   if (directory !== currentDirectory) {
      process.chdir(currentDirectory);
   }

   end(operation);
}

export const buildNgc = (directory: string, compilerPath: string): void => {
   var operation = begin('Build NGC');

   console.log('Working directory: ' + directory);
   console.log('NGC compiler: ' + compilerPath);

   var currentDirectory = process.cwd();
   process.chdir(directory);

   execSync(compilerPath + ' -p tsconfig.json');

   if (directory !== currentDirectory) {
      process.chdir(currentDirectory);
   }

   end(operation);
}

export const replaceAll = (str: string, find: string, replace: string): string => {
   return str.replace(new RegExp(find, 'g'), replace);
}

export const getTimestamp = (): string => {
   var tzoffset = (new Date()).getTimezoneOffset() * 60000;
   var date = (new Date(Date.now() - tzoffset)).toISOString();
   date = replaceAll(date, '-', '');
   date = replaceAll(date, ':', '');
   date = date.replace('T', '-');
   return date.slice(0, 15);
}

export const endsWith = (value: string, suffix: string): boolean => {
   if (!value) {
      return false;
   }
   return value.indexOf(suffix, value.length - suffix.length) !== -1;
}

export const zip = async (sourceDir: string, destDir: string, name: string) => {
   return new Promise<string>((resolvePromise, rejectPromise) => {
      const archive = archiver('zip');
      fs.ensureDirSync(destDir);
      const zipPath = path.join(destDir, name);
      const output = fs.createWriteStream(zipPath);

      output.on('close', () => {
         resolvePromise(zipPath);
      });

      archive.on('error', error => rejectPromise(error));

      archive.pipe(output);
      archive.glob('**/*', { cwd: sourceDir });
      archive.finalize();
   });
};

