import type { PlatformDefinition } from './platform.types'

export const PLATFORMS: readonly PlatformDefinition[] = [
  { id: 'windows', name: 'Windows', packageManager: 'winget' },
  { id: 'linux', name: 'Linux', packageManager: 'apt' },
  { id: 'macos', name: 'macOS', packageManager: 'brew' }
]
