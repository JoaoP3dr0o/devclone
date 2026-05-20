import type { PlatformId } from '../../shared/platform/platform.types'
import { toolsCatalog, type ToolCatalogItem } from '../../shared/tools/catalog'
import type { InstallMethods } from '../../shared/tools/install.types'

import { getCurrentPlatform } from './platform.service'

function resolveInstallCommand(
  installMethods: InstallMethods,
  platformId: PlatformId
): string | null {
  const command = installMethods[platformId]
  return command ?? null
}

export function getInstallCommand(toolId: ToolCatalogItem['id']): string | null {
  const tool = toolsCatalog.find((entry) => entry.id === toolId)
  if (!tool?.installMethods) {
    return null
  }

  const currentPlatform = getCurrentPlatform()
  return resolveInstallCommand(tool.installMethods, currentPlatform.id)
}
