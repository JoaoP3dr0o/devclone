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
  },
  {
    id: 'node-fullstack',
    name: 'Node Full Stack',
    description: 'Stack JavaScript/TypeScript com Node.js, runtimes modernos e banco de dados.',
    tools: [
      { toolId: 'git', required: true },
      { toolId: 'node', required: true, minimumVersion: '20.0.0' },
      { toolId: 'npm', required: true },
      { toolId: 'pnpm', required: false },
      { toolId: 'bun', required: false },
      { toolId: 'docker', required: true },
      { toolId: 'postgres', required: true },
      { toolId: 'vscode', required: false }
    ]
  },
  {
    id: 'python-data',
    name: 'Python / Data Science',
    description: 'Ambiente para análise de dados e machine learning com suporte a containers.',
    tools: [
      { toolId: 'git', required: true },
      { toolId: 'docker', required: true },
      { toolId: 'postgres', required: true },
      { toolId: 'mysql', required: false },
      { toolId: 'vscode', required: true }
    ]
  },
  {
    id: 'devops-infra',
    name: 'DevOps / Infra',
    description: 'Ferramentas essenciais para pipelines de CI/CD, containers e bancos de dados.',
    tools: [
      { toolId: 'git', required: true },
      { toolId: 'docker', required: true },
      { toolId: 'postgres', required: false },
      { toolId: 'mysql', required: false },
      { toolId: 'node', required: false },
      { toolId: 'vscode', required: false }
    ]
  }
]

export const activeDefaultProfile = defaultProfiles[0]
