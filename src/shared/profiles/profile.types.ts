import type { ToolCatalogItem } from '../tools/catalog'

export type EnvironmentProfileTool = {
  toolId: ToolCatalogItem['id']
  required: boolean
  minimumVersion?: string
}

export type EnvironmentProfile = {
  id: string
  name: string
  description: string
  tools: EnvironmentProfileTool[]
}

export type UserProfile = {
  id: 'active-profile'
  name: string
  toolIds: ToolCatalogItem['id'][]
}

export type SavedUserProfile = {
  version: 1
  profile: UserProfile
}
