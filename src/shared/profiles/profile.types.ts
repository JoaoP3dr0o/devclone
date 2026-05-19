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
