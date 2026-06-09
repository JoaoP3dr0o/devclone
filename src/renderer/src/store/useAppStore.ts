import { create } from 'zustand'

import type { EnvironmentProfile, UserProfile } from '@shared/profiles/profile.types'
import { DEFAULT_USER_PROFILE, userProfileToEnvironmentProfile } from '@shared/profiles/userProfile.utils'
import type { EnvironmentScanResult } from '@shared/scan.types'

type AppStore = {
  userProfile: UserProfile
  environmentProfile: EnvironmentProfile
  profileLoading: boolean

  scanResult: EnvironmentScanResult | null
  lastScanAt: string | null
  scanLoading: boolean
  scanError: string | null

  loadProfile: () => Promise<void>
  setProfile: (profile: UserProfile) => Promise<void>
  loadLastScan: () => Promise<void>
  triggerScan: () => Promise<void>
  clearScanData: () => Promise<void>
}

export const useAppStore = create<AppStore>((set) => ({
  userProfile: DEFAULT_USER_PROFILE,
  environmentProfile: userProfileToEnvironmentProfile(DEFAULT_USER_PROFILE),
  profileLoading: true,

  scanResult: null,
  lastScanAt: null,
  scanLoading: false,
  scanError: null,

  loadProfile: async () => {
    try {
      const saved = await window.electron.getUserProfile()
      const profile = saved ?? DEFAULT_USER_PROFILE
      set({
        userProfile: profile,
        environmentProfile: userProfileToEnvironmentProfile(profile),
        profileLoading: false
      })
    } catch {
      set({ profileLoading: false })
    }
  },

  setProfile: async (profile: UserProfile) => {
    set({
      userProfile: profile,
      environmentProfile: userProfileToEnvironmentProfile(profile)
    })
    await window.electron.saveUserProfile(profile)
  },

  loadLastScan: async () => {
    try {
      const saved = await window.electron.loadLastScan()
      if (saved) {
        set({ scanResult: saved.tools, lastScanAt: saved.lastScanAt })
      }
    } catch {
      // no saved scan yet
    }
  },

  triggerScan: async () => {
    set({ scanLoading: true, scanError: null })
    try {
      const saved = await window.electron.scanEnvironment()
      set({ scanResult: saved.tools, lastScanAt: saved.lastScanAt, scanLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível escanear o ambiente.'
      set({ scanError: message, scanLoading: false })
    }
  },

  clearScanData: async () => {
    await window.electron.clearScanData()
    set({ scanResult: null, lastScanAt: null })
  }
}))
