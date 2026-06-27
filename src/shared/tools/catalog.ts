import type { PlatformId } from '../platform/platform.types'
import type { InstallMethods } from './install.types'

const ALL_PLATFORMS: PlatformId[] = ['windows', 'linux', 'macos']

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
  supportedPlatforms: PlatformId[]
  installMethods?: InstallMethods
  minimumVersion?: string
  recommendedVersion?: string
  outdatedStatus?: 'warning' | 'outdated'
  requires?: ToolCatalogItem['id'][]
}

export const toolsCatalog: ToolCatalogItem[] = [
  {
    id: 'git',
    name: 'Git',
    category: 'Version Control',
    description: 'Sistema de controle de versão essencial para desenvolvimento.',
    command: 'git --version',
    versionRegex: '\\d+\\.\\d+\\.\\d+',
    supportedPlatforms: ALL_PLATFORMS,
    installMethods: {
      windows: 'winget install --id Git.Git -e',
      linux: {
        apt: 'sudo apt install git -y',
        dnf: 'sudo dnf install git -y',
        pacman: 'sudo pacman -S git --noconfirm'
      },
      macos: 'brew install git'
    }
  },
  {
    id: 'node',
    name: 'Node.js',
    category: 'Runtime',
    description: 'Runtime JavaScript para React, Vite e ferramentas front-end.',
    command: 'node -v',
    versionRegex: '\\d+\\.\\d+\\.\\d+',
    minimumVersion: '20.0.0',
    supportedPlatforms: ALL_PLATFORMS,
    installMethods: {
      windows: 'winget install OpenJS.NodeJS',
      linux: {
        apt: 'sudo apt install nodejs npm -y',
        dnf: 'sudo dnf install nodejs -y',
        pacman: 'sudo pacman -S nodejs --noconfirm'
      },
      macos: 'brew install node'
    }
  },
  {
    id: 'vscode',
    name: 'VS Code',
    category: 'Editor',
    description: 'Editor principal para desenvolvimento fullstack.',
    command: 'code --version',
    versionRegex: '\\d+\\.\\d+\\.\\d+',
    supportedPlatforms: ALL_PLATFORMS,
    installMethods: {
      windows: 'winget install --id Microsoft.VisualStudioCode -e',
      linux: {
        apt: 'sudo snap install code --classic',
        // TODO: repo add — requires adding microsoft.com/yumrepos/vscode before dnf install code
        // TODO: repo add — not in official Arch repos; use AUR (yay -S visual-studio-code-bin)
      },
      macos: 'brew install --cask visual-studio-code'
    }
  },
  {
    id: 'npm',
    name: 'npm',
    category: 'Package Manager',
    description: 'Gerenciador de pacotes padrão do ecossistema Node.js.',
    command: 'npm -v',
    versionRegex: '\\d+\\.\\d+\\.\\d+',
    supportedPlatforms: ALL_PLATFORMS,
    installMethods: {
      windows: 'winget install OpenJS.NodeJS',
      linux: {
        apt: 'sudo apt install npm -y',
        dnf: 'sudo dnf install npm -y',
        pacman: 'sudo pacman -S npm --noconfirm'
      },
      macos: 'brew install node'
    }
  },
  {
    id: 'pnpm',
    name: 'pnpm',
    category: 'Package Manager',
    description: 'Gerenciador de pacotes rápido para monorepos e projetos JavaScript.',
    command: 'pnpm -v',
    versionRegex: '\\d+\\.\\d+\\.\\d+',
    supportedPlatforms: ALL_PLATFORMS,
    requires: ['node'],
    installMethods: {
      windows: 'winget install --id pnpm.pnpm -e',
      linux: 'sudo npm install -g pnpm',
      macos: 'brew install pnpm'
    }
  },
  {
    id: 'bun',
    name: 'Bun',
    category: 'Runtime',
    description: 'Runtime e toolkit JavaScript alternativo ao Node.js.',
    command: 'bun -v',
    versionRegex: '\\d+\\.\\d+\\.\\d+',
    supportedPlatforms: ALL_PLATFORMS,
    requires: ['node'],
    installMethods: {
      windows: 'winget install --id Oven-sh.Bun -e',
      linux: 'curl -fsSL https://bun.sh/install | bash',
      macos: 'brew install bun'
    }
  },
  {
    id: 'php',
    name: 'PHP',
    category: 'Runtime',
    description: 'Linguagem base para aplicações Laravel.',
    command: 'php -v',
    versionRegex: '\\d+\\.\\d+\\.\\d+',
    minimumVersion: '8.2.0',
    supportedPlatforms: ALL_PLATFORMS,
    installMethods: {
      windows: 'winget install --id PHP.PHP.8.3 -e',
      linux: {
        apt: 'sudo apt install php php-cli php-mbstring php-xml php-curl -y',
        dnf: 'sudo dnf install php php-cli php-mbstring php-xml php-curl -y',
        pacman: 'sudo pacman -S php --noconfirm'
      },
      macos: 'brew install php'
    }
  },
  {
    id: 'composer',
    name: 'Composer',
    category: 'Package Manager',
    description: 'Gerenciador de dependências para projetos PHP.',
    command: 'composer --version',
    versionRegex: '\\d+\\.\\d+\\.\\d+',
    supportedPlatforms: ALL_PLATFORMS,
    requires: ['php'],
    installMethods: {
      windows: 'winget install --id Composer.Composer -e',
      linux: {
        apt: 'sudo apt install composer -y',
        dnf: 'sudo dnf install composer -y',
        pacman: 'sudo pacman -S composer --noconfirm'
      },
      macos: 'brew install composer'
    }
  },
  {
    id: 'laravel',
    name: 'Laravel Installer',
    category: 'Framework',
    description: 'CLI para criação e gerenciamento de projetos Laravel.',
    command: 'laravel --version',
    versionRegex: '\\d+\\.\\d+\\.\\d+',
    supportedPlatforms: ALL_PLATFORMS,
    requires: ['composer'],
    installMethods: {
      windows: 'composer global require laravel/installer',
      linux: 'composer global require laravel/installer',
      macos: 'composer global require laravel/installer'
    }
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'DevOps',
    description: 'Ambiente de containers para aplicações e bancos locais.',
    command: 'docker --version',
    versionRegex: '\\d+\\.\\d+\\.\\d+',
    minimumVersion: '20.10.0',
    recommendedVersion: '24.0.0',
    outdatedStatus: 'warning',
    supportedPlatforms: ALL_PLATFORMS,
    installMethods: {
      windows: 'winget install Docker.DockerDesktop',
      linux: {
        apt: 'sudo apt install docker.io -y',
        dnf: 'sudo dnf install -y moby-engine',
        pacman: 'sudo pacman -S docker --noconfirm'
      },
      macos: 'brew install --cask docker'
    }
  },
  {
    id: 'mysql',
    name: 'MySQL',
    category: 'Database',
    description: 'Banco de dados relacional muito usado com Laravel.',
    command: 'mysql --version',
    versionRegex: '\\d+\\.\\d+\\.\\d+',
    supportedPlatforms: ALL_PLATFORMS,
    installMethods: {
      windows: 'winget install --id Oracle.MySQL -e',
      linux: {
        apt: 'sudo apt install mysql-server -y',
        dnf: 'sudo dnf install -y mysql-server',
        pacman: 'sudo pacman -S mariadb --noconfirm'
      },
      macos: 'brew install mysql'
    }
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    category: 'Database',
    description: 'Banco de dados relacional usado em aplicações web modernas.',
    command: 'psql --version',
    versionRegex: '\\d+\\.\\d+\\.\\d+',
    supportedPlatforms: ALL_PLATFORMS,
    installMethods: {
      windows: 'winget install --id PostgreSQL.PostgreSQL.17 -e',
      linux: {
        apt: 'sudo apt install postgresql postgresql-contrib -y',
        dnf: 'sudo dnf install -y postgresql postgresql-server',
        pacman: 'sudo pacman -S postgresql --noconfirm'
      },
      macos: 'brew install postgresql@17'
    }
  },
  {
    id: 'postman',
    name: 'Postman',
    category: 'API Client',
    description: 'Ferramenta para testar APIs durante o desenvolvimento.',
    command: 'postman --version',
    versionRegex: '\\d+\\.\\d+\\.\\d+',
    supportedPlatforms: ALL_PLATFORMS,
    installMethods: {
      windows: 'winget install --id Postman.Postman -e',
      linux: {
        apt: 'sudo snap install postman',
        // TODO: repo add — not in Fedora repos; use flatpak install flathub com.getpostman.Postman
        // TODO: repo add — not in official Arch repos; use AUR (yay -S postman-bin)
      },
      macos: 'brew install --cask postman'
    }
  }
]
