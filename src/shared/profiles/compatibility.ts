import type { EnvironmentScanResult, ToolScanResult } from '../scan.types'
import { isVersionLowerThan } from '../utils/version'

import type { EnvironmentProfile, EnvironmentProfileTool } from './profile.types'

export type ProfileCompatibilityItem = {
  profileTool: EnvironmentProfileTool
  scanTool: ToolScanResult | null
}

export type ProfileCompatibilityResult = {
  profile: EnvironmentProfile
  score: number
  healthy: ProfileCompatibilityItem[]
  outdated: ProfileCompatibilityItem[]
  missing: ProfileCompatibilityItem[]
}

function findScannedTool(
  scanResult: EnvironmentScanResult,
  profileTool: EnvironmentProfileTool
): ToolScanResult | null {
  return scanResult.tools.find((tool) => tool.id === profileTool.toolId) ?? null
}

function isProfileToolOutdated(
  profileTool: EnvironmentProfileTool,
  scanTool: ToolScanResult
): boolean {
  if (scanTool.status === 'outdated') return true
  if (!profileTool.minimumVersion || !scanTool.version) return false

  return isVersionLowerThan(scanTool.version, profileTool.minimumVersion)
}

export function calculateProfileCompatibility(
  scanResult: EnvironmentScanResult | null,
  profile: EnvironmentProfile
): ProfileCompatibilityResult {
  const healthy: ProfileCompatibilityItem[] = []
  const outdated: ProfileCompatibilityItem[] = []
  const missing: ProfileCompatibilityItem[] = []

  if (!scanResult) {
    const requiredTools = profile.tools.filter((tool) => tool.required)

    return {
      profile,
      score: 0,
      healthy,
      outdated,
      missing: requiredTools.map((profileTool) => ({ profileTool, scanTool: null }))
    }
  }

  const requiredTools = profile.tools.filter((tool) => tool.required)

  for (const profileTool of requiredTools) {
    const scanTool = findScannedTool(scanResult, profileTool)
    const item = { profileTool, scanTool }

    if (!scanTool || !scanTool.installed || scanTool.status === 'missing') {
      missing.push(item)
      continue
    }

    if (isProfileToolOutdated(profileTool, scanTool)) {
      outdated.push(item)
      continue
    }

    healthy.push(item)
  }

  const score =
    requiredTools.length === 0 ? 100 : Math.round((healthy.length / requiredTools.length) * 100)

  return {
    profile,
    score,
    healthy,
    outdated,
    missing
  }
}
