import { ipcMain } from 'electron'

import * as profileService from '../services/profile.service'

export function registerCloudProfileIpc(): void {
  ipcMain.handle('cloud-profile:fetch-all', () => profileService.fetchProfiles())

  ipcMain.handle('cloud-profile:create', async (_event, name: unknown, toolIds: unknown) => {
    if (typeof name !== 'string' || !Array.isArray(toolIds)) return null
    const validToolIds = (toolIds as unknown[]).filter((id): id is string => typeof id === 'string')
    return profileService.createProfile(name, validToolIds)
  })

  ipcMain.handle('cloud-profile:update', async (_event, id: unknown, data: unknown) => {
    if (typeof id !== 'string' || !data || typeof data !== 'object') return null
    const { name, toolIds } = data as Record<string, unknown>
    const update: { name?: string; toolIds?: string[] } = {}
    if (typeof name === 'string') update.name = name
    if (Array.isArray(toolIds)) {
      update.toolIds = (toolIds as unknown[]).filter((t): t is string => typeof t === 'string')
    }
    return profileService.updateProfile(id, update)
  })

  ipcMain.handle('cloud-profile:delete', async (_event, id: unknown) => {
    if (typeof id !== 'string') return
    await profileService.deleteProfile(id)
  })

  ipcMain.handle('cloud-profile:activate', async (_event, id: unknown) => {
    if (typeof id !== 'string') return
    await profileService.activateProfile(id)
  })
}
