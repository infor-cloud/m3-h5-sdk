import { execSync, ExecSyncOptions } from 'child_process';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import url from 'url';
import { executeAngularCli, readConfig, writeConfig } from '../utils.js';
import { configureName, configureProxy } from './set.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export type NewProjectStyleOption = 'soho' | 'none';

export interface INewProjectOptions {
   name: string;
   proxy?: IProxyConfig;
   style: NewProjectStyleOption;
   angular?: boolean;
   install?: boolean;
   git?: boolean;
}


export interface IProxyConfig {
   target: string;
}

const makeTemporaryDirectory = (name: string): string => {
   const temporaryProjectDirectory = path.resolve(os.tmpdir(), `odin_${name}_${Math.round(Math.random() * 1000000)}`);
   fs.mkdirSync(temporaryProjectDirectory);
   return temporaryProjectDirectory;
};

const getBoilerplateDir = (style: NewProjectStyleOption, angular?: boolean) => {
   switch (style) {
      case 'soho':
         if (angular) {
            return path.resolve(__dirname, '../../boilerplate/angular-soho');
         } else {
            return path.resolve(__dirname, '../../boilerplate/basic');
         }
      case 'none':
         if (angular) {
            return path.resolve(__dirname, '../../boilerplate/angular');
         } else {
            return path.resolve(__dirname, '../../boilerplate/basic');
         }
      default:
         return path.resolve(__dirname, '../../boilerplate/basic');
   }
};

const copyVsCodeConfig = async (projectRoot: string) => {
   const srcDir = path.resolve(__dirname, '../../boilerplate/vscode');
   const destDir = path.join(projectRoot, '.vscode');
   await fs.copy(srcDir, destDir);
};

const newBasicProject = async (options: INewProjectOptions) => {
   const projectDir = path.resolve(options.name);
   if (fs.existsSync(projectDir)) {
      console.error(`Directory ${projectDir} already exists.`);
      process.exit(1);
   }
   const boilerplateDir = getBoilerplateDir(options.style);
   const temporaryProjectDirectory = makeTemporaryDirectory(options.name);
   fs.copySync(boilerplateDir, temporaryProjectDirectory);

   addOdinConfig(temporaryProjectDirectory, options);
   await copyVsCodeConfig(temporaryProjectDirectory);

   fs.mkdirSync(projectDir);
   fs.copySync(temporaryProjectDirectory, projectDir);
   fs.removeSync(temporaryProjectDirectory);
};

const modPackageJson = (projectRoot: string, style: NewProjectStyleOption) => {
   const boilerplateJson = fs.readJsonSync(path.resolve(getBoilerplateDir(style, true), 'package.json'));
   const packageJsonPath = path.resolve(projectRoot, 'package.json');
   const packageJson = fs.readJsonSync(packageJsonPath);
   packageJson.dependencies = { ...packageJson.dependencies, ...boilerplateJson.dependencies };
   packageJson.devDependencies = { ...packageJson.devDependencies, ...boilerplateJson.devDependencies };

   fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 3 });
};
const modAngularJson = (projectRoot: string, projectName: string, style: NewProjectStyleOption) => {
   const boilerplateJson = fs.readJsonSync(path.resolve(getBoilerplateDir(style, true), 'angular.json'));
   const angularJsonPath = path.resolve(projectRoot, 'angular.json');
   const angularJson = fs.readJsonSync(angularJsonPath);

   const boilerplateOptions = boilerplateJson.projects.projectName.architect.build.options;
   const buildOptions = angularJson.projects[projectName].architect.build.options;

   buildOptions.assets = [...buildOptions.assets, ...boilerplateOptions.assets];
   buildOptions.styles = [...buildOptions.styles, ...boilerplateOptions.styles];
   buildOptions.scripts = [...buildOptions.scripts, ...boilerplateOptions.scripts];
   buildOptions.baseHref = boilerplateOptions.baseHref;
   buildOptions.outputPath = boilerplateOptions.outputPath;

   // In Angular 17 default is now build-angular:application, which has different proxy mechanism, so we need to use the old builder for now
   const build = angularJson.projects[projectName].architect.build;
   build.builder = "@angular-devkit/build-angular:browser";

   // Old builder expect "main" not "browser"
   if (buildOptions.browser) {
      const mainPath = buildOptions.browser;
      delete buildOptions.browser;
      buildOptions.main = mainPath;
   }

   fs.writeJsonSync(angularJsonPath, angularJson, { spaces: 3 });
};

const copySrc = async (projectRoot: string, style: NewProjectStyleOption) => {
   const boilerplateSrc = path.resolve(getBoilerplateDir(style, true), 'src');
   const targetSrc = path.join(projectRoot, 'src');

   await fs.copy(boilerplateSrc, targetSrc);
};

const addOdinConfig = (projectRoot: string, options: INewProjectOptions) => {
   const boilerplateDir = getBoilerplateDir('none');
   const config = readConfig(boilerplateDir);
   if (options.proxy) {
      configureProxy(options.proxy.target, config);
   } else {
      console.warn('Warning: Proxy is not configured. You will need to configure it in \'odin.json\', or with the \'odin set\' command');
   }
   configureName(options.name, config);
   writeConfig(config, projectRoot);
};

const initGit = (projectDir: string) => {
   const options: ExecSyncOptions = { cwd: projectDir, stdio: 'inherit' };
   execSync('git init -q', options);
   execSync('git add .', options);
   execSync('git commit -m "Odin CLI init"', options);
};

const npmInstall = (projectDir: string) => {
   execSync('npm install --no-audit --quiet', { cwd: projectDir, stdio: 'inherit' });
};

const newAngularProject = async (options: INewProjectOptions) => {
   const ngOptions = ['--skip-install', '--strict=true', '--standalone=true'];
   if (!options.git) {
      ngOptions.push('--skip-git');
   }
   await executeAngularCli('new', options.name, ...ngOptions);
   console.log('Angular CLI project created');
   const angularProjectRoot = path.resolve(process.cwd(), options.name);
   console.log('Adding dependencies...');
   modPackageJson(angularProjectRoot, options.style);
   console.log('Configuring Angular...');
   modAngularJson(angularProjectRoot, options.name, options.style);
   console.log('Copying boilerplate source...');
   await copySrc(angularProjectRoot, options.style);
   console.log('Copying VS Code configuration...');
   await copyVsCodeConfig(angularProjectRoot);
   console.log('Adding Odin configuration...');
   addOdinConfig(angularProjectRoot, options);
};

export const newProject = async (options: INewProjectOptions) => {
   if (options.angular) {
      console.log(`Creating new Angular CLI project '${options.name}'`);
      await newAngularProject(options);
   } else {
      console.log(`Creating new basic project '${options.name}'`);
      await newBasicProject(options);
   }

   const newProjectDir = path.resolve(process.cwd(), options.name);
   if (options.install) {
      console.log('Installing dependencies. This can take a while...');
      npmInstall(newProjectDir);
   }

   if (options.git) {
      try {
         console.log('Commiting changes...');
         initGit(newProjectDir);
      } catch (error) {
         console.error(error);
         console.warn('Failed to commit changes. Do you have git installed? Continuing anyway...');
      }
   }
};
