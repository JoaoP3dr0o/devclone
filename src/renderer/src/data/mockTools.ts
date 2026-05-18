import type { DevTool } from '../types/tools'

export const mockTools: DevTool[] = [
  {
    id: 'git',
    name: 'Git',
    category: 'Version Control',
    description: 'Sistema de controle de versão essencial para desenvolvimento.',
    status: 'installed',
    version: '2.52.0'
  },
  {
    id: 'node',
    name: 'Node.js',
    category: 'Runtime',
    description: 'Runtime JavaScript para React, Vite e ferramentas front-end.',
    status: 'installed',
    version: '24.14.1'
  },
  {
    id: 'php',
    name: 'PHP',
    category: 'Runtime',
    description: 'Linguagem base para aplicações Laravel.',
    status: 'missing'
  },
  {
    id: 'composer',
    name: 'Composer',
    category: 'Package Manager',
    description: 'Gerenciador de dependências para projetos PHP.',
    status: 'missing'
  },
  {
    id: 'laravel',
    name: 'Laravel Installer',
    category: 'Framework',
    description: 'CLI para criação e gerenciamento de projetos Laravel.',
    status: 'missing'
  },
  {
    id: 'vscode',
    name: 'VS Code',
    category: 'Editor',
    description: 'Editor principal para desenvolvimento fullstack.',
    status: 'installed',
    version: '1.115.0'
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'DevOps',
    description: 'Ambiente de containers para aplicações e bancos locais.',
    status: 'missing'
  },
  {
    id: 'mysql',
    name: 'MySQL',
    category: 'Database',
    description: 'Banco de dados relacional muito usado com Laravel.',
    status: 'missing'
  },
  {
    id: 'postman',
    name: 'Postman',
    category: 'API Client',
    description: 'Ferramenta para testar APIs durante o desenvolvimento.',
    status: 'missing'
  }
]
