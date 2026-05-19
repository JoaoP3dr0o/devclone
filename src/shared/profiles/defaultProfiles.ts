import type { EnvironmentProfile } from './profile.types'

export const defaultProfiles: EnvironmentProfile[] = [
  {
    id: 'laravel-react',
    name: 'Laravel + React',
    description: 'Stack fullstack para aplicações Laravel com front-end React.',
    tools: [
      { toolId: 'git', required: true },
      { toolId: 'node', required: true, minimumVersion: '20.0.0' },
      { toolId: 'npm', required: true },
      { toolId: 'php', required: true, minimumVersion: '8.2.0' },
      { toolId: 'composer', required: true },
      { toolId: 'laravel', required: true },
      { toolId: 'docker', required: false },
      { toolId: 'mysql', required: true },
      { toolId: 'vscode', required: false }
    ]
  }
]

export const activeDefaultProfile = defaultProfiles[0]
