export type ToolCatalogItem = {
  id:
    | 'git'
    | 'node'
    | 'vscode'
    | 'npm'
    | 'pnpm'
    | 'bun'
    | 'php'
    | 'composer'
    | 'laravel'
    | 'docker'
    | 'mysql'
    | 'postgres'
    | 'postman'
  name: string
  category: string
  description: string
  command: string
  versionRegex: string
  minimumVersion?: string
  recommendedVersion?: string
}

export const toolsCatalog: ToolCatalogItem[] = [
  {
    id: 'git',
    name: 'Git',
    category: 'Version Control',
    description: 'Sistema de controle de versão essencial para desenvolvimento.',
    command: 'git --version',
    versionRegex: '\\d+\\.\\d+\\.\\d+'
  },
  {
    id: 'node',
    name: 'Node.js',
    category: 'Runtime',
    description: 'Runtime JavaScript para React, Vite e ferramentas front-end.',
    command: 'node -v',
    versionRegex: '\\d+\\.\\d+\\.\\d+',
    minimumVersion: '20.0.0'
  },
  {
    id: 'vscode',
    name: 'VS Code',
    category: 'Editor',
    description: 'Editor principal para desenvolvimento fullstack.',
    command: 'code --version',
    versionRegex: '\\d+\\.\\d+\\.\\d+'
  },
  {
    id: 'npm',
    name: 'npm',
    category: 'Package Manager',
    description: 'Gerenciador de pacotes padrão do ecossistema Node.js.',
    command: 'npm -v',
    versionRegex: '\\d+\\.\\d+\\.\\d+'
  },
  {
    id: 'pnpm',
    name: 'pnpm',
    category: 'Package Manager',
    description: 'Gerenciador de pacotes rápido para monorepos e projetos JavaScript.',
    command: 'pnpm -v',
    versionRegex: '\\d+\\.\\d+\\.\\d+'
  },
  {
    id: 'bun',
    name: 'Bun',
    category: 'Runtime',
    description: 'Runtime e toolkit JavaScript alternativo ao Node.js.',
    command: 'bun -v',
    versionRegex: '\\d+\\.\\d+\\.\\d+'
  },
  {
    id: 'php',
    name: 'PHP',
    category: 'Runtime',
    description: 'Linguagem base para aplicações Laravel.',
    command: 'php -v',
    versionRegex: '\\d+\\.\\d+\\.\\d+',
    minimumVersion: '8.2.0'
  },
  {
    id: 'composer',
    name: 'Composer',
    category: 'Package Manager',
    description: 'Gerenciador de dependências para projetos PHP.',
    command: 'composer --version',
    versionRegex: '\\d+\\.\\d+\\.\\d+'
  },
  {
    id: 'laravel',
    name: 'Laravel Installer',
    category: 'Framework',
    description: 'CLI para criação e gerenciamento de projetos Laravel.',
    command: 'laravel --version',
    versionRegex: '\\d+\\.\\d+\\.\\d+'
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'DevOps',
    description: 'Ambiente de containers para aplicações e bancos locais.',
    command: 'docker --version',
    versionRegex: '\\d+\\.\\d+\\.\\d+',
    minimumVersion: '20.10.0',
    recommendedVersion: '24.0.0'
  },
  {
    id: 'mysql',
    name: 'MySQL',
    category: 'Database',
    description: 'Banco de dados relacional muito usado com Laravel.',
    command: 'mysql --version',
    versionRegex: '\\d+\\.\\d+\\.\\d+'
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    category: 'Database',
    description: 'Banco de dados relacional usado em aplicações web modernas.',
    command: 'psql --version',
    versionRegex: '\\d+\\.\\d+'
  },
  {
    id: 'postman',
    name: 'Postman',
    category: 'API Client',
    description: 'Ferramenta para testar APIs durante o desenvolvimento.',
    command: 'postman --version',
    versionRegex: '\\d+\\.\\d+\\.\\d+'
  }
]
