import type { PlatformCapabilities } from './platform.capabilities'

export type PackageManager = 'winget' | 'apt' | 'brew'

export type PlatformId = 'windows' | 'linux' | 'macos'

export type PlatformDefinition = {
  id: PlatformId
  name: string
  packageManager: PackageManager
}

export type CurrentPlatform = {
  id: PlatformId
  name: string
  packageManager: PackageManager
  capabilities: PlatformCapabilities[PlatformId]
}
