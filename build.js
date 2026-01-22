const { execSync } = require('child_process');
const path = require('path');

const runCommand = (command, cwd) => {
    console.log(`Running: ${command} in ${cwd}`);
    execSync(command, { stdio: 'inherit', cwd });
};

try {
    const rootDir = __dirname;
    const clientDir = path.join(rootDir, 'client');
    const serverDir = path.join(rootDir, 'server');

    console.log('--- Building Client ---');
    runCommand('npm install', clientDir);
    runCommand('npm run build', clientDir);

    console.log('--- Installing Server Dependencies ---');
    runCommand('npm install', serverDir);

    console.log('--- Build Complete ---');
    console.log('To start the server, run:');
    console.log('cd server && npm start');

} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
}
