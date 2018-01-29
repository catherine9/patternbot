'use strict';

const {app, ipcMain, BrowserWindow, dialog, Menu} = require('electron');
const is = require('electron-is');

const appMenu = require(`${__dirname}/app/main/menu/app-menu`);
const menuFile = require(`${__dirname}/app/main/menu/helpers/file`);
const menuHelp = require(`${__dirname}/app/main/menu/helpers/help`);

const env = process.env.NODE_ENV;
const DEBUG = !!(env === 'development');

const appPkg = require(`${__dirname}/package.json`);

require('electron-debug')({ showDevTools: true });

let mainWindow;

const bindMenus = function () {
  menuFile.bind(appMenu, mainWindow.id);
  menuHelp.bind(appMenu, mainWindow.id);
};

const createMainWindow = function (next) {
  mainWindow = new BrowserWindow({
    width: 400,
    minWidth: 400,
    height: 400,
    show: false,
    minHeight: 400,
    vibrancy: 'light',
  });

  mainWindow.loadURL(`file://${__dirname}/app/renderer/windows/main/main.html`);
  bindMenus();

  mainWindow.on('closed', function () {
    mainWindow = null;

    if (!is.macOS()) app.quit();
  });

  mainWindow.on('focus', function () {
    mainWindow.webContents.send('app:focus');
  });

  mainWindow.on('blur', function () {
    mainWindow.webContents.send('app:blur');
  });

  mainWindow.once('ready-to-show', function () {
    mainWindow.show();

    if (next) next();
  });
};

const updateAppMenu = function () {
  Menu.setApplicationMenu(Menu.buildFromTemplate(appMenu.getMenuTemplate()));
};

app.on('ready', function () {
  updateAppMenu();
  createMainWindow();
});

app.on('window-all-closed', function () {
  if (!is.macOS()) app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createMainWindow();
});

app.on('open-file', function (e, filepath) {
  e.preventDefault();

  if (typeof filepath !== 'string') filepath = filepath[0];

  if (mainWindow === null) {
    createMainWindow(function () {
      mainWindow.webContents.send('app:add-folder', filepath);
    });
  } else {
    mainWindow.webContents.send('app:add-folder', filepath);
  }
});

ipcMain.on('menu:enable-file-items', function () {
  appMenu.updateMenuItem('file,generate', { enabled: true });
  appMenu.updateMenuItem('file,browse-pattern-library', { enabled: true });
});

ipcMain.on('menu:disable-file-items', function () {
  appMenu.updateMenuItem('file,generate', { enabled: false });
  appMenu.updateMenuItem('file,browse-pattern-library', { enabled: false });
});
