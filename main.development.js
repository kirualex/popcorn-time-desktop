/* eslint global-require: 0 */

import { app, BrowserWindow, Menu, shell, crashReporter } from 'electron';


let menu;
let template;
let mainWindow = null;

(() => {
  crashReporter.start({
    productName: 'PopcornTime',
    companyName: 'PopcornTime',
    submitURL: 'https://popcorntime.io',
    autoSubmit: false
  });

  if (process.env.NODE_ENV === 'production') {
    if (require('electron-squirrel-startup')) return;
  }

  if (process.env.NODE_ENV === 'development') {
    require('electron-debug')();
    require('dotenv').config();
  }

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  const installExtensions = async () => {
    if (process.env.NODE_ENV === 'development') {
      const installer = require('electron-devtools-installer'); // eslint-disable-line
      const extensions = [
        'REACT_DEVELOPER_TOOLS',
        'REDUX_DEVTOOLS'
      ];
      const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
      for (const name of extensions) {
        try {
          await installer.default(installer[name], forceDownload);
        } catch (e) {} // eslint-disable-line
      }
    }
  };

  app.on('ready', async () => {
    await installExtensions();

    mainWindow = new BrowserWindow({
      show: false,
      width: 1024,
      height: 728,
      backgroundColor: '#252525',
      webPreferences: {
        darkTheme: true,
        'web-preferences': { 'web-security': false },
        scrollBounce: true,
        overlayFullscreenVideo: false
      }
    });

    if (process.env.NODE_ENV === 'development') {
      mainWindow.loadURL(`file://${__dirname}/app/app.html`);
    } else {
      mainWindow.loadURL(`file://${__dirname}/app.html`);
    }

    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.show();
      mainWindow.focus();
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    if (process.env.NODE_ENV === 'development') {
      mainWindow.openDevTools();
      mainWindow.webContents.on('context-menu', (e, props) => {
        const { x, y } = props;

        Menu.buildFromTemplate([{
          label: 'Inspect element',
          click() {
            mainWindow.inspectElement(x, y);
          }
        }]).popup(mainWindow);
      });
    }

    if (process.platform === 'darwin') {
      template = [{
        label: 'PopcornTime',
        submenu: [{
          label: 'About PopcornTime',
          selector: 'orderFrontStandardAboutPanel:'
        }, {
          type: 'separator'
        }, {
          label: 'Services',
          submenu: []
        }, {
          type: 'separator'
        }, {
          label: 'Hide PopcornTime',
          accelerator: 'Command+H',
          selector: 'hide:'
        }, {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:'
        }, {
          label: 'Show All',
          selector: 'unhideAllApplications:'
        }, {
          type: 'separator'
        }, {
          label: 'Quit',
          accelerator: 'Command+Q',
          click() {
            app.quit();
          }
        }]
      }, {
        label: 'Edit',
        submenu: [{
          label: 'Undo',
          accelerator: 'Command+Z',
          selector: 'undo:'
        }, {
          label: 'Redo',
          accelerator: 'Shift+Command+Z',
          selector: 'redo:'
        }, {
          type: 'separator'
        }, {
          label: 'Cut',
          accelerator: 'Command+X',
          selector: 'cut:'
        }, {
          label: 'Copy',
          accelerator: 'Command+C',
          selector: 'copy:'
        }, {
          label: 'Paste',
          accelerator: 'Command+V',
          selector: 'paste:'
        }, {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:'
        }]
      }, {
        label: 'View',
        submenu: (process.env.NODE_ENV === 'development') ? [{
          label: 'Reload',
          accelerator: 'Command+R',
          click() {
            mainWindow.webContents.reload();
          }
        }, {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click() {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        }, {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click() {
            mainWindow.toggleDevTools();
          }
        }] : [{
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click() {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        }]
      }, {
        label: 'Window',
        submenu: [{
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:'
        }, {
          label: 'Close',
          accelerator: 'Command+W',
          selector: 'performClose:'
        }, {
          type: 'separator'
        }, {
          label: 'Bring All to Front',
          selector: 'arrangeInFront:'
        }]
      }, {
        label: 'Help',
        submenu: [{
          label: 'Learn More',
          click() {
            shell.openExternal('https://github.com/amilajack/popcorn-time-desktop');
          }
        }, {
          label: 'Documentation',
          click() {
            shell.openExternal('https://github.com/amilajack/popcorn-time-desktop/wiki');
          }
        }, {
          label: 'Community Discussions',
          click() {
            shell.openExternal('https://gitter.im/amilajack/popcorn-time-desktop');
          }
        }, {
          label: 'Search Issues',
          click() {
            shell.openExternal('https://github.com/amilajack/popcorn-time-desktop/issues');
          }
        }]
      }];

      menu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(menu);
    } else {
      template = [{
        label: '&File',
        submenu: [{
          label: '&Open',
          accelerator: 'Ctrl+O'
        }, {
          label: '&Close',
          accelerator: 'Ctrl+W',
          click() {
            mainWindow.close();
          }
        }]
      }, {
        label: '&View',
        submenu: (process.env.NODE_ENV === 'development') ? [{
          label: '&Reload',
          accelerator: 'Ctrl+R',
          click() {
            mainWindow.webContents.reload();
          }
        }, {
          label: 'Toggle &Full Screen',
          accelerator: 'F11',
          click() {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        }, {
          label: 'Toggle &Developer Tools',
          accelerator: 'Alt+Ctrl+I',
          click() {
            mainWindow.toggleDevTools();
          }
        }] : [{
          label: 'Toggle &Full Screen',
          accelerator: 'F11',
          click() {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        }]
      }, {
        label: 'Help',
        submenu: [{
          label: 'Learn More',
          click() {
            shell.openExternal('http://github.com/amilajack/popcorn-time-desktop');
          }
        }, {
          label: 'Documentation',
          click() {
            shell.openExternal('https://github.com/amilajack/popcorn-time-desktop/wiki');
          }
        }, {
          label: 'Community Discussions',
          click() {
            shell.openExternal('https://gitter.im/amilajack/popcorn-time-desktop');
          }
        }, {
          label: 'Search Issues',
          click() {
            shell.openExternal('https://github.com/amilajack/popcorn-time-desktop/issues');
          }
        }]
      }];
      menu = Menu.buildFromTemplate(template);
      mainWindow.setMenu(menu);
    }
  });
})();
