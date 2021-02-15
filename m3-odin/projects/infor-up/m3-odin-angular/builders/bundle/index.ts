import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { executeBrowserBuilder } from '@angular-devkit/build-angular';
import { JsonObject } from '@angular-devkit/core';
import * as archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';
import { Schema } from './schema';


export default createBuilder(commandBuilder);

type Options = Schema & JsonObject;

async function commandBuilder(
   options: Options,
   context: BuilderContext,
): Promise<BuilderOutput> {
   context.logger.info('Using custom bundler', context.target);
   const buildResult = await executeBrowserBuilder(options, context).toPromise();
   if (buildResult.success) {
      const zipName = `${context.target.project}.zip`;
      context.logger.info(`Creating ${zipName}`);
      // TODO: Fix input/output paths
      const zipFile = await zip(options.outputPath, options.outputPath, zipName);
      context.logger.info(`Created ${zipFile}`);
      return buildResult;
   }
}

async function zip(sourceDir: string, destDir: string, name: string): Promise<string> {
   return new Promise<string>((resolvePromise, rejectPromise) => {
      const archive = archiver('zip');
      fs.mkdirSync(destDir, { recursive: true });
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
}
