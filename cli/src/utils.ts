import * as archiver from 'archiver';
import { spawn } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Configuration } from 'webpack-dev-server';

type ISupportedAngularCommand = 'new' | 'serve' | 'build';

export interface IOdinConfiguration extends Configuration {
   projectName?: string;
}

export const removeSurroundingSlash = (text: string): string => {
   return text.replace(/^\//, '').replace(/\/$/, '');
};

export const isValidProxyUrl = (url: string) => url.match(/^https?:\/\/[^:\/]+(:\d+)?(\/.*)?$/) !== null;

export const executeAngularCli = async (command: ISupportedAngularCommand, ...options: string[]) => {
   await new Promise((resolveFun, rejectFun) => {
      const ngCliScript = path.resolve(__dirname, '../node_modules/@angular/cli/bin/ng');
      const cliProcess = spawn('node', [ngCliScript, command, ...options]);
      cliProcess.stdout.pipe(process.stdout);
      cliProcess.stderr.pipe(process.stderr);
      cliProcess.on('close', code => {
         if (code === 0) {
            resolveFun();
         } else {
            rejectFun(`Angular CLI exited with error code ${code}`);
         }
      });
      cliProcess.on('error', e => rejectFun(e));
   });
};

export const isAngularProject = (absolutePath?: string): boolean => {
   absolutePath = absolutePath || process.cwd();
   const parentPath = path.join(absolutePath, '../');
   if (fs.existsSync(path.join(absolutePath, 'angular.json'))) {
      return true;
   } else if (parentPath === absolutePath) {
      return false;
   } else {
      return isAngularProject(parentPath);
   }
};

/**
* Find, read and parse the Odin configuration file.
* It should look for the file in the current working directory.
*/
export const writeConfig = (config: IOdinConfiguration, cwd?: string) => {
   const projectRoot = cwd || process.cwd();
   const configPath = path.resolve(projectRoot, 'odin.json');
   return fs.writeJsonSync(configPath, config, { spaces: 3 });
};

/**
* Find, read and parse the Odin configuration file.
* It should look for the file in the current working directory.
*/
export const readConfig = (cwd?: string): IOdinConfiguration => {
   const projectRoot = cwd || process.cwd();
   const configPath = path.resolve(projectRoot, 'odin.json');
   return fs.readJsonSync(configPath);
};

/**
* Find, read and parse the Odin configuration file.
* It should look for the file in the current working directory.
*/
export const readPackageJson = (cwd?: string): object => {
   const projectRoot = cwd || process.cwd();
   const packagePath = path.resolve(projectRoot, 'package.json');
   return fs.readJsonSync(packagePath);
};

/**
 * Creates a zip containing everything in sourceDir
 *
 * @param sourceDir - Directory to pack
 * @param destDir - Directory in which to unpack
 * @param name - Name of the .zip file
 */
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
