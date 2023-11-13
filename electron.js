const { app, BrowserWindow, Tray, Menu } = require('electron');
const config = require('./config.json');
const path = require('path');

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    icon: path.join(__dirname, './icons/local.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(config.host);

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  return mainWindow;
};

const createTray = () => {
  const tray = new Tray(path.join(__dirname, 'icons/local.png'));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: 'Exit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Nexus LFS');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    mainWindow.show();
  });
};

app.on('ready', () => {
  require('./server.js');
  createWindow();
  createTray();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  app.isQuiting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
