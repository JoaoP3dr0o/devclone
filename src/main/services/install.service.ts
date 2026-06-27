import type { PlatformId } from '../../shared/platform/platform.types'
import { toolsCatalog, type ToolCatalogItem } from '../../shared/tools/catalog'
import type { InstallMethods, LinuxPackageManager } from '../../shared/tools/install.types'

import { getLinuxPackageManager } from './linux-pm.service'
import { getCurrentPlatform } from './platform.service'

// Pure function — exported for unit testing
export function resolveInstallCommand(
  installMethods: InstallMethods,
  platformId: PlatformId,
  linuxManager: LinuxPackageManager | null
): string | null {
  if (platformId === 'linux') {
    const linux = installMethods.linux
    if (!linux) return null
    if (typeof linux === 'string') return linux
    if (!linuxManager) return null
    return linux[linuxManager] ?? null
  }
  const command = installMethods[platformId]
  return command ?? null
}

export function getInstallCommand(toolId: ToolCatalogItem['id']): string | null {
  const tool = toolsCatalog.find((entry) => entry.id === toolId)
  if (!tool?.installMethods) {
    return null
  }

  const currentPlatform = getCurrentPlatform()
  return resolveInstallCommand(tool.installMethods, currentPlatform.id, getLinuxPackageManager())
}
