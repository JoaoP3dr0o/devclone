import { dependencyMap } from '../../shared/tools/dependency-map'
import type { CheckStatus, PreflightCheck, PreflightResult } from '../../shared/tools/preflight.types'
import { executeCommand } from './command.service'

async function checkWsl2(): Promise<CheckStatus> {
  const result = await executeCommand('wsl --status')
  return result !== null ? 'ok' : 'missing'
}

async function checkVirtualization(platform: string): Promise<CheckStatus> {
  if (platform === 'windows') {
    const result = await executeCommand('wmic cpu get VirtualizationFirmwareEnabled')
    if (result === null) return 'manual-required'
    return result.toUpperCase().includes('TRUE') ? 'ok' : 'manual-required'
  }

  if (platform === 'linux') {
    const result = await executeCommand('grep -E "vmx|svm" /proc/cpuinfo')
    return result !== null && result.trim().length > 0 ? 'ok' : 'manual-required'
  }

  return 'ok'
}

async function checkCurl(): Promise<CheckStatus> {
  const result = await executeCommand('curl --version')
  return result !== null ? 'ok' : 'missing'
}

async function checkPhp(): Promise<CheckStatus> {
  const result = await executeCommand('php --version')
  return result !== null ? 'ok' : 'missing'
}

async function checkComposer(): Promise<CheckStatus> {
  const result = await executeCommand('composer --version')
  return result !== null ? 'ok' : 'missing'
}

async function runChecker(checkId: string, platform: string): Promise<CheckStatus> {
  switch (checkId) {
    case 'wsl2':
      return checkWsl2()
    case 'virtualization':
      return checkVirtualization(platform)
    case 'curl':
      return checkCurl()
    case 'php':
      return checkPhp()
    case 'composer':
      return checkComposer()
    default:
      return 'ok'
  }
}

export async function runPreflight(toolId: string, platform: string): Promise<PreflightResult> {
  const deps = dependencyMap[toolId]?.[platform] ?? []

  if (deps.length === 0) {
    return { canProceed: true, checks: [], requiresReboot: false }
  }

  const checks: PreflightCheck[] = []

  for (const dep of deps) {
    const status = await runChecker(dep.id, platform)
    checks.push({
      id: dep.id,
      label: dep.label,
      status,
      autoFixable: dep.autoFixable,
      rebootRequired: dep.rebootRequired,
      userMessage: dep.userMessage
    })
  }

  const canProceed = checks.every((c) => c.status === 'ok')
  const requiresReboot = checks.some((c) => c.rebootRequired && c.status === 'missing')

  return { canProceed, checks, requiresReboot }
}
