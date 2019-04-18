import * as path from 'path';
import * as c from './common';

const versionNumber = require('../package.json').version;
const filenamePrefix = 'infor-m3-odin-docs';

c.title('Pack M3 Odin API documentation');

generate();
pack();

function generate(): void {
   const command = path.join(__dirname, 'documentation');
   c.execNodeSync(command);
}

async function pack() {
   const operation = c.begin('Packing documentation zip');

   const distPath = path.join(__dirname, '../../dist');
   const docsPath = path.join(__dirname, '../../m3-odin/docs');
   const zipFilename = filenamePrefix + '-' + versionNumber + '.zip';

   console.log('Creating zip file: ' + zipFilename + ' from directory ' + docsPath);
   await c.zip(docsPath, distPath, zipFilename);

   c.end(operation);
}
