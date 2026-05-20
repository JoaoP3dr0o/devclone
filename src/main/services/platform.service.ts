import {
  PLATFORM_CAPABILITIES,
  type PlatformCapabilities
} from '../../shared/platform/platform.capabilities'
import { PLATFORMS } from '../../shared/platform/platform.constants'
import type { PackageManager, PlatformId } from '../../shared/platform/platform.types'

type PlatformCapabilitiesById = PlatformCapabilities[PlatformId]

export type CurrentPlatform = {
  id: PlatformId
  name: string
  packageManager: PackageManager
  capabilities: PlatformCapabilitiesById
}

const NODE_PLATFORM_TO_ID: Partial<Record<NodeJS.Platform, PlatformId>> = {
  win32: 'windows',
  linux: 'linux',
  darwin: 'macos'
}

function resolvePlatformId(): PlatformId {
  return NODE_PLATFORM_TO_ID[process.platform] ?? 'windows'
}

export function getCurrentPlatform(): CurrentPlatform {
  const id = resolvePlatformId()
  const platform = PLATFORMS.find((entry) => entry.id === id) ?? PLATFORMS[0]

  return {
    id: platform.id,
    name: platform.name,
    packageManager: platform.packageManager,
    capabilities: PLATFORM_CAPABILITIES[id]
  }
}
