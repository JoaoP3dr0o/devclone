import { ipcMain } from 'electron'

import type { UserProfile } from '../../shared/profiles/profile.types'
import { createProfile } from '../../shared/profiles/userProfile.utils'
import {
  getProfilesStore,
  loadLastScan,
  loadUserProfile,
  saveProfilesStore,
  saveUserProfile
} from '../services/storage.service'

function isValidUserProfile(value: unknown): value is UserProfile {
  if (!value || typeof value !== 'object') return false
  const p = value as Record<string, unknown>
  return (
    typeof p['id'] === 'string' &&
    p['id'].length > 0 &&
    typeof p['name'] === 'string' &&
    Array.isArray(p['toolIds'])
  )
}

export function registerProfileIpc(): void {
  // Backward-compat: returns active profile
  ipcMain.handle('profile:get', () => loadUserProfile())

  // Backward-compat: saves profile by id match
  ipcMain.handle('profile:save', async (_event, profile: unknown) => {
    if (!isValidUserProfile(profile)) return
    await saveUserProfile(profile)
  })

  ipcMain.handle('profile:get-all', () => getProfilesStore())

  ipcMain.handle('profile:create', async (_event, name: unknown, toolIds: unknown) => {
    if (typeof name !== 'string' || !Array.isArray(toolIds)) return null
    let validToolIds = (toolIds as unknown[]).filter((id): id is string => typeof id === 'string')

    if (validToolIds.length === 0) {
      const lastScan = await loadLastScan()
      if (lastScan) {
        validToolIds = lastScan.tools.tools
          .filter((t) => t.status === 'healthy' || t.status === 'degraded')
          .map((t) => t.id)
        console.log('[DevClone] profile:create — toolIds empty, using last scan fallback:', validToolIds.length, 'tools')
      }
    }

    const newProfile = createProfile(name, validToolIds)
    const store = await getProfilesStore()
    await saveProfilesStore({ ...store, profiles: [...store.profiles, newProfile] })
    return newProfile
  })

  ipcMain.handle('profile:delete', async (_event, id: unknown) => {
    if (typeof id !== 'string') return
    const store = await getProfilesStore()
    const remaining = store.profiles.filter((p) => p.id !== id)
    const activeProfileId =
      store.activeProfileId === id ? (remaining[0]?.id ?? '') : store.activeProfileId
    await saveProfilesStore({ ...store, profiles: remaining, activeProfileId })
  })

  ipcMain.handle('profile:set-active', async (_event, id: unknown) => {
    if (typeof id !== 'string') return
    const store = await getProfilesStore()
    if (!store.profiles.some((p) => p.id === id)) return
    await saveProfilesStore({ ...store, activeProfileId: id })
  })

  ipcMain.handle('profile:update-tools', async (_event, profileId: unknown, toolIds: unknown) => {
    if (typeof profileId !== 'string' || !Array.isArray(toolIds)) return
    const validToolIds = (toolIds as unknown[]).filter((id): id is string => typeof id === 'string')
    const store = await getProfilesStore()
    const now = new Date().toISOString()
    const profiles = store.profiles.map((p) =>
      p.id === profileId ? { ...p, toolIds: validToolIds, updatedAt: now } : p
    )
    await saveProfilesStore({ ...store, profiles })
  })
}
