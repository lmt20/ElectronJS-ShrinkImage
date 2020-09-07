const { app, BrowserWindow, Menu, ipcMain, shell, screen } = require('electron');
const path = require('path');
const os = require('os');
const slash = require('slash');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');


process.env.NODE_ENV = "production"
const isDev = process.env.NODE_ENV !== "production"
let primaryDisplay;
let mainWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: "ImageShrink",
        width: isDev ? 1000 : 500,
        height: isDev? primaryDisplay.size.height : 600,
        icon: './assets/icons/shrink-arrows-rounded-icon.jpg',
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
        icon: './assets/icons/shrink-arrows-rounded-icon.jpg',
    })
    // aboutWindown.loadUrl('https://github.com/lmt20')
    aboutWindow.loadURL('https://github.com/lmt20')
}

async function shrinkImage({fileUploadPath, fileUploadName, quality, dest}){
    const pngQuality = quality/100
    const files = await imagemin([slash(fileUploadPath)], {
		destination: dest,
		plugins: [
			imageminJpegtran(quality),
			imageminPngquant({
				quality: [pngQuality, pngQuality]
			})
		]
    });
    shell.showItemInFolder(path.join(dest, fileUploadName))
    mainWindow.webContents.send('shrinkimage:done', "Done")
}


ipcMain.on('image:shrink', (event, args) => {
    args['dest'] = path.join(os.homedir(), 'shrinkimage', )
    shrinkImage(args)

})

app.on('ready', () => {
    const template = require('./utils/menu');
    template.unshift({
        label: "About",
        click: createAboutWindow
    })
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
    primaryDisplay = screen.getPrimaryDisplay()
    createMainWindow()
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