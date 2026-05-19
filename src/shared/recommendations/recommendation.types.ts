import type { ToolCatalogItem } from '../tools/catalog'

export type RecommendationSeverity = 'high' | 'medium' | 'low'

export type EnvironmentRecommendation = {
  severity: RecommendationSeverity
  title: string
  message: string
  toolId?: ToolCatalogItem['id']
}
