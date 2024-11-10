const { app, BrowserWindow } = require('electron');

function createWindow () {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadURL('http://localhost:3000');
  win.maximize();
  win.show();
}

app.whenReady().then(createWindow)