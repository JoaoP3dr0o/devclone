import { ipcMain } from 'electron'

import { toolsCatalog, type ToolCatalogItem } from '../../shared/tools/catalog'
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
}
