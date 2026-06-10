import { ipcMain } from 'electron'

import { importProfile } from '../services/import.service'

export function registerImportIpc(): void {
  ipcMain.handle('import:profile', async () => {
    try {
      return await importProfile()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao importar perfil'
      return { success: false, error: message }
    }
  })
}
