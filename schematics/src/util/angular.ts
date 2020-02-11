import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { addModuleImportToRootModule, getProjectFromWorkspace, getProjectTargetOptions } from '@angular/cdk/schematics';
import { getWorkspace } from '@schematics/angular/utility/config';

export function addToRootModule(packageName: string, ngModuleName: string): Rule {
   return (tree: Tree, context: SchematicContext) => {
      const workspace = getWorkspace(tree);
      const project = getProjectFromWorkspace(workspace);
      addModuleImportToRootModule(tree, ngModuleName, packageName, project);
      context.logger.debug(`Add ${ngModuleName} from ${packageName}`);
      return tree;
   };
}

export function addScriptsToAngularJson(scripts: string[]) {
   return addResourcesToAngularJson('scripts', scripts);
}

export function addAssetsToAngularJson(assets: AngularJsonAsset[]) {
   return addResourcesToAngularJson('assets', assets);
}

export function addStylesToAngularJson(styles: string[]) {
   return addResourcesToAngularJson('styles', styles);
}

function addResourcesToAngularJson(resourceType: 'scripts' | 'styles' | 'assets', resources: unknown[]): Rule {
   return (tree: Tree) => {
      const workspace = getWorkspace(tree);
      const project = getProjectFromWorkspace(workspace);
      ['build', 'test'].forEach(buildTarget => {
         const targetOptions = getProjectTargetOptions(project, buildTarget);
         if (!targetOptions[resourceType]) {
            targetOptions[resourceType] = resources;
         } else {
            const pizza = targetOptions[resourceType] as unknown[];
            for (const resource of resources) {
               if (!pizza.find((a, b) => JSON.stringify(a) === JSON.stringify(b))) {
                  pizza.push(resource);
               }
            }
         }
      });
      tree.overwrite('angular.json', JSON.stringify(workspace, null, 2));
      return tree;
   };
}

type AngularJsonAsset = string | {
   glob: string;
   input: string;
   output: string;
};
