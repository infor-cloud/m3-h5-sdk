import { begin, end, npmRun, projectDirectory, title } from './common.js';
// const name = 'M3 Odin';
// const moduleFormat = 'commonjs';
// const mode = 'file'; // modules | file
// const includes = [
//    'm3-odin',
//    'm3-odin-angular'
// ];
title('Generate M3 Odin API documentation');
generate();
// function resolveVersion(): string {
//    const file = relativePath('../../m3-odin/package.json');
//    return getPackageVersion(file);
// }
function generate() {
    const operation = begin('Generating');
    npmRun('build:docs', projectDirectory());
    // const sourceDirectory = projectDirectory('projects/infor-up');
    // const targetDirectory = projectDirectory('docs');
    // const version = resolveVersion();
    // console.log('Version: ' + version);
    // console.log('Source directory: ' + sourceDirectory);
    // console.log('Target directory: ' + sourceDirectory);
    // clearDirectory(targetDirectory);
    // process.chdir(sourceDirectory);
    // const sourceFiles = includes.join(' ');
    // const fullName = name + ' - ' + version;
    // const command = `typedoc --name "${fullName}" --readme none --mode ${mode} --module ${moduleFormat} --excludeExternals --externalPattern "*@angular*|*rxjs*" --excludeNotExported --excludePrivate --ignoreCompilerErrors --out "${targetDirectory}" ${sourceFiles}`;
    // execSync(command);
    end(operation);
}
// function clearDirectory(directory: string): void {
//    const operation = begin('Clear directory');
//    console.log('Directory name: ' + directory);
//    removeDirectory(directory);
//    createDirectory(directory);
//    end(operation);
// }
