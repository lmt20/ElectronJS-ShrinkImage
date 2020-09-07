const { app, BrowserWindow, Menu, ipcMain, shell, screen, Tray } = require('electron');
const path = require('path');
const os = require('os');
const slash = require('slash');


process.env.NODE_ENV = "development"
const isDev = process.env.NODE_ENV !== "production"
let primaryDisplay;
let mainWindow;
let tray;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: "ImageShrink",
        width: isDev ?  primaryDisplay.size.width : 500,
        height: isDev? primaryDisplay.size.height : 600,
        icon: './assets/icons/cpu.png',
        // show: false,
        opacity: 0.9,
        webPreferences: {
            nodeIntegration: true,
        },
    })
    mainWindow.loadFile('./app/index.html')
    if(isDev ){
        mainWindow.webContents.openDevTools()
    }
}

function createAboutWindow() {
    console.log((primaryDisplay.size.width - 500)/2);

    aboutWindow = new BrowserWindow({
        title: "ImageShrink",
        width: (primaryDisplay.size.width - 500)/2 > 500 ? 500 : (primaryDisplay.size.width - 500)/2,
        height: isDev? primaryDisplay.size.height : 600,
        x: (primaryDisplay.size.width - 500)/2 > 500? (primaryDisplay.size.width - 500)/2 - 500: 0,
        y: (primaryDisplay.size.height - 600)/2+12,
        icon: './assets/icons/cpu.png',
    })
    // aboutWindown.loadUrl('https://github.com/lmt20')
    aboutWindow.loadURL('https://github.com/lmt20')
}


app.on('ready', () => {
    const template = require('./utils/menu');
    template.unshift({
        label: "About",
        click: createAboutWindow
    })
    template[1].submenu.unshift({
        label: "Toggle Nav",
        click: () => {
          mainWindow.webContents.send('nav:toggle')
        },
        accelerator: 'CmdOrCtrl+N'
    })
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
    primaryDisplay = screen.getPrimaryDisplay()
    createMainWindow()

    const iconPath = path.join(__dirname, 'assets', 'icons','cpu.png')
    tray = new Tray(iconPath)
    tray.on('click', () => {
        if(mainWindow.isVisible() === true){
            mainWindow.hide()
        }
        else{
            mainWindow.show()
        }
    })
    tray.on('right-click', () => {
        console.log("okkfoko");
        const contextMenu = Menu.buildFromTemplate([{
            label: 'Quit',
            click: () => {
                app.isQuitting = true,
                app.quit()
            }
        }])
        tray.popUpContextMenu(contextMenu);
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
    }
})