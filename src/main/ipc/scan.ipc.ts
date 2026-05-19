import { ipcMain } from 'electron'

import { scanEnvironment } from '../services/scan.service'

export function registerScanIpc(): void {
  ipcMain.handle('scan:environment', () => scanEnvironment())
}
