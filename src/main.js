/**
 * Author: Hassan Mehmood
 * Email: hassanmehmood6195@gmail.com
 * Linkedin: https://www.linkedin.com/in/hassanmehmood6195/
 * 
 * Have fun coding and feel free to connect
*/

require('electron-reload')(__dirname)

const { app, BrowserWindow, Menu, shell, ipcMain, Notification } = require('electron');
const path = require('path');
const axios = require('axios');
const main = require('electron-reload');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// initialize windows
let mainWindow;
let childWindow;

// initialize interval variable
var intervalWindow;

// initialize target price
let targetPriceVal;

// to show alert only once
let hideAlert = 0;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/components/index.html`);

  var menu = Menu.buildFromTemplate([
    {
      label: 'Menu',
      submenu: [
        { label: 'Adjust Notification Value' },
        { 
          label: 'Coin Market Cap',
          click() {
            shell.openExternal('http://coinmarketcap.com')
          }
        },
        { type: 'separator' },
        { 
          label: 'Exit',
          click() {
            app.quit();
          }
        }
      ]
    }
  ]);
  
  Menu.setApplicationMenu(menu);

  // this will wait for window to be ready to recieve
  // events and then send the event
  mainWindow.once('ready-to-show', () => {
      // this will update the BTC price every 5 seconds
      intervalWindow = setInterval(function() {
        getUpdatedBTCPrice();
      }, 5000);
  });

  mainWindow.on('closed', () => {
    win = null;
    clearMyInterval();
  })
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }

  clearMyInterval();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// this will open notifiy popup
ipcMain.on('openNotifyPopUp',(event,data) => {
  childWindow = new BrowserWindow({ 
    frame: false, 
    transparent: true, 
    alwaysOnTop: true, 
    width: 600, 
    height: 200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });
  childWindow.on('close', function() { win = null; });
  childWindow.loadURL(`file://${__dirname}/components/notify.html`);

  // once everything is set, window is loaded
  // show it to the customer
  childWindow.once('did-finish-load', () => {
    childWindow.show();
  });

  // this will wait for window to be ready to recieve
  // events and then send the event
  childWindow.once('ready-to-show', () => {
    // this will set the current target price (if set)
    // to the notify val input
    childWindow.webContents.send('currentNotifyVal', targetPriceVal);
  });
});

// this will close notifiy popup
ipcMain.on('closeNotifyPopUp',(event,data) => {
  childWindow.close();
});

// this will get the price from notifyVal input field(present in notfiy.html)
// and ask renderer(index.js) to update target price span(present in index.html) 
ipcMain.on('updateTargetPrice',(event,data) => {
  targetPriceVal = data;
  mainWindow.webContents.send('updatedTargetPrice', data);

  // since target price updated, enable the notification
  hideAlert = 0;
});

// this will display desktop notification
// to user
function showNotification(title, body) {
  if(hideAlert == 0) {
    new Notification({ title: title, body: body }).show();
    hideAlert = 1;
  }
}

// this will get the updated price from API and will 
// send to the renderer(index.js)
function getUpdatedBTCPrice() {
  axios.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD').then(res => {
    if(typeof targetPriceVal != "undefined" && targetPriceVal != '' && targetPriceVal < res.data.BTC.USD) {
      // generate window notification
      showNotification('BTC Alert', 'BTC just beat your target price!');
    }
    
    // this will ask renderer(index.html) to show the updated price
    mainWindow.webContents.send('updatedBTCPrice', res.data.BTC.USD);
  }).catch(err => {
    console.log('error found', err);
  });
}

// stop interval so if user close the window
// we don't to call the api
function clearMyInterval() {
  clearInterval(intervalWindow);
}