import * as fs from 'fs-extra';
import * as path from 'path';
import { Configuration } from 'webpack-dev-server';

export interface IOdinConfiguration extends Configuration {
    projectName?: string;
}

/**
* Find, read and parse the Odin configuration file.
* It should look for the file in the current working directory.
*/
export const readConfig = (cwd?: string): IOdinConfiguration => {
    const projectRoot = cwd || process.cwd();
    const configPath = path.resolve(projectRoot, 'odin.json');
    return fs.readJsonSync(configPath);
};

export const nodeModulesPath = (absolutePath?: string): string | undefined => {
    absolutePath = absolutePath || process.cwd();
    const parentPath = path.join(absolutePath, '../');
    if (fs.existsSync(path.join(absolutePath, 'node_modules'))) {
       return path.join(absolutePath, 'node_modules');
    } else if (parentPath === absolutePath) {
       return undefined;
    }
    return nodeModulesPath(parentPath);
 }
