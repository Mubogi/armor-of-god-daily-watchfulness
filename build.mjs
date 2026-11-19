#!/usr/bin/env node
/**
 * Builds distributable artifacts from the ES-module source.
 *
 * The game ships as ES modules, which browsers refuse to load from file://
 * (CORS) and Android WebViews refuse from asset URLs. Bundling to a single
 * IIFE script and inlining everything produces one HTML file that runs
 * anywhere with zero network requests.
 */
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

mkdirSync(dist, { recursive: true });

const banner = `/* Armor of God: Daily Watchfulness v${pkg.version} | MIT | built ${new Date().toISOString().slice(0, 10)} */`;

const result = await build({
  entryPoints: [join(root, 'js/main.js')],
  bundle: true,
  format: 'iife',
  target: ['es2019'],
  minify: true,
  legalComments: 'none',
  write: false,
  banner: { js: banner }
});

const js = result.outputFiles[0].text;
const css = ['theme.css', 'layout.css', 'components.css']
  .map((f) => readFileSync(join(root, 'css', f), 'utf8'))
  .join('\n');

let html = readFileSync(join(root, 'index.html'), 'utf8');

html = html
  .replace(
    /\s*<link rel="stylesheet" href="css\/[^"]+" \/>/g,
    ''
  )
  // PWA wiring only applies when served over http(s); the single-file build is
  // opened from disk or an app bundle, where these would be dead references.
  .replace(/\s*<link rel="manifest"[^>]*>/g, '')
  .replace(/\s*<link rel="apple-touch-icon"[^>]*>/g, '')
  .replace(/\s*<script>\s*if \('serviceWorker' in navigator[\s\S]*?<\/script>/g, '')
  .replace(
    '<script type="module" src="js/main.js"></script>',
    `<script>\n${js}\n</script>`
  )
  .replace('</head>', `<style>\n${css}\n</style>\n</head>`);

// Fail the build rather than ship a silently broken bundle.
const leftovers = [...html.matchAll(/(?:src|href)="((?!data:|https?:|#)[^"]+)"/g)].map((m) => m[1]);
if (leftovers.length) {
  throw new Error(`Single-file build still references external files: ${leftovers.join(', ')}`);
}
if (!html.includes('</style>') || !html.includes('Daily Watchfulness')) {
  throw new Error('Single-file build lost required content');
}

const out = join(dist, 'armor-of-god.html');
writeFileSync(out, html);

const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
console.log(`built dist/armor-of-god.html  (${kb} KB, self-contained)`);
