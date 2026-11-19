'use strict';

/**
 * End-to-end test for the packaged desktop app.
 *
 * Runs the real packaged binary's renderer and drives the actual game through a
 * complete day, using Electron's own API rather than an external CDP client.
 * Usage: xvfb-run -a electron tests/desktop-e2e.js
 */
const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const GAME = path.join(__dirname, '..', 'dist', 'armor-of-god.html');
const results = [];
let failures = 0;

function check(name, condition, detail) {
  results.push({ name, ok: Boolean(condition), detail });
  if (!condition) failures += 1;
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function js(win, code) {
  return win.webContents.executeJavaScript(code, true);
}

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      devTools: false
    }
  });

  const errors = [];
  win.webContents.on('console-message', (_e, level, message) => {
    if (level >= 2) errors.push(message);
  });
  win.webContents.on('render-process-gone', (_e, d) => {
    errors.push(`render-process-gone: ${d.reason}`);
  });

  await win.loadFile(GAME);
  await sleep(700);

  check('page loaded', win.webContents.getURL().includes('armor-of-god.html'));
  check('game controller exposed', await js(win, 'typeof window.__game === "object"'));
  check('title screen rendered', (await js(win, 'document.querySelectorAll("button").length')) > 0);
  check('canvas present', await js(win, '!!document.getElementById("arena")'));
  check('canvas has non-zero size', await js(win,
    '(()=>{const c=document.getElementById("arena");return c.width>0&&c.height>0})()'));
  check('no node integration in page', await js(win,
    'typeof require==="undefined" && typeof process==="undefined"'));

  // Start a week in Watchman mode
  await js(win, `document.querySelector('[data-act="new"]').click()`);
  await sleep(250);
  await js(win, `document.querySelector('[data-mode="watchman"]').click()`);
  await js(win, `document.querySelector('[data-act="start"]').click()`);
  await sleep(400);
  check('day 1 briefing shown', (await js(win, 'window.__game.state.day')) === 1);

  // Morning plan -> battle
  await js(win, `document.querySelector('[data-act="plan"]').click()`);
  await sleep(250);
  await js(win, `document.querySelector('[data-dev-inc="prayer"]').click()`);
  await js(win, `document.querySelector('[data-act="commit"]').click()`);
  await sleep(700);

  check('encounter active', await js(win, '!!window.__game.currentEncounter'));
  const promptText = await js(win, 'document.querySelector(".threat-prompt__title").textContent');
  check('threat prompt visible', Boolean(promptText && promptText.trim()), promptText);

  // Canvas must actually render content (not a blank frame)
  const painted = await js(win, `(()=>{
    const c=document.getElementById('arena');
    const g=c.getContext('2d');
    const d=g.getImageData(0,0,c.width,c.height).data;
    let lit=0;
    for(let i=0;i<d.length;i+=4){ if(d[i]+d[i+1]+d[i+2] > 90) lit++; }
    return lit;
  })()`);
  check('canvas renders content', painted > 5000, `${painted} lit pixels`);

  // Answer correctly
  const idx = await js(win,
    'window.__game.currentEncounter.options.findIndex(o=>o.correct)');
  check('correct option exists', idx >= 0, `index ${idx}`);
  await js(win, `document.querySelectorAll('.option')[${idx}].click()`);
  await sleep(700);
  check('result screen shown', await js(win, '!!document.querySelector(".result__banner")'));

  // Persistence
  check('save written to localStorage', await js(win,
    '!!localStorage.getItem("aogdw:save")'));

  // Pause via keyboard
  // Pause must not be allowed to replace a result screen (it owns the only
  // path forward). It should be refused while the result modal is up.
  check('result modal blocks pause', await js(win,
    '(()=>{window.__game.openPause(); return window.__game.paused === false})()'));

  // Advance to a live threat, then exercise pause/resume.
  await js(win, 'document.querySelector("[data-continue]").click()');
  await sleep(700);
  check('next encounter is live',
    await js(win, '!!window.__game.currentEncounter && !window.__game.busy'));

  await js(win, 'window.__game.openPause()');
  await sleep(350);
  check('pause modal opens', await js(win, '!!document.querySelector(".modal")'));
  await js(win, 'window.__game.modals.close()');
  await sleep(500);
  check('pause resumes the encounter',
    await js(win, 'document.querySelectorAll(".option").length > 0'));
  check('pause cleared on resume', await js(win, 'window.__game.paused === false'));

  // Background auto-pause must also preserve the live encounter.
  await js(win, 'window.__game.onAppHidden()');
  await sleep(350);
  check('onAppHidden pauses battle', await js(win, '!!window.__game.paused'));
  await js(win, 'window.__game.modals.close()');
  await sleep(500);
  check('encounter restored after backgrounding',
    await js(win, 'document.querySelectorAll(".option").length > 0'));

  // Library renders all scripture cards
  await js(win, 'window.__game.openLibrary && window.__game.openLibrary()');
  await sleep(400);
  const cards = await js(win, 'document.querySelectorAll(".verse-card, .scripture-card, .lib__card").length');
  check('scripture library renders cards', cards > 10, `${cards} cards`);
  await js(win, 'window.__game.modals.close(); window.__game.paused=false;');

  check('no console errors or crashes', errors.length === 0, errors.slice(0, 3).join(' | '));

  console.log(`\n${results.length - failures}/${results.length} checks passed`);
  fs.writeFileSync(
    path.join(__dirname, '..', 'dist', 'desktop-e2e.json'),
    JSON.stringify({ total: results.length, failures, results }, null, 2)
  );

  app.exit(failures === 0 ? 0 : 1);
});
