const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const slash = require('slash');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
require('electron-reload')(__dirname);


let mainWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: "ImageShrink",
        width: 1000,
        height: 600,
        icon: './assets/icons/shrink-arrows-rounded-icon.jpg',
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWindow.loadFile('./app/index.html')
}

function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        title: "ImageShrink",
        width: 300,
        height: 300,
        icon: './assets/icons/shrink-arrows-rounded-icon.jpg',
    })
    aboutWindow.loadFile('./app/about.html')
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