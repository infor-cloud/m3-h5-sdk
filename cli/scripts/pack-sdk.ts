import * as path from 'path';
import * as c from './common';

c.title('Pack M3 Odin SDK');

execute('pack');
execute('pack-documentation');
execute('pack-samples');

function execute(scriptName: string): void {
   const command = path.join(__dirname, scriptName);
   c.execNodeSync(command);
}
