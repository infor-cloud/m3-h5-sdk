import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { addNpmPackage, installDependencies } from '../util/npm';

export function addOdin(_options: any): Rule {
   return (tree: Tree, context: SchematicContext) => {
      return chain([
         addNpmPackage('@infor-up/m3-odin'),
         addNpmPackage('@infor-up/m3-odin-angular'),
         installDependencies(),
      ])(tree, context);
   };
}
