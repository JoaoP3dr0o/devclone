import { ElectronAPI } from '@electron-toolkit/preload'
import type { ToolCatalogItem } from '../shared/tools/catalog'
import type { LastScanStorage } from '../shared/scan.types'
import type { CurrentPlatform } from '../shared/platform/platform.types'
import type { UserProfile } from '../shared/profiles/profile.types'
import type { PreflightResult } from '../shared/tools/preflight.types'

export type InstallOutputChunk = { type: 'stdout' | 'stderr'; text: string }
export type InstallResult = { success: boolean; exitCode?: number; error?: string }
export type PreflightFixResult = { success: boolean; error?: string }
export type AppSettings = { autoScan: boolean }

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
  getVersion: () => Promise<string>
  getUserDataPath: () => Promise<string>
  clearScanData: () => Promise<void>
  getSettings: () => Promise<AppSettings>
  saveSettings: (settings: AppSettings) => Promise<void>
  preflight: {
    run: (toolId: string, platform: string) => Promise<PreflightResult>
    fix: (checkId: string) => Promise<PreflightFixResult>
    savePending: (toolId: string) => Promise<void>
    getPending: () => Promise<string[]>
    clearPending: () => Promise<void>
  }
}

declare global {
  interface Window {
    electron: DevCloneElectronAPI
    api: unknown
  }
}
