import { Options as Config } from 'http-proxy-middleware';
import { ProxyConfigMap } from 'webpack-dev-server';
import { IOdinConfiguration, isValidProxyUrl, readConfig, removeSurroundingSlash, writeConfig } from '../utils.js';

const isConfigurationObject = (obj?: string | Config): obj is Config => {
   return obj !== undefined && typeof obj !== 'string';
};

const isProxyConfigMap = (config?: object): config is ProxyConfigMap => {
   return config !== undefined && !Array.isArray(config);
};

const configureProxyEntry = (url: string, apiPath: string, config: IOdinConfiguration, rewritePath?: string) => {
   const cleanUrl = removeSurroundingSlash(url);
   if (isProxyConfigMap(config.proxy)) {
      const proxyEntry = config.proxy[apiPath];
      if (isConfigurationObject(proxyEntry)) {
         proxyEntry.target = cleanUrl;
         if (rewritePath) {
            proxyEntry.pathRewrite = {};
            proxyEntry.pathRewrite[`^${apiPath}`] = rewritePath;
         }
      } else {
         console.warn(`Proxy entry for '${apiPath}' may be incorrectly formatted.`);
      }
   } else {
      console.warn('Proxy configuration may be incorrectly formatted.');
   }
};

export const configureProxy = (url: string, config: IOdinConfiguration) => {
   if (isValidProxyUrl(url)) {
      configureProxyEntry(url, '/m3api-rest', config);
      configureProxyEntry(url, '/mne', config);
      configureProxyEntry(url, '/ca', config);
   } else {
      throw new Error(`Could not parse URL '${url}'. It should match: http(s)://example.com(:port)`);
   }
};

export const configureIonProxy = (fullUrl: string, config: IOdinConfiguration) => {
   const match = fullUrl.match(/(^https?:\/\/[^\/]+)\/([^\/]+)$/);
   if (match !== null) {
      const [_, url, tenant] = match;
      configureProxyEntry(url, '/ODIN_DEV_TENANT', config, `/${tenant}`);
   } else {
      throw new Error(`Could not parse URL '${fullUrl}'. It should match: http(s)://domain(:port)/tenant`);
   }
};

export const configureName = (name: string, config: IOdinConfiguration) => {
   config.projectName = name;
};

export const setConfiguration = (key: string, value: string) => {
   const config = readConfig();
   switch (key) {
      case 'name':
         configureName(value, config);
         break;
      case 'm3-proxy':
         configureProxy(value, config);
         break;
      case 'ion-proxy':
         configureIonProxy(value, config);
         break;
      default:
         throw new Error(`Unknown configuration key '${key}'. Valid keys are: name, m3-proxy, ion-proxy`);
   }
   writeConfig(config);
};
