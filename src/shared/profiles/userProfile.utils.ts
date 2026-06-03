import { toolsCatalog } from '../tools/catalog'
import type { EnvironmentProfile, UserProfile } from './profile.types'

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'active-profile',
  name: 'Laravel + React',
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
