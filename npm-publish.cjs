const { execSync } = require('child_process');
const fs = require('fs');
const ncp = require('ncp');
const path = require('path');
const { promisify } = require('util');

(async function () {
    var dst = path.join(process.cwd(), 'build');
    if (fs.existsSync(dst)) {
        fs.rmSync(dst, { recursive: true });
    }
    fs.mkdirSync(dst);

    var package = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf-8' }));
    package.main = 'index.js';
    package.types = 'index.d.ts';
    package.scripts = {};

    await Promise.all([
        promisify(fs.copyFile)('README.md', `${dst}/README.md`),
        promisify(ncp)('src', dst),
        promisify(ncp)('dist', `${dst}/dist`),
        promisify(fs.writeFile)(`${dst}/package.json`, JSON.stringify(package, null, 2))
    ]);
    execSync('npm publish --access=public' + (/-(alpha|beta)/.test(package.version) ? ' --tag beta' : ''), { cwd: dst });
})();
