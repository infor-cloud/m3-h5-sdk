import fs from 'fs-extra';
import { createRequire } from 'module';
import os from 'os';
import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { executeAngularCli, isAngularProject, readConfig } from '../utils.js';
import { baseConfig } from './webpack.config.js';

const require = createRequire(import.meta.url);


export interface IServeOptions {
   port: number;
   multiTenant: boolean;
   ionApi: boolean;
}

async function serveBasicProject(options: IServeOptions) {
   const configWithDevServerEntry = addWebpackClientEntry(baseConfig, options.port);
   const webpackCompiler = webpack(configWithDevServerEntry);
   const odinConfig = readConfig();
   delete odinConfig.projectName; // TODO: webpack-dev-server does not allow additional properties. Find another place to store projectName.
   const devServerConfig: WebpackDevServer.Configuration = odinConfig;
   const server = new WebpackDevServer(webpackCompiler, {
      ...devServerConfig,
   });
   console.log(`Server is starting. Go to http://localhost:${options.port} in your browser.`);
   await new Promise<void>((resolvePromise, rejectPromise) => {
      server.listen(options.port, "localhost", (error?: Error) => {
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
   if (!isProxyConfig(proxyConfig)) {
      throw new Error('Proxy config is invalid.');
   }
   const proxyFile = prepareProxyFile(proxyConfig, options);
   const proxyTmpPath = path.resolve(os.tmpdir(), proxyFile.name);
   const fileContent = proxyFile.content;
   fs.writeFileSync(proxyTmpPath, fileContent);
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
}

function prepareProxyFile(proxyConfig: ProxyConfig, options: IServeOptions) {
   setHeaders('/mne');
   setHeaders('/m3api-rest');
   setHeaders('/ca');
   setHeaders('/ODIN_DEV_TENANT');
   if (options.multiTenant) {
      return multiTenantProxyFile(proxyConfig, options.ionApi);
   } else {
      return standardProxyFile(proxyConfig);
   }

   function setHeaders(apiPath: string) {
      const pathConfig = proxyConfig[apiPath];
      if (typeof pathConfig === 'object') {
         const target = pathConfig.target;
         if (target) {
            pathConfig.headers = {
               Origin: target.toString(),
               Referer: `${target}/odin-dev-proxy`,
               ...pathConfig.headers,
            };
         } else {
            console.warn(`Cannot set headers in config for '${apiPath}' since it has no target.`);
         }
      } else {
         console.warn(`Cannot set headers in config for '${apiPath}' since it is not an object.`);
      }
   }
}

function multiTenantProxyFile(proxyConfig: ProxyConfig, useIonApi?: boolean) {
   // Angular 20's Vite-based dev server requires the `configure(proxy)` pattern
   // instead of `onProxyReq`/`onProxyRes`/`onError` callback properties.

   const mneTargets = ['/mne'];
   const ionTargets: string[] = [];

   if (useIonApi) {
      ionTargets.push('/m3api-rest', '/ca', '/ODIN_DEV_TENANT');
      rewritePath('/m3api-rest', '/M3/m3api-rest');
      rewritePath('/ca', '/IDM');
   } else {
      mneTargets.push('/m3api-rest', '/ca');
   }

   const mtToolContent = fs.readFileSync(require.resolve('../mtauth.cjs')).toString();
   // Strip the old module.exports line — we'll add our own
   const authCode = mtToolContent.replace(/module\.exports\s*=\s*CONFIG_PLACEHOLDER\s*;?/, '');

   const mnePathsJson = JSON.stringify(mneTargets);
   const ionPathsJson = JSON.stringify(ionTargets);

   const proxyScript = `${authCode}

const proxyConfig = ${JSON.stringify(proxyConfig, null, 2)};

// Vite proxy: use configure(proxy) to attach event handlers (Angular 20+)
const mnePaths = ${mnePathsJson};
const ionPaths = ${ionPathsJson};

for (const p of mnePaths) {
   if (proxyConfig[p]) {
      proxyConfig[p].configure = function(proxy, options) {
         proxy.on('proxyReq', function(proxyReq, req, res) {
            authenticator.setMNECookies(proxyReq, req, res);
         });
         proxy.on('error', function(err, req, res) {
            authenticator.onError(p, err, res);
         });
      };
   }
}

for (const p of ionPaths) {
   if (proxyConfig[p]) {
      proxyConfig[p].configure = function(proxy, options) {
         proxy.on('proxyReq', function(proxyReq, req, res) {
            authenticator.setIONAPIToken(proxyReq, req, res);
         });
         proxy.on('proxyRes', function(proxyRes, req, res) {
            authenticator.checkIONAPIAuthentication(proxyRes, req, res);
         });
         proxy.on('error', function(err, req, res) {
            authenticator.onError(p, err, res);
         });
      };
   }
}

module.exports = proxyConfig;
`;

   return { content: proxyScript, name: 'odin_proxy.js' };

   function rewritePath(originalPath: string, newPath: string) {
      const pathConfig = proxyConfig[originalPath];
      const pattern = `^${originalPath}`;
      if (typeof pathConfig !== 'string' && !pathConfig.pathRewrite) {
         pathConfig.pathRewrite = { [pattern]: newPath };
      }
   }
}

function standardProxyFile(proxyConfig: ProxyConfig) {
   return { content: JSON.stringify(proxyConfig), name: 'odin_proxy.json' };
}

type PossibleProxyConfig = WebpackDevServer.ProxyConfigMap | WebpackDevServer.ProxyConfigArray | WebpackDevServer.ProxyConfigArrayItem | undefined;
type ProxyConfig = WebpackDevServer.ProxyConfigMap;
function isProxyConfig(proxy: PossibleProxyConfig): proxy is ProxyConfig {
   return proxy !== undefined && !Array.isArray(proxy);
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
