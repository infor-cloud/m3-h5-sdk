import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { addAssetsToAngularJson, addScriptsToAngularJson, addStylesToAngularJson, addToRootModule } from '../util/angular';
import { addNpmPackage, installDependencies } from '../util/npm';


export function addIDS(_options: any): Rule {
   return (tree: Tree, context: SchematicContext) => {
      return chain([
         addNpmPackage('ids-enterprise-ng'),
         addToRootModule('ids-enterprise-ng', 'SohoComponentsModule'),
         addScripts(),
         addAssets(),
         addStyles(),
         installDependencies(),
      ])(tree, context);
   };
}

function addScripts(): Rule {
   const scripts = [
      './node_modules/jquery/dist/jquery.js',
      './node_modules/d3/build/d3.js',
      './node_modules/ids-enterprise/dist/js/sohoxi.js',
   ];
   return addScriptsToAngularJson(scripts);
}

function addAssets(): Rule {
   const assets = [
      {
         glob: '**/*',
         input: './node_modules/ids-enterprise/dist/css',
         output: '/assets/ids-enterprise/css'
      },
      {
         glob: '**/*',
         input: './node_modules/ids-enterprise/dist/js/cultures',
         output: '/assets/ids-enterprise/js/cultures'
      }
   ];
   return addAssetsToAngularJson(assets);
}

function addStyles(): Rule {
   const styles = ['node_modules/ids-enterprise/dist/css/light-theme.css'];
   return addStylesToAngularJson(styles);
}
