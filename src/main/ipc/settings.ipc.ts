import { app, ipcMain } from 'electron'
import { unlink } from 'fs/promises'
import { join } from 'path'

import type { AppSettings } from '../services/settings.service'
import { loadSettings, saveSettings } from '../services/settings.service'

function isValidSettings(value: unknown): value is AppSettings {
  if (!value || typeof value !== 'object') return false
  const s = value as Record<string, unknown>
  return typeof s['autoScan'] === 'boolean'
}

export function registerSettingsIpc(): void {
  ipcMain.handle('app:getVersion', () => app.getVersion())
  ipcMain.handle('app:getUserDataPath', () => app.getPath('userData'))

  ipcMain.handle('app:clearScanData', async () => {
    try {
      await unlink(join(app.getPath('userData'), 'last-scan.json'))
    } catch {
      // file may not exist — not an error
    }
  })

  ipcMain.handle('app:getSettings', () => loadSettings())

  ipcMain.handle('app:saveSettings', async (_event, settings: unknown) => {
    if (!isValidSettings(settings)) return
    await saveSettings(settings)
  })
}
