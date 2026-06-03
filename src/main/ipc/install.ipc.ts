import { ipcMain } from 'electron'

import { toolsCatalog, type ToolCatalogItem } from '../../shared/tools/catalog'
import { spawnCommand } from '../services/command.service'
import { getInstallCommand } from '../services/install.service'

function isToolCatalogId(value: unknown): value is ToolCatalogItem['id'] {
  return typeof value === 'string' && toolsCatalog.some((tool) => tool.id === value)
}

export function registerInstallIpc(): void {
  ipcMain.handle('install:get-command', (_event, toolId: unknown) => {
    if (!isToolCatalogId(toolId)) {
      return null
    }

    return getInstallCommand(toolId)
  })

  ipcMain.handle('install:run-command', async (event, toolId: unknown) => {
    if (!isToolCatalogId(toolId)) {
      return { success: false, error: 'Invalid tool ID' }
    }

    const command = getInstallCommand(toolId)
    if (!command) {
      return { success: false, error: 'No install command available for this platform' }
    }

    try {
      const { exitCode } = await spawnCommand(command, (chunk) => {
        event.sender.send('install:output', chunk)
      })
      return { success: exitCode === 0, exitCode }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}
