import type { ToolCatalogItem } from '@shared/tools/catalog'

export type ToolStatus = 'healthy' | 'warning' | 'outdated' | 'missing' | 'pending'

export type DevToolId = ToolCatalogItem['id']

export type DevTool = {
  id: DevToolId
  name: string
  category: string
  description: string
  status: ToolStatus
  version?: string
  minimumVersion?: string
  recommendedVersion?: string
}
