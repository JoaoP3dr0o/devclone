import { create } from 'zustand'

import type { EnvironmentProfile, UserProfile } from '@shared/profiles/profile.types'
import { userProfileToEnvironmentProfile } from '@shared/profiles/userProfile.utils'
import type { EnvironmentScanResult } from '@shared/scan.types'

type ProfileInput = { name: string; toolIds: string[] }

type User = {
  id: string
  email: string
  name: string
  avatarUrl?: string
}

type AppStore = {
  // Auth state
  currentUser: User | null
  authLoading: boolean

  // Profile state
  userProfile: UserProfile
  environmentProfile: EnvironmentProfile
  profileLoading: boolean
  profiles: UserProfile[]
  activeProfileId: string

  // Scan state
  scanResult: EnvironmentScanResult | null
  lastScanAt: string | null
  scanLoading: boolean
  scanError: string | null

  // Auth actions
  loadCurrentUser: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>

  // Profile actions
  loadProfile: () => Promise<void>
  setProfile: (profile: ProfileInput) => Promise<void>
  loadAllProfiles: () => Promise<void>
  createProfile: (name: string, toolIds: string[], startEmpty?: boolean) => Promise<UserProfile | null>
  deleteProfile: (id: string) => Promise<void>
  setActiveProfile: (id: string) => Promise<void>
  updateProfileTools: (profileId: string, toolIds: string[]) => Promise<void>

  // Scan actions
  loadLastScan: () => Promise<void>
  triggerScan: () => Promise<void>
  clearScanData: () => Promise<void>
}

const EMPTY_PROFILE: UserProfile = { id: '', name: '', toolIds: [] }

export const useAppStore = create<AppStore>((set, get) => ({
  currentUser: null,
  authLoading: true,

  userProfile: EMPTY_PROFILE,
  environmentProfile: userProfileToEnvironmentProfile(EMPTY_PROFILE),
  profileLoading: true,
  profiles: [],
  activeProfileId: '',

  scanResult: null,
  lastScanAt: null,
  scanLoading: false,
  scanError: null,

  loadCurrentUser: async () => {
    set({ authLoading: true })
    try {
      const result = await window.electron.auth.getCurrentUser()
      set({ currentUser: result?.user ?? null })
    } finally {
      set({ authLoading: false })
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ authLoading: true })
    try {
      const { user } = await window.electron.auth.register(name, email, password)
      set({ currentUser: user })
    } finally {
      set({ authLoading: false })
    }
  },

  login: async (email: string, password: string) => {
    set({ authLoading: true })
    try {
      const { user } = await window.electron.auth.login(email, password)
      set({ currentUser: user })
    } finally {
      set({ authLoading: false })
    }
  },

  logout: async () => {
    await window.electron.auth.logout()
    set({ currentUser: null })
  },

  loadAllProfiles: async () => {
    try {
      const store = await window.electron.getAllProfiles()
      const activeProfile =
        store.profiles.find((p) => p.id === store.activeProfileId) ?? store.profiles[0]
      if (!activeProfile) {
        set({ profileLoading: false })
        return
      }
      set({
        profiles: store.profiles,
        activeProfileId: store.activeProfileId,
        userProfile: activeProfile,
        environmentProfile: userProfileToEnvironmentProfile(activeProfile),
        profileLoading: false
      })
    } catch {
      set({ profileLoading: false })
    }
  },

  loadProfile: async () => {
    await get().loadAllProfiles()
  },

  setProfile: async (profile: ProfileInput) => {
    const { activeProfileId, profiles } = get()
    const existing = profiles.find((p) => p.id === activeProfileId)
    if (!existing) return

    const now = new Date().toISOString()
    const updated: UserProfile = {
      id: existing.id,
      name: profile.name,
      toolIds: profile.toolIds,
      createdAt: existing.createdAt ?? now,
      updatedAt: now
    }

    set((state) => ({
      userProfile: updated,
      environmentProfile: userProfileToEnvironmentProfile(updated),
      profiles: state.profiles.map((p) => (p.id === activeProfileId ? updated : p))
    }))

    await window.electron.saveUserProfile(updated)
  },

  createProfile: async (name: string, toolIds: string[], startEmpty?: boolean) => {
    const newProfile = await window.electron.createProfile(name, toolIds, startEmpty)
    if (!newProfile) return null
    await get().loadAllProfiles()
    return newProfile
  },

  deleteProfile: async (id: string) => {
    await window.electron.deleteProfile(id)
    await get().loadAllProfiles()
  },

  setActiveProfile: async (id: string) => {
    await window.electron.setActiveProfile(id)
    await get().loadAllProfiles()
  },

  updateProfileTools: async (profileId: string, toolIds: string[]) => {
    const now = new Date().toISOString()
    set((state) => {
      const profiles = state.profiles.map((p) =>
        p.id === profileId ? { ...p, toolIds, updatedAt: now } : p
      )
      const isActive = profileId === state.activeProfileId
      const updatedActive = isActive ? profiles.find((p) => p.id === profileId) : undefined
      return {
        profiles,
        ...(updatedActive
          ? {
              userProfile: updatedActive,
              environmentProfile: userProfileToEnvironmentProfile(updatedActive)
            }
          : {})
      }
    })
    await window.electron.updateProfileTools(profileId, toolIds)
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
      const message =
        error instanceof Error ? error.message : 'Não foi possível escanear o ambiente.'
      set({ scanError: message, scanLoading: false })
    }
  },

  clearScanData: async () => {
    await window.electron.clearScanData()
    set({ scanResult: null, lastScanAt: null })
  }
}))
