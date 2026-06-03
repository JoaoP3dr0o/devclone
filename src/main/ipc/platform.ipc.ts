import { ipcMain } from 'electron'

import { detectCurrentPlatform } from '../services/platform.service'

export function registerPlatformIpc(): void {
  ipcMain.handle('platform:get', () => detectCurrentPlatform())
}
