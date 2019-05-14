import { readFileSync, writeFileSync } from 'fs-extra';
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
function addWebpackClientEntry(config: webpack.Configuration, port: number): webpack.Configuration {
   const clientAddress = `http://localhost:${port}`;
   const webpackClientEntry = `${require.resolve('webpack-dev-server/client')}?${clientAddress}`;
   const newConfig = { ...config };
   if (typeof newConfig.entry === 'string') {
      newConfig.entry = [newConfig.entry, webpackClientEntry];
   } else if (Array.isArray(newConfig.entry)) {
      newConfig.entry = [...newConfig.entry, webpackClientEntry];
   }
   return newConfig;
}

async function serveBasicProject(options: IServeOptions) {
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
}

async function serveAngularProject(options: IServeOptions) {
   const proxyConfig = readConfig().proxy;
   const proxyTmpPath = path.resolve(os.tmpdir(), 'odin_proxy.js');
   const mtToolContent = readFileSync(require.resolve('../mtauth')).toString();
   const configContent = JSON.stringify(proxyConfig)
      .replace(/\"ODIN_MT_SET_MNE_COOKIES\"/g, 'function (...args) { authenticator.setMNECookies(...args) }')
      .replace(/\"ODIN_MT_SET_ION_API_TOKEN\"/g, 'function (...args) { authenticator.setIONAPIToken(...args) }')
      .replace(/\"ODIN_MT_CHECK_ION_API_AUTHENTICATION\"/g, 'function (...args) { authenticator.checkIONAPIAuthentication(...args) }')
      .replace(/\"ODIN_MT_ON_ERROR\"/g, 'function (...args) { authenticator.onError(...args) }');
   const fileContent = mtToolContent.replace(/CONFIG_PLACEHOLDER/, configContent);
   // const fileContent = `
   //    function onProxyReq (proxyReq) {
   //       console.log("onProxyReq", proxyReq);
   //    }
   //    function onProxyRes (proxyRes) {
   //       console.log("onProxyRes", proxyRes);
   //    }
   //    module.exports = ${JSON.stringify(proxyConfig).replace(/\"ODIN_ON_PROXY_REQ\"/g, 'onProxyReq').replace(/\"ODIN_ON_PROXY_RES\"/g, 'onProxyRes')}
   // `;
   writeFileSync(proxyTmpPath, fileContent);
   await executeAngularCli('serve', '--port', `${options.port}`, '--proxy-config', proxyTmpPath);
}

/**
 * Start the development server.
 *
 * NOTE: This function will never return.
 */
export async function serveProject(options: IServeOptions) {
   if (isAngularProject()) {
      await serveAngularProject(options);
   } else {
      await serveBasicProject(options);
   }
};
