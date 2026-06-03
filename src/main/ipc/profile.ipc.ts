import { ipcMain } from 'electron'

import type { UserProfile } from '../../shared/profiles/profile.types'
import { loadUserProfile, saveUserProfile } from '../services/storage.service'

function isValidUserProfile(value: unknown): value is UserProfile {
  if (!value || typeof value !== 'object') return false
  const p = value as Record<string, unknown>
  return (
    p['id'] === 'active-profile' &&
    typeof p['name'] === 'string' &&
    Array.isArray(p['toolIds'])
  )
}

export function registerProfileIpc(): void {
  ipcMain.handle('profile:get', () => loadUserProfile())

  ipcMain.handle('profile:save', async (_event, profile: unknown) => {
    if (!isValidUserProfile(profile)) return
    await saveUserProfile(profile)
  })
}
