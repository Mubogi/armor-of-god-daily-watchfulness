#!/usr/bin/env node
/**
 * Packages the desktop builds with @electron/packager.
 *
 * Windows and Linux targets can be produced on any host. macOS targets need a
 * macOS host (Apple code signing and .app bundles cannot be assembled on Linux),
 * so they are only attempted on darwin.
 */
import { packager } from '@electron/packager';
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const stage = join(root, 'dist', 'desktop-stage');
const outDir = join(root, 'dist', 'desktop');

rmSync(stage, { recursive: true, force: true });
rmSync(outDir, { recursive: true, force: true });
mkdirSync(join(stage, 'game'), { recursive: true });
mkdirSync(outDir, { recursive: true });

if (!existsSync(join(root, 'dist', 'armor-of-god.html'))) {
  throw new Error('run `node build.mjs` first');
}

cpSync(join(root, 'dist', 'armor-of-god.html'), join(stage, 'game', 'index.html'));
cpSync(join(root, 'desktop', 'main.js'), join(stage, 'main.js'));

writeFileSync(
  join(stage, 'package.json'),
  JSON.stringify(
    {
      name: 'armor-of-god',
      productName: 'Armor of God',
      version: pkg.version,
      description: pkg.description,
      main: 'main.js',
      license: 'MIT',
      author: 'Mubogi'
    },
    null,
    2
  )
);

const targets = [
  { platform: 'win32', arch: 'x64' },
  { platform: 'linux', arch: 'x64' }
];
if (process.platform === 'darwin') {
  targets.push({ platform: 'darwin', arch: 'x64' }, { platform: 'darwin', arch: 'arm64' });
}

for (const { platform, arch } of targets) {
  const label = `${platform}-${arch}`;
  process.stdout.write(`packaging ${label} ... `);
  const paths = await packager({
    dir: stage,
    out: join(outDir, label),
    name: 'ArmorOfGod',
    platform,
    arch,
    overwrite: true,
    prune: true,
    asar: true,
    appVersion: pkg.version,
    buildVersion: pkg.version,
    win32metadata: {
      CompanyName: 'Mubogi',
      FileDescription: 'Armor of God: Daily Watchfulness',
      ProductName: 'Armor of God'
    },
    ignore: [/^\/node_modules\/\.cache/],
    quiet: true
  });

  if (platform === 'linux') {
    const bin = join(paths[0], 'ArmorOfGod');
    if (existsSync(bin)) execFileSync('strip', ['--strip-unneeded', bin], { stdio: 'ignore' });
  }
  console.log('done ->', paths[0].replace(root + '/', ''));
}

console.log('packaged desktop builds in dist/desktop');
