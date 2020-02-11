import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addPackageJsonDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import { get } from 'https';

export interface NpmRegistryPackage {
   name: string;
   version: string;
}

export function getLatestPackageVersion(packageName: string): Promise<NpmRegistryPackage> {
   const DEFAULT_VERSION = 'latest';

   return new Promise(resolve => {
      return get(`https://registry.npmjs.org/${packageName}`, res => {
         let rawData = '';
         res.on('data', chunk => (rawData += chunk));
         res.on('end', () => {
            try {
               const response = JSON.parse(rawData);
               const version = (response && response['dist-tags']) || {};

               resolve(buildPackage(response.name || packageName, `^${version.latest}`));
            } catch (e) {
               resolve(buildPackage(packageName));
            }
         });
      }).on('error', () => resolve(buildPackage(packageName)));
   });

   function buildPackage(
      name: string,
      version: string = DEFAULT_VERSION
   ): NpmRegistryPackage {
      return { name, version };
   }
}

export function addNpmPackage(packageName: string): Rule {
   return async (tree: Tree, context: SchematicContext) => {
      const npmPackage = await getLatestPackageVersion(packageName);
      context.logger.debug(`Add ${npmPackage.name}@${npmPackage.version}`);
      addPackageJsonDependency(tree, {
         name: npmPackage.name,
         version: npmPackage.version,
         type: NodeDependencyType.Default,
         overwrite: false,
      });
   };
}

export function installDependencies(): Rule {
   return (tree: Tree, context: SchematicContext) => {
      context.logger.debug('Install dependencies');
      context.addTask(new NodePackageInstallTask());
      return tree;
   };
}
