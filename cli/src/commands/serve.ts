import { writeFileSync } from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as webpack from 'webpack';
import * as WebpackDevServer from 'webpack-dev-server';
import { executeAngularCli, isAngularProject, readConfig } from '../utils';
import { baseConfig } from './webpack.config';


export interface IServeOptions {
   port: number;
}

/**
 * Add an entry for the Webpack Dev Server client in the given webpack config.
 * This is needed for live-reloading
 */
const addWebpackClientEntry = (config: webpack.Configuration, port: number): webpack.Configuration => {
   const clientAddress = `http://localhost:${port}`;
   const webpackClientEntry = `${require.resolve('webpack-dev-server/client')}?${clientAddress}`;
   const newConfig = { ...config };
   if (typeof newConfig.entry === 'string') {
      newConfig.entry = [newConfig.entry, webpackClientEntry];
   } else if (Array.isArray(newConfig.entry)) {
      newConfig.entry = [...newConfig.entry, webpackClientEntry];
   }
   return newConfig;
};

const serveBasicProject = async (options: IServeOptions) => {
   const configWithDevServerEntry = addWebpackClientEntry(baseConfig, options.port);
   const webpackCompiler = webpack(configWithDevServerEntry);
   const odinConfig = readConfig();
   delete odinConfig.projectName; // TODO: webpack-dev-server does not allow additional properties. Find another place to store projectName.
   const devServerConfig: WebpackDevServer.Configuration = odinConfig;
   const server = new WebpackDevServer(webpackCompiler, {
      ...devServerConfig,
      overlay: true,
   });
   console.log(`Server is starting. Go to http://localhost:${options.port} in your browser.`);
   await new Promise((resolvePromise, rejectPromise) => {
      server.listen(options.port, (error?: Error) => {
         if (error) {
            console.error('Failed to start Webpack Dev Server', error);
            rejectPromise(error);
         } else {
            resolvePromise();
         }
      });
   });
};

const serveAngularProject = async (options: IServeOptions) => {
   const proxyConfig = readConfig().proxy;
   const proxyTmpPath = path.resolve(os.tmpdir(), 'odin_proxy.json');
   writeFileSync(proxyTmpPath, JSON.stringify(proxyConfig));
   await executeAngularCli('serve', '--port', `${options.port}`, '--proxy-config', proxyTmpPath);
};

/**
 * Start the development server.
 *
 * NOTE: This function will never return.
 */
export const serveProject = async (options: IServeOptions) => {
   if (isAngularProject()) {
      await serveAngularProject(options);
   } else {
      await serveBasicProject(options);
   }
};
