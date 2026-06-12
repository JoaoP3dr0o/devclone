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
  loginWithGoogle: () => Promise<void>
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

function isUnauthorized(error: unknown): boolean {
  return error instanceof Error && error.message === 'UNAUTHORIZED'
}

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
    const { user } = await window.electron.auth.register(name, email, password)
    set({ currentUser: user })
  },

  login: async (email: string, password: string) => {
    const { user } = await window.electron.auth.login(email, password)
    set({ currentUser: user })
  },

  loginWithGoogle: async () => {
    const { user } = await window.electron.auth.googleStart()
    set({ currentUser: user })
  },

  logout: async () => {
    await window.electron.auth.logout()
    set({
      currentUser: null,
      profiles: [],
      activeProfileId: '',
      userProfile: EMPTY_PROFILE,
      environmentProfile: userProfileToEnvironmentProfile(EMPTY_PROFILE),
    })
  },

  loadAllProfiles: async () => {
    try {
      const store = await window.electron.cloudProfile.fetchAll()
      const activeProfile =
        store.profiles.find((p) => p.id === store.activeProfileId) ?? store.profiles[0]
      if (!activeProfile) {
        set({ profiles: store.profiles, activeProfileId: '', profileLoading: false })
        return
      }
      set({
        profiles: store.profiles,
        activeProfileId: store.activeProfileId,
        userProfile: activeProfile,
        environmentProfile: userProfileToEnvironmentProfile(activeProfile),
        profileLoading: false,
      })
    } catch (error) {
      if (isUnauthorized(error)) {
        set({ currentUser: null, profiles: [], activeProfileId: '' })
      }
      set({ profileLoading: false })
    }
  },

  loadProfile: async () => {
    await get().loadAllProfiles()
  },

  setProfile: async (profile: ProfileInput) => {
    const { activeProfileId } = get()
    if (!activeProfileId) return

    try {
      await window.electron.cloudProfile.update(activeProfileId, {
        name: profile.name,
        toolIds: profile.toolIds,
      })
      await get().loadAllProfiles()
    } catch (error) {
      if (isUnauthorized(error)) {
        set({ currentUser: null })
      }
      throw error
    }
  },

  createProfile: async (name: string, toolIds: string[]) => {
    try {
      const newProfile = await window.electron.cloudProfile.create(name, toolIds)
      if (!newProfile) return null
      await get().loadAllProfiles()
      return newProfile
    } catch (error) {
      if (isUnauthorized(error)) {
        set({ currentUser: null })
      }
      return null
    }
  },

  deleteProfile: async (id: string) => {
    try {
      await window.electron.cloudProfile.delete(id)
      await get().loadAllProfiles()
    } catch (error) {
      if (isUnauthorized(error)) {
        set({ currentUser: null })
      }
    }
  },

  setActiveProfile: async (id: string) => {
    console.log('[DevClone] store:setActiveProfile — id:', id)
    try {
      await window.electron.cloudProfile.activate(id)
    } catch (error) {
      console.error('[DevClone] store:setActiveProfile — activate error:', error)
      if (isUnauthorized(error)) {
        set({ currentUser: null })
        return
      }
      // Non-UNAUTHORIZED: reload to show current server state
    }
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
              environmentProfile: userProfileToEnvironmentProfile(updatedActive),
            }
          : {}),
      }
    })

    try {
      await window.electron.cloudProfile.update(profileId, { toolIds })
    } catch (error) {
      if (isUnauthorized(error)) {
        set({ currentUser: null })
        return
      }
      await get().loadAllProfiles()
    }
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
  },
}))
