import type { EnvironmentScanResult, ToolScanResult } from '../../shared/scan.types'

import { executeCommand } from './command.service'

function extractVersion(output: string | null): string | null {
  if (!output) return null

  const version = output.match(/\d+\.\d+\.\d+/)
  return version?.[0] ?? null
}

export async function scanGit(): Promise<ToolScanResult> {
  const output = await executeCommand('git --version')
  const version = extractVersion(output)

  return {
    name: 'Git',
    installed: version !== null,
    version
  }
}

export async function scanNode(): Promise<ToolScanResult> {
  const output = await executeCommand('node -v')
  const version = extractVersion(output)

  return {
    name: 'Node.js',
    installed: version !== null,
    version
  }
}

export async function scanVSCode(): Promise<ToolScanResult> {
  const output = await executeCommand('code --version')
  const version = extractVersion(output)

  return {
    name: 'VS Code',
    installed: version !== null,
    version
  }
}

export async function scanEnvironment(): Promise<EnvironmentScanResult> {
  const [git, node, vscode] = await Promise.all([scanGit(), scanNode(), scanVSCode()])

  return {
    git,
    node,
    vscode
  }
}
