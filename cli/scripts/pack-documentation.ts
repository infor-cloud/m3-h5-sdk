import fs from "fs-extra";
import { begin, end, execNodeSync, relativePath, title, zip } from './common.js';

const versionNumber = fs.readJSONSync(relativePath("../package.json")).version;
const filenamePrefix = 'infor-m3-odin-docs';

title('Pack M3 Odin API documentation');

generate();
pack();

function generate(): void {
   const command = relativePath('documentation');
   execNodeSync(command);
}

async function pack() {
   const operation = begin('Packing documentation zip');

   const distPath = relativePath('../../dist');
   const docsPath = relativePath('../../m3-odin/docs');
   const zipFilename = filenamePrefix + '-' + versionNumber + '.zip';

   console.log('Creating zip file: ' + zipFilename + ' from directory ' + docsPath);
   await zip(docsPath, distPath, zipFilename);

   end(operation);
}
