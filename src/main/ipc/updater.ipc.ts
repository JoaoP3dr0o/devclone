import { ipcMain } from 'electron'
import { applyUpdate } from '../services/updater.service'

let updateReady = false

export function registerUpdaterIpc(): void {
  ipcMain.handle('updater:apply', () => {
    if (updateReady) {
      applyUpdate()
    }
  })
}

export function setUpdateReady(value: boolean): void {
  updateReady = value
}
