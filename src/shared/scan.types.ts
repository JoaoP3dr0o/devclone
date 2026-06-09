import type { ToolCatalogItem } from './tools/catalog'

export type ToolScanStatus = 'healthy' | 'warning' | 'outdated' | 'missing' | 'unsupported' | 'degraded'

export interface MissingDep {
  id: string
  label: string
  autoFixable: boolean
  userMessage: string
}

export type ToolScanResult = {
  id: ToolCatalogItem['id']
  name: string
  installed: boolean
  version: string | null
  category: string
  status: ToolScanStatus
  missingDeps?: MissingDep[]
}

export type EnvironmentScanResult = {
  tools: ToolScanResult[]
}

export type LastScanStorage = {
  version: 1
  lastScanAt: string
  tools: EnvironmentScanResult
}
