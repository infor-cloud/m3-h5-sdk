import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { executeDevServerBuilder } from '@angular-devkit/build-angular';
import { JsonObject } from '@angular-devkit/core';
import * as fs from 'fs';
import * as path from 'path';
import { Schema } from './schema';


export default createBuilder(commandBuilder);

type Options = Schema & JsonObject;

async function commandBuilder(
   options: Options,
   context: BuilderContext,
): Promise<BuilderOutput> {
   context.logger.info('Using custom proxy configuration builder');
   const proxyPath = configureProxy(options);
   options.proxyConfig = proxyPath;
   return executeDevServerBuilder(options, context).toPromise();
}

function configureProxy(options: Options): string {
   let proxyConfig = fs.readFileSync(path.join(__dirname, './proxy.js')).toString();
   if (options.m3) {
      proxyConfig = proxyConfig.replace(/{M3_PLACEHOLDER}/gm, options.m3);
   }
   if (options.ionapi) {
      proxyConfig = proxyConfig.replace(/{IONAPI_PLACEHOLDER}/gm, options.ionapi);
   }
   const newProxyPath = path.join(__dirname, './odin-proxy.js');
   fs.writeFileSync(newProxyPath, proxyConfig);
   return newProxyPath;
}
