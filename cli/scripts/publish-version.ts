import * as path from 'path';
import * as c from './common';

c.title('Publish a new M3 Odin version');

updateVersions();
publish();

function updateVersions(): void {
   const version = getVersion();
   if (!version) {
      const message = 'Version parameter missing';
      console.log(message);
      throw new Error(message);
   }

   const command = path.join(__dirname, 'version') + ' ' + version;
   c.execNodeSync(command);
}

function publish() {
   const command = path.join(__dirname, 'publish');
   c.execNodeSync(command);
}


function getVersion(): string | null {
   const argv = process.argv;
   if (argv.length >= 3) {
      return argv[2];
   }
   return null;
}

