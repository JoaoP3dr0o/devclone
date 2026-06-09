import { ipcMain } from 'electron'

import { spawnCommand } from '../services/command.service'
import { runPreflight } from '../services/preflight.service'
import {
  clearPendingInstalls,
  getPendingInstalls,
  savePendingInstall
} from '../services/reboot-state.service'

export function registerPreflightIpc(): void {
  ipcMain.handle('preflight:run', (_event, toolId: unknown, platform: unknown) => {
    if (typeof toolId !== 'string' || typeof platform !== 'string') {
      return { canProceed: true, checks: [], requiresReboot: false }
    }
    return runPreflight(toolId, platform)
  })

  ipcMain.handle('preflight:fix', async (_event, checkId: unknown) => {
    if (typeof checkId !== 'string') {
      return { success: false, error: 'ID inválido' }
    }

    try {
      if (checkId === 'wsl2') {
        const { exitCode } = await spawnCommand(
          "powershell -Command \"Start-Process -FilePath wsl -ArgumentList '--install' -Verb RunAs -Wait\"",
          () => {}
        )
        return { success: exitCode === 0 }
      }

      if (checkId === 'curl') {
        const { exitCode } = await spawnCommand('sudo apt install curl -y', () => {})
        return { success: exitCode === 0 }
      }

      return { success: false, error: 'Correção automática não disponível para este item' }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('preflight:save-pending', (_event, toolId: unknown) => {
    if (typeof toolId !== 'string') return
    return savePendingInstall(toolId)
  })

  ipcMain.handle('preflight:get-pending', () => getPendingInstalls())

  ipcMain.handle('preflight:clear-pending', () => clearPendingInstalls())
}
