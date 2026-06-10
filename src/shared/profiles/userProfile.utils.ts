import { toolsCatalog } from '../tools/catalog'
import { defaultProfiles } from './defaultProfiles'
import type { EnvironmentProfile, ProfilesStore, UserProfile } from './profile.types'

export function createProfile(name: string, toolIds: string[]): UserProfile {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name,
    toolIds,
    createdAt: now,
    updatedAt: now
  }
}

export function createDefaultProfilesStore(): ProfilesStore {
  const laravelReact = defaultProfiles.find((p) => p.id === 'laravel-react')
  const defaultToolIds = laravelReact ? laravelReact.tools.map((t) => t.toolId) : []
  const profile = createProfile('Meu perfil', defaultToolIds)
  return {
    version: 1,
    activeProfileId: profile.id,
    profiles: [profile]
  }
}

// Kept for backward compat: ProfilePage uses .name as fallback,
// SettingsPage uses the full object for reset. setProfile() in the store
// ignores the incoming id and uses activeProfileId from state instead.
export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'default',
  name: 'Meu perfil',
  toolIds: ['git', 'node', 'npm', 'php', 'composer', 'laravel', 'docker', 'mysql', 'vscode']
}

export function userProfileToEnvironmentProfile(profile: UserProfile): EnvironmentProfile {
  return {
    id: profile.id,
    name: profile.name,
    description: '',
    tools: profile.toolIds.map((toolId) => {
      const catalogEntry = toolsCatalog.find((t) => t.id === toolId)
      return {
        toolId,
        required: true,
        minimumVersion: catalogEntry?.minimumVersion
      }
    })
  }
}
