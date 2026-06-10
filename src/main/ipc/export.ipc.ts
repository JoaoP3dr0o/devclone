import { ipcMain } from 'electron'

import { exportProfile } from '../services/export.service'

export function registerExportIpc(): void {
  ipcMain.handle('export:profile', async () => {
    try {
      return await exportProfile()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao exportar perfil'
      return { success: false, error: message }
    }
  })
}
