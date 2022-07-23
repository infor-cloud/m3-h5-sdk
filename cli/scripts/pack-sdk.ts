import { execNodeSync, relativePath, title } from './common.js';

title('Pack M3 Odin SDK');

execute('pack');
execute('pack-documentation');
execute('pack-samples');

function execute(scriptName: string): void {
   const command = relativePath(scriptName);
   execNodeSync(command);
}
