import type { EnvironmentProfile } from '../profiles/profile.types'
import type { EnvironmentScanResult, ToolScanResult } from '../scan.types'
import { getToolInsightMessage } from '../tools/insights'

import type { EnvironmentRecommendation, RecommendationSeverity } from './recommendation.types'

const missingSeverityByToolId: Partial<Record<ToolScanResult['id'], RecommendationSeverity>> = {
  php: 'high',
  composer: 'high',
  node: 'high',
  docker: 'medium',
  mysql: 'medium',
  postgres: 'medium',
  postman: 'low',
  pnpm: 'low',
  bun: 'low'
}

function getProfileToolIds(profile: EnvironmentProfile): Set<ToolScanResult['id']> {
  return new Set(profile.tools.map((tool) => tool.toolId))
}

function createMissingRecommendation(tool: ToolScanResult): EnvironmentRecommendation | null {
  const severity = missingSeverityByToolId[tool.id]

  if (!severity) return null

  return {
    severity,
    title: `${tool.name} ausente`,
    message: getToolInsightMessage(tool.id, 'missing'),
    toolId: tool.id
  }
}

function createOutdatedRecommendation(tool: ToolScanResult): EnvironmentRecommendation | null {
  if (tool.id !== 'php' && tool.id !== 'node') return null

  return {
    severity: 'high',
    title: `${tool.name} desatualizado`,
    message: getToolInsightMessage(tool.id, 'outdated'),
    toolId: tool.id
  }
}

export function generateEnvironmentRecommendations(
  scanResult: EnvironmentScanResult | null,
  profile: EnvironmentProfile
): EnvironmentRecommendation[] {
  if (!scanResult) {
    return [
      {
        severity: 'low',
        title: 'Escaneie o ambiente',
        message: `Execute o scan para gerar recomendações para o profile ${profile.name}.`
      }
    ]
  }

  const recommendations: EnvironmentRecommendation[] = []
  const profileToolIds = getProfileToolIds(profile)

  for (const tool of scanResult.tools) {
    const isProfileTool = profileToolIds.has(tool.id)
    const missingRecommendation = tool.status === 'missing' ? createMissingRecommendation(tool) : null
    const outdatedRecommendation =
      tool.status === 'outdated' ? createOutdatedRecommendation(tool) : null

    if (missingRecommendation && (isProfileTool || missingRecommendation.severity === 'low')) {
      recommendations.push(missingRecommendation)
    }

    if (outdatedRecommendation && isProfileTool) {
      recommendations.push(outdatedRecommendation)
    }
  }

  return recommendations
}
