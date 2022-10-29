import { execNodeSync, relativePath, title } from './common.js';
title('Publish a new M3 Odin version');
updateVersions();
publish();
function updateVersions() {
    const version = getVersion();
    if (!version) {
        const message = 'Version parameter missing';
        console.log(message);
        throw new Error(message);
    }
    const command = relativePath('version') + ' ' + version;
    execNodeSync(command);
}
function publish() {
    const command = relativePath('publish');
    execNodeSync(command);
}
function getVersion() {
    const argv = process.argv;
    if (argv.length >= 3) {
        return argv[2];
    }
    return null;
}
