import { toolsCatalog } from '../../../shared/tools/catalog'
import type { DevTool } from '../types/tools'

const initialInstalledVersions: Partial<Record<DevTool['id'], string>> = {
  git: '2.52.0',
  node: '24.14.1',
  vscode: '1.115.0'
}

export const mockTools: DevTool[] = toolsCatalog.map((tool) => {
  const version = initialInstalledVersions[tool.id]

  return {
    id: tool.id,
    name: tool.name,
    category: tool.category,
    description: tool.description,
    status: version ? 'healthy' : 'missing',
    version,
    minimumVersion: tool.minimumVersion,
    recommendedVersion: tool.recommendedVersion
  }
})
