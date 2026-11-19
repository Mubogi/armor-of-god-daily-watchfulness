'use strict';

/**
 * Desktop shell for Armor of God: Daily Watchfulness.
 *
 * Loads the self-contained game from disk inside a locked-down BrowserWindow:
 * no Node integration in the page, no remote content, no navigation, no new
 * windows, context isolation on, sandbox on.
 */
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('node:path');

const GAME_FILE = path.join(__dirname, 'game', 'index.html');

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let mainWindow = null;

function notifyHidden() {
  if (!mainWindow) return;
  mainWindow.webContents
    .executeJavaScript('window.__game && window.__game.onAppHidden && window.__game.onAppHidden();')
    .catch(() => {});
}

function notifyVisible() {
  if (!mainWindow) return;
  mainWindow.webContents
    .executeJavaScript('window.__game && window.__game.onAppVisible && window.__game.onAppVisible();')
    .catch(() => {});
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 360,
    minHeight: 560,
    backgroundColor: '#05070d',
    title: 'Armor of God: Daily Watchfulness',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      devTools: false,
      spellcheck: false
    }
  });

  Menu.setApplicationMenu(null);
  mainWindow.loadFile(GAME_FILE);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('hide', notifyHidden);
  mainWindow.on('minimize', notifyHidden);
  mainWindow.on('restore', notifyVisible);

  // Lock navigation: this app only ever shows its own local file.
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) event.preventDefault();
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Refuse every permission request (camera, mic, geolocation, notifications).
app.on('web-contents-created', (_event, contents) => {
  contents.session.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
});
