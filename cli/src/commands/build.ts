import fs from 'fs-extra';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import webpack from 'webpack';
import { executeAngularCli, isAngularProject, readConfig, zip } from '../utils.js';
import { baseConfig } from './webpack.config.js';

const buildAngularProject = async () => {
   const odinConfig = readConfig();
   if (!odinConfig.projectName) {
      throw new Error('projectName missing from odin configuration');
   }
   const tempBuildDirectory = resolve(tmpdir(), `odin_build_${odinConfig.projectName}`);
   await executeAngularCli('build', '--configuration', 'production', '--output-path', tempBuildDirectory, '--delete-output-path');
   const zipFile = await zip(tempBuildDirectory, join(process.cwd(), 'dist'), `${odinConfig.projectName}.zip`);
   fs.removeSync(tempBuildDirectory);
   console.log('Created:', zipFile);
};

const buildBasicProject = async () => {
   await new Promise<void>((resolvePromise, rejectPromise) => {
      const config: webpack.Configuration = {
         ...baseConfig,
         mode: 'production',
      };
      webpack(config, error => {
         if (error) {
            rejectPromise(error);
         } else {
            resolvePromise();
         }
      });
   });
};

export const buildProject = async () => {
   if (isAngularProject()) {
      await buildAngularProject();
   } else {
      await buildBasicProject();
   }
};
