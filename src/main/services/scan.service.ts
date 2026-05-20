import type { EnvironmentScanResult, ToolScanResult } from '../../shared/scan.types'
import type { PlatformId } from '../../shared/platform/platform.types'
import { toolsCatalog, type ToolCatalogItem } from '../../shared/tools/catalog'
import { isVersionLowerThan } from '../../shared/utils/version'

import { executeCommand } from './command.service'
import { getCurrentPlatform } from './platform.service'

function extractVersion(output: string | null, versionRegex: string): string | null {
  if (!output) return null

  const version = output.match(new RegExp(versionRegex))
  return version?.[0] ?? null
}

function getToolStatus(tool: ToolCatalogItem, version: string | null): ToolScanResult['status'] {
  if (!version) return 'missing'

  if (tool.minimumVersion && isVersionLowerThan(version, tool.minimumVersion)) {
    return tool.id === 'docker' ? 'warning' : 'outdated'
  }

  return 'healthy'
}

function createUnsupportedToolResult(tool: ToolCatalogItem): ToolScanResult {
  return {
    id: tool.id,
    name: tool.name,
    installed: false,
    version: null,
    category: tool.category,
    status: 'unsupported'
  }
}

function isToolSupportedOnPlatform(tool: ToolCatalogItem, platformId: PlatformId): boolean {
  return tool.supportedPlatforms.includes(platformId)
}

async function scanTool(tool: ToolCatalogItem, platformId: PlatformId): Promise<ToolScanResult> {
  if (!isToolSupportedOnPlatform(tool, platformId)) {
    return createUnsupportedToolResult(tool)
  }

  const output = await executeCommand(tool.command)
  const version = extractVersion(output, tool.versionRegex)
  const installed = version !== null
  const status = getToolStatus(tool, version)

  return {
    id: tool.id,
    name: tool.name,
    installed,
    version,
    category: tool.category,
    status
  }
}

export async function scanEnvironment(): Promise<EnvironmentScanResult> {
  const currentPlatform = getCurrentPlatform()
  const tools = await Promise.all(
    toolsCatalog.map((tool) => scanTool(tool, currentPlatform.id))
  )

  return {
    tools
  }
}
