import { ElectronAPI } from '@electron-toolkit/preload'
import type { ToolCatalogItem } from '../shared/tools/catalog'
import type { LastScanStorage } from '../shared/scan.types'
import type { CurrentPlatform } from '../shared/platform/platform.types'
import type { UserProfile } from '../shared/profiles/profile.types'

export type InstallOutputChunk = { type: 'stdout' | 'stderr'; text: string }
export type InstallResult = { success: boolean; exitCode?: number; error?: string }

type DevCloneElectronAPI = ElectronAPI & {
  scanEnvironment: () => Promise<LastScanStorage>
  loadLastScan: () => Promise<LastScanStorage | null>
  getInstallCommand: (toolId: ToolCatalogItem['id']) => Promise<string | null>
  getPlatform: () => Promise<CurrentPlatform>
  runInstallCommand: (toolId: ToolCatalogItem['id']) => Promise<InstallResult>
  onInstallOutput: (callback: (chunk: InstallOutputChunk) => void) => void
  removeInstallListeners: () => void
  getUserProfile: () => Promise<UserProfile | null>
  saveUserProfile: (profile: UserProfile) => Promise<void>
}

declare global {
  interface Window {
    electron: DevCloneElectronAPI
    api: unknown
  }
}
