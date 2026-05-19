import { ipcMain } from 'electron'

import { scanEnvironment } from '../services/scan.service'
import { loadLastScan, saveLastScan } from '../services/storage.service'

export function registerScanIpc(): void {
  ipcMain.handle('scan:environment', async () => {
    const result = await scanEnvironment()
    await saveLastScan(result)

    return result
  })
  ipcMain.handle('load:lastScan', () => loadLastScan())
}
