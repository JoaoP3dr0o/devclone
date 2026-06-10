import type { ToolScanResult } from '../scan.types'

export interface DevCloneExport {
  devclone_version: string
  exported_at: string
  profile: {
    name: string
    toolIds: string[]
  }
  scan: {
    lastScanAt: string | null
    tools: ToolScanResult[]
  } | null
}
