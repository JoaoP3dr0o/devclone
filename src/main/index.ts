import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { registerAuthIpc } from './ipc/auth.ipc'
import { registerCloudProfileIpc } from './ipc/cloud-profile.ipc'
import { registerExportIpc } from './ipc/export.ipc'
import { registerImportIpc } from './ipc/import.ipc'
import { registerInstallIpc } from './ipc/install.ipc'
import { registerPlatformIpc } from './ipc/platform.ipc'
import { registerPreflightIpc } from './ipc/preflight.ipc'
import { registerProfileIpc } from './ipc/profile.ipc'
import { registerScanIpc } from './ipc/scan.ipc'
import { registerSettingsIpc } from './ipc/settings.ipc'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  mainWindow = win

  win.on('ready-to-show', () => {
    win.show()
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.setAsDefaultProtocolClient('devclone')

// Windows/Linux: deep link chega como argumento na segunda instância
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine) => {
    const url = commandLine.find((arg) => arg.startsWith('devclone://'))
    if (url) mainWindow?.webContents.send('deep-link', url)
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// macOS: deep link chega via open-url
app.on('open-url', (event, url) => {
  event.preventDefault()
  mainWindow?.webContents.send('deep-link', url)
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  registerAuthIpc()
  registerCloudProfileIpc()
  registerScanIpc()
  registerInstallIpc()
  registerPlatformIpc()
  registerProfileIpc()
  registerPreflightIpc()
  registerSettingsIpc()
  registerExportIpc()
  registerImportIpc()

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
