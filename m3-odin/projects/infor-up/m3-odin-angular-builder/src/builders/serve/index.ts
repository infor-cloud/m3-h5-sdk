import { DevServerBuilderOptions, executeDevServerBuilder } from '@angular-devkit/build-angular';
import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { nodeModulesPath, readConfig } from '../../utils';
import * as os from 'os';
import * as path from 'path';
import * as WebpackDevServer from 'webpack-dev-server';
import { readFileSync, writeFileSync } from 'fs-extra';

interface Options {
    browserTarget: string;
    port?: number;
    multiTenant?: boolean;
    ionApi?: boolean;
}

export default createBuilder(odinServeBuilder);

async function odinServeBuilder(
    options: Options,
    context: BuilderContext,
): Promise<BuilderOutput> {
    const proxyConfig = readConfig().proxy;
    if (!isProxyConfig(proxyConfig)) {
        return {
            success: false,
            error: 'Proxy config is invalid.',
        };
    }
    const proxyFile = prepareProxyFile(proxyConfig, options);
    const proxyTmpPath = path.resolve(os.tmpdir(), proxyFile.name);
    const fileContent = proxyFile.content;
    writeFileSync(proxyTmpPath, fileContent);
    const devServerOption: DevServerBuilderOptions = {
        browserTarget: options.browserTarget,
        host: 'localhost',
        port: options.port ?? 8080,
        proxyConfig: proxyTmpPath
    }
    return await executeDevServerBuilder(devServerOption, context).toPromise();
}

type PossibleProxyConfig = WebpackDevServer.ProxyConfigArrayItem | WebpackDevServer.ProxyConfigMap | WebpackDevServer.ProxyConfigArray | undefined;
type ProxyConfig = WebpackDevServer.ProxyConfigMap;
function isProxyConfig(proxy: PossibleProxyConfig): proxy is ProxyConfig {
    return proxy !== undefined && !Array.isArray(proxy);
}

function prepareProxyFile(proxyConfig: ProxyConfig, options: Options) {
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
    addMneProxyPlaceholders('/mne');
    if (useIonApi) {
        addIonProxyPlaceholders('/m3api-rest');
        addIonProxyPlaceholders('/ca');
        addIonProxyPlaceholders('/ODIN_DEV_TENANT');
        rewritePath('/m3api-rest', '/M3/m3api-rest');
        rewritePath('/ca', '/IDM');
    } else {
        addMneProxyPlaceholders('/m3api-rest');
        addMneProxyPlaceholders('/ca');
    }

    const mtToolContent = readFileSync(require.resolve('./mtauth')).toString();
    const configContent = JSON.stringify(proxyConfig)
        .replace(/\"ODIN_MT_SET_MNE_COOKIES\"/g, 'function (...args) { authenticator.setMNECookies(...args) }')
        .replace(/\"ODIN_MT_SET_ION_API_TOKEN\"/g, 'function (...args) { authenticator.setIONAPIToken(...args) }')
        .replace(/\"ODIN_MT_CHECK_ION_API_AUTHENTICATION\"/g, 'function (...args) { authenticator.checkIONAPIAuthentication(...args) }')
        .replace(/\"ODIN_MT_ON_ERROR\"/g, 'function (...args) { authenticator.onError(...args) }');
    let fileContent = mtToolContent.replace(/CONFIG_PLACEHOLDER/, configContent);
    const nmPath = nodeModulesPath();
    if (nmPath) {
        fileContent = fileContent.replace(/NODE_MODULES_PATH/, nmPath);
    }
    return { content: fileContent, name: 'odin_proxy.js' };

    function rewritePath(originalPath: string, newPath: string) {
        const pathConfig = proxyConfig[originalPath];
        const pattern = `^${originalPath}`;
        if (typeof pathConfig !== 'string' && !pathConfig.pathRewrite) {
            pathConfig.pathRewrite = { [pattern]: newPath };
        }
    }

    function addIonProxyPlaceholders(apiPath: string) {
        Object.assign(proxyConfig[apiPath], {
            onProxyReq: 'ODIN_MT_SET_ION_API_TOKEN',
            onProxyRes: 'ODIN_MT_CHECK_ION_API_AUTHENTICATION',
            onError: 'ODIN_MT_ON_ERROR',
        });
    }

    function addMneProxyPlaceholders(apiPath: string) {
        Object.assign(proxyConfig[apiPath], {
            onProxyReq: 'ODIN_MT_SET_MNE_COOKIES',
            onError: 'ODIN_MT_ON_ERROR',
        });
    }
}

function standardProxyFile(proxyConfig: ProxyConfig) {
    return { content: JSON.stringify(proxyConfig), name: 'odin_proxy.json' };
}
