import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';


const collectionPath = path.join(__dirname, '../collection.json');


describe('add-ids', () => {
   let tree: UnitTestTree;

   beforeEach(async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      tree = await runner.runSchematicAsync('add-ids', {}, Tree.empty()).toPromise();
   });

   it('works', () => {
      expect(tree.files).toEqual([]);
   });
});
