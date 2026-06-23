import { ElectronAPI } from '@electron-toolkit/preload'

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
}
import type { ToolCatalogItem } from '../shared/tools/catalog'
import type { LastScanStorage } from '../shared/scan.types'
import type { CurrentPlatform } from '../shared/platform/platform.types'
import type { ProfilesStore, UserProfile } from '../shared/profiles/profile.types'
import type { PreflightResult } from '../shared/tools/preflight.types'

export type InstallOutputChunk = { type: 'stdout' | 'stderr'; text: string }
export type InstallResult = { success: boolean; exitCode?: number; error?: string }
export type PreflightFixResult = { success: boolean; error?: string }
export type AppSettings = { autoScan: boolean }
export type ExportProfileResult = { success: boolean; path?: string; error?: string; cancelled?: boolean }
export type ImportProfileResult = { success: boolean; profile?: UserProfile; ignoredTools?: string[]; error?: string; cancelled?: boolean }

type DevCloneElectronAPI = ElectronAPI & {
  scanEnvironment: () => Promise<LastScanStorage>
  loadLastScan: () => Promise<LastScanStorage | null>
  getInstallCommand: (toolId: ToolCatalogItem['id']) => Promise<string | null>
  getPlatform: () => Promise<CurrentPlatform>
  runInstallCommand: (toolId: string) => Promise<InstallResult>
  onInstallOutput: (callback: (chunk: InstallOutputChunk) => void) => void
  removeInstallListeners: () => void
  getUserProfile: () => Promise<UserProfile | null>
  saveUserProfile: (profile: UserProfile) => Promise<void>
  getAllProfiles: () => Promise<ProfilesStore>
  createProfile: (name: string, toolIds: string[], startEmpty?: boolean) => Promise<UserProfile | null>
  deleteProfile: (id: string) => Promise<void>
  setActiveProfile: (id: string) => Promise<void>
  updateProfileTools: (profileId: string, toolIds: string[]) => Promise<void>
  getVersion: () => Promise<string>
  getUserDataPath: () => Promise<string>
  clearScanData: () => Promise<void>
  getSettings: () => Promise<AppSettings>
  saveSettings: (settings: AppSettings) => Promise<void>
  exportProfile: () => Promise<ExportProfileResult>
  importProfile: () => Promise<ImportProfileResult>
  preflight: {
    run: (toolId: string, platform: string) => Promise<PreflightResult>
    fix: (checkId: string) => Promise<PreflightFixResult>
    savePending: (toolId: string) => Promise<void>
    getPending: () => Promise<string[]>
    clearPending: () => Promise<void>
  }
  getLocalProfilesRaw: () => Promise<ProfilesStore | null>
  checkMigrated: () => Promise<boolean>
  setMigrated: () => Promise<void>
  cloudProfile: {
    fetchAll: () => Promise<ProfilesStore>
    create: (name: string, toolIds: string[]) => Promise<UserProfile>
    update: (id: string, data: { name?: string; toolIds?: string[] }) => Promise<UserProfile>
    delete: (id: string) => Promise<void>
    activate: (id: string) => Promise<void>
  }
  onDeepLink: (callback: (url: string) => void) => void
  auth: {
    register: (name: string, email: string, password: string) => Promise<{ user: User }>
    login: (email: string, password: string) => Promise<{ user: User }>
    google: (code: string, codeVerifier: string, redirectUri: string) => Promise<{ user: User }>
    logout: () => Promise<void>
    getCurrentUser: () => Promise<{ user: User } | null>
    isAuthenticated: () => Promise<boolean>
    googleStart: () => Promise<{ user: User }>
  }
}

declare global {
  interface Window {
    electron: DevCloneElectronAPI
    api: unknown
  }
}
