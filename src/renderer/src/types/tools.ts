import type { ToolCatalogItem } from '@shared/tools/catalog'
import type { ToolScanStatus } from '@shared/scan.types'

export type ToolStatus = ToolScanStatus | 'pending'

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
