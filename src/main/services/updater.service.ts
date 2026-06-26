import { autoUpdater } from 'electron-updater'
import { BrowserWindow } from 'electron'
import log from 'electron-log'

autoUpdater.logger = log
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = false

export function initAutoUpdater(mainWindow: BrowserWindow, onUpdateReady?: () => void): void {
  // WARNING: builds sem code signing não devem ir para produção
  // Configure o certificado em electron-builder.yml antes de distribuir

  const send = (event: string, data?: unknown): void => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater:event', { event, data })
    }
  }

  autoUpdater.on('checking-for-update', () => send('checking'))
  autoUpdater.on('update-available', (info) => send('available', info))
  autoUpdater.on('update-not-available', () => send('not-available'))
  autoUpdater.on('download-progress', (progress) => send('progress', progress))
  autoUpdater.on('update-downloaded', (info) => {
    send('downloaded', info)
    onUpdateReady?.()
  })
  autoUpdater.on('error', (err) => {
    log.error('AutoUpdater error:', err)
    send('error', err.message)
  })

  autoUpdater.checkForUpdates().catch((err) => log.error('checkForUpdates error:', err))
  setInterval(
    () => autoUpdater.checkForUpdates().catch((err) => log.error('checkForUpdates error:', err)),
    6 * 60 * 60 * 1000
  )
}

export function applyUpdate(): void {
  autoUpdater.quitAndInstall()
}
