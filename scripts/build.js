const { exec } = require('child_process');
const { readdirSync } = require('fs');

try {
    const baseDir = './plugin/scripts';
    const tsFiles = readdirSync(baseDir).map(file => `${baseDir}/${file}`);

    exec(`tsc ${tsFiles.join(' ')} --outdir dist/plugin-scripts`);
    exec('cp -r plugin/icons dist');
    exec('cp -r manifest.json dist');
} catch (err) {
    console.log(err);
}