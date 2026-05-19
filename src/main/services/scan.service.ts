import type { EnvironmentScanResult, ToolScanResult } from '../../shared/scan.types'
import { toolsCatalog, type ToolCatalogItem } from '../../shared/tools/catalog'

import { executeCommand } from './command.service'

function extractVersion(output: string | null, versionRegex: string): string | null {
  if (!output) return null

  const version = output.match(new RegExp(versionRegex))
  return version?.[0] ?? null
}

async function scanTool(tool: ToolCatalogItem): Promise<ToolScanResult> {
  const output = await executeCommand(tool.command)
  const version = extractVersion(output, tool.versionRegex)
  const installed = version !== null

  return {
    id: tool.id,
    name: tool.name,
    installed,
    version,
    category: tool.category,
    status: installed ? 'healthy' : 'missing'
  }
}

export async function scanEnvironment(): Promise<EnvironmentScanResult> {
  const tools = await Promise.all(toolsCatalog.map((tool) => scanTool(tool)))

  return {
    tools
  }
}
