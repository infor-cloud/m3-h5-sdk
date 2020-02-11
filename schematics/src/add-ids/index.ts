import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addModuleImportToRootModule, getProjectFromWorkspace, getProjectTargetOptions } from '@angular/cdk/schematics';
import { getWorkspace } from '@schematics/angular/utility/config';
import { addPackageJsonDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import { getLatestPackageVersion } from '../util/npm';


export function addIDS(_options: any): Rule {
   return async (tree: Tree, context: SchematicContext) => {
      await addIDSPackage(tree, context);
      addSohoComponentsModule(tree, context);
      addScripts(tree, context);
      addAssets(tree, context);
      await installDependencies(tree, context);
   };
}

async function addIDSPackage(tree: Tree, context: SchematicContext) {
   const idsPackage = await getLatestPackageVersion('ids-enterprise-ng');
   context.logger.info(`Add ${idsPackage.name}@${idsPackage.version}`);
   addPackageJsonDependency(tree, {
      name: idsPackage.name,
      version: idsPackage.version,
      type: NodeDependencyType.Default,
      overwrite: false,
   });
}

async function installDependencies(_tree: Tree, context: SchematicContext) {
   context.logger.info('Install dependencies');
   context.addTask(new NodePackageInstallTask());
}

function addSohoComponentsModule(tree: Tree, context: SchematicContext) {
   const workspace = getWorkspace(tree);
   const project = getProjectFromWorkspace(workspace);
   addModuleImportToRootModule(tree, 'SohoComponentsModule', 'ids-enterprise-ng', project);
   context.logger.info('Add SohoComponentsModule');
   return tree;
}

function addScripts(tree: Tree, context: SchematicContext) {
   const workspace = getWorkspace(tree);
   const project = getProjectFromWorkspace(workspace);
   const scripts = [
      './node_modules/jquery/dist/jquery.js',
      './node_modules/d3/build/d3.js',
      './node_modules/ids-enterprise/dist/js/sohoxi.js',
   ];
   ['build', 'test'].forEach(buildTarget => {
      const targetOptions = getProjectTargetOptions(project, buildTarget);
      if (!targetOptions.scripts) {
         targetOptions.scripts = scripts;
      } else {
         const targetOptionsScripts = targetOptions.scripts as unknown[];
         for (const script of scripts) {
            if (!targetOptionsScripts.includes(script)) {
               targetOptionsScripts.push(script);
            }
         }
      }
   });
   tree.overwrite('angular.json', JSON.stringify(workspace, null, 2));
   context.logger.info('Add IDS scripts');
}

function addAssets(tree: Tree, context: SchematicContext) {
   const workspace = getWorkspace(tree);
   const project = getProjectFromWorkspace(workspace);
   const assets = [
      {
         'glob': '**/*',
         'input': './node_modules/ids-enterprise/dist/css',
         'output': '/assets/ids-enterprise/css'
      },
      {
         'glob': '**/*',
         'input': './node_modules/ids-enterprise/dist/js/cultures',
         'output': '/assets/ids-enterprise/js/cultures'
      }
   ];
   ['build', 'test'].forEach(buildTarget => {
      const targetOptions = getProjectTargetOptions(project, buildTarget);
      if (!targetOptions.assets) {
         targetOptions.assets = assets;
      } else {
         const targetOptionsAssets = targetOptions.assets as unknown[];
         for (const asset of assets) {
            if (!targetOptionsAssets.find((a, b) => JSON.stringify(a) === JSON.stringify(b))) {
               targetOptionsAssets.push(asset);
            }
         }
      }
   });
   tree.overwrite('angular.json', JSON.stringify(workspace, null, 2));
   context.logger.info('Add IDS assets');
}
