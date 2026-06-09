import type { EnvironmentScanResult, MissingDep, ToolScanResult } from '../../shared/scan.types'
import type { PlatformId } from '../../shared/platform/platform.types'
import { toolsCatalog, type ToolCatalogItem } from '../../shared/tools/catalog'
import { dependencyMap } from '../../shared/tools/dependency-map'
import { isVersionLowerThan } from '../../shared/utils/version'

import { executeCommand } from './command.service'
import { getCurrentPlatform } from './platform.service'
import { runChecker } from './preflight.service'

// On Windows, Electron inherits PATH from the moment it launched. Tools installed
// later won't be found until we refresh from the registry.
// We force UTF-8 output from PowerShell ([Console]::OutputEncoding) so that
// non-ASCII characters in user home paths (e.g. ã, é) survive the exec() pipe
// without getting corrupted by the system OEM code page.
async function refreshWindowsPath(): Promise<void> {
  if (process.platform !== 'win32') return

  const freshPath = await executeCommand(
    "powershell -NoProfile -Command \"[Console]::OutputEncoding=[System.Text.Encoding]::UTF8;" +
    "[System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' +" +
    "[System.Environment]::GetEnvironmentVariable('Path','User')\""
  )
  if (freshPath) {
    process.env['PATH'] = freshPath
  }
}

function extractVersion(output: string | null, versionRegex: string): string | null {
  if (!output) return null

  const version = output.match(new RegExp(versionRegex))
  return version?.[0] ?? null
}

function getToolStatus(tool: ToolCatalogItem, version: string | null): ToolScanResult['status'] {
  if (!version) return 'missing'

  if (tool.minimumVersion && isVersionLowerThan(version, tool.minimumVersion)) {
    return tool.outdatedStatus ?? 'outdated'
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

async function checkToolDependencies(toolId: string, platformId: PlatformId): Promise<MissingDep[]> {
  const deps = dependencyMap[toolId]?.[platformId] ?? []
  if (deps.length === 0) return []

  const results = await Promise.all(
    deps.map(async (dep) => {
      try {
        const status = await runChecker(dep.id, platformId)
        return status !== 'ok' ? dep : null
      } catch {
        console.warn(`[scan] Dependency check for ${dep.id} failed, treating as ok`)
        return null
      }
    })
  )

  return results
    .filter((dep): dep is NonNullable<typeof dep> => dep !== null)
    .map(({ id, label, autoFixable, userMessage }) => ({ id, label, autoFixable, userMessage }))
}

async function scanTool(tool: ToolCatalogItem, platformId: PlatformId): Promise<ToolScanResult> {
  if (!isToolSupportedOnPlatform(tool, platformId)) {
    return createUnsupportedToolResult(tool)
  }

  const output = await executeCommand(tool.command)
  const version = extractVersion(output, tool.versionRegex)
  const installed = version !== null
  const status = getToolStatus(tool, version)

  const result: ToolScanResult = {
    id: tool.id,
    name: tool.name,
    installed,
    version,
    category: tool.category,
    status
  }

  if (status === 'healthy') {
    const deps = await checkToolDependencies(tool.id, platformId)
    if (deps.length > 0) {
      return { ...result, status: 'degraded', missingDeps: deps }
    }
  }

  return result
}

export async function scanEnvironment(): Promise<EnvironmentScanResult> {
  await refreshWindowsPath()
  const currentPlatform = getCurrentPlatform()
  const tools = await Promise.all(
    toolsCatalog.map((tool) => scanTool(tool, currentPlatform.id))
  )

  return {
    tools
  }
}
