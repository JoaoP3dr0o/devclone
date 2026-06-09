import type { ToolCatalogItem } from '@shared/tools/catalog'
import type { MissingDep, ToolScanStatus } from '@shared/scan.types'

export type { MissingDep }

export type ToolStatus = ToolScanStatus | 'pending' | 'unverified'

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
  missingDeps?: MissingDep[]
}
