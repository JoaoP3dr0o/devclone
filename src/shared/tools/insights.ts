import type { ToolScanStatus } from '../scan.types'

import type { ToolCatalogItem } from './catalog'

export type ToolInsight = {
  healthyMessage: string
  warningMessage: string
  outdatedMessage: string
  missingMessage: string
  longDescription?: string
  documentationUrl?: string
}

const defaultInsight: ToolInsight = {
  healthyMessage: 'Ferramenta pronta para uso no ambiente atual.',
  warningMessage: 'Ferramenta instalada, mas vale revisar a versão antes de projetos maiores.',
  outdatedMessage: 'Ferramenta instalada, porém abaixo da versão esperada para este stack.',
  missingMessage: 'Ferramenta ausente no ambiente atual.'
}

export const toolInsights: Partial<Record<ToolCatalogItem['id'], ToolInsight>> = {
  git: {
    healthyMessage: 'Git está disponível para versionamento e colaboração.',
    warningMessage: 'Git está instalado, mas vale validar integração com credenciais e remotos.',
    outdatedMessage: 'Git está instalado, mas uma versão mais recente evita problemas com recursos modernos.',
    missingMessage: 'Git é essencial para clonar repositórios e controlar versões.',
    longDescription: 'O Git é a base do fluxo de trabalho para projetos Laravel, React e colaboração em times.',
    documentationUrl: 'https://git-scm.com/docs'
  },
  node: {
    healthyMessage: 'Node.js está em uma versão adequada para Vite, React e toolchains modernos.',
    warningMessage: 'Node.js está instalado, mas revise a versão se surgirem falhas de build.',
    outdatedMessage:
      'Node.js abaixo da versão 20 pode gerar incompatibilidades com Vite moderno e pacotes recentes.',
    missingMessage: 'Node.js é necessário para executar Vite, React, npm e scripts front-end.',
    longDescription:
      'Node.js sustenta o ambiente JavaScript local, incluindo dev server, bundlers e ferramentas de build.',
    documentationUrl: 'https://nodejs.org/docs'
  },
  vscode: {
    healthyMessage: 'VS Code está pronto como editor principal do ambiente.',
    warningMessage: 'VS Code está instalado, mas extensões do stack ainda podem ser necessárias.',
    outdatedMessage: 'VS Code desatualizado pode limitar suporte a extensões recentes.',
    missingMessage: 'VS Code é recomendado para uma experiência consistente com Laravel e React.',
    longDescription:
      'VS Code centraliza edição, terminal, debugging e extensões úteis para o fluxo fullstack.',
    documentationUrl: 'https://code.visualstudio.com/docs'
  },
  npm: {
    healthyMessage: 'npm está disponível para instalar dependências e rodar scripts JavaScript.',
    warningMessage: 'npm está instalado, mas versões antigas podem divergir do lockfile.',
    outdatedMessage: 'npm desatualizado pode causar diferenças na resolução de dependências.',
    missingMessage: 'npm é necessário para dependências JavaScript quando o projeto usa Node.js.',
    documentationUrl: 'https://docs.npmjs.com'
  },
  pnpm: {
    healthyMessage: 'pnpm está disponível para instalações rápidas e workspaces.',
    warningMessage: 'pnpm está instalado, mas confira compatibilidade com o lockfile do projeto.',
    outdatedMessage: 'pnpm desatualizado pode falhar em projetos com workspaces recentes.',
    missingMessage: 'pnpm é opcional, mas útil em monorepos e projetos JavaScript maiores.',
    documentationUrl: 'https://pnpm.io'
  },
  bun: {
    healthyMessage: 'Bun está disponível como runtime e toolkit alternativo.',
    warningMessage: 'Bun está instalado, mas confirme compatibilidade antes de trocar o runtime do projeto.',
    outdatedMessage: 'Bun desatualizado pode não suportar APIs recentes do ecossistema.',
    missingMessage: 'Bun é opcional para este stack, mas pode acelerar alguns fluxos JavaScript.',
    documentationUrl: 'https://bun.sh/docs'
  },
  php: {
    healthyMessage: 'PHP está em versão adequada para aplicações Laravel modernas.',
    warningMessage: 'PHP está instalado, mas confirme extensões exigidas pelo projeto.',
    outdatedMessage: 'PHP abaixo de 8.2 limita compatibilidade com versões modernas do Laravel.',
    missingMessage: 'PHP é necessário para executar Laravel e scripts backend locais.',
    longDescription:
      'PHP executa a aplicação Laravel, comandos Artisan e parte central do backend local.',
    documentationUrl: 'https://www.php.net/docs.php'
  },
  composer: {
    healthyMessage: 'Composer está disponível para gerenciar dependências PHP.',
    warningMessage: 'Composer está instalado, mas valide autenticação e cache para pacotes privados.',
    outdatedMessage: 'Composer desatualizado pode falhar com metadados ou plugins recentes.',
    missingMessage: 'Composer é necessário para instalar dependências PHP em projetos Laravel.',
    documentationUrl: 'https://getcomposer.org/doc'
  },
  laravel: {
    healthyMessage: 'Laravel Installer está disponível para criar novos projetos rapidamente.',
    warningMessage: 'Laravel Installer está instalado, mas projetos existentes podem depender mais do Composer.',
    outdatedMessage: 'Laravel Installer desatualizado pode criar projetos com defaults antigos.',
    missingMessage: 'Laravel Installer facilita criar novos projetos, mas não é obrigatório para rodar um existente.',
    documentationUrl: 'https://laravel.com/docs'
  },
  docker: {
    healthyMessage: 'Docker está pronto para containers e ambientes isolados.',
    warningMessage: 'Docker está instalado, mas a versão pode ser antiga para fluxos modernos com Laravel Sail.',
    outdatedMessage: 'Docker muito antigo pode causar incompatibilidades com imagens e Compose recentes.',
    missingMessage: 'Docker é recomendado para Laravel Sail, bancos locais e ambientes reproduzíveis.',
    longDescription:
      'Docker ajuda a padronizar serviços como PHP, MySQL e filas sem depender tanto da máquina local.',
    documentationUrl: 'https://docs.docker.com'
  },
  mysql: {
    healthyMessage: 'MySQL está disponível para bancos relacionais locais.',
    warningMessage: 'MySQL está instalado, mas confira porta, usuário e serviço ativo.',
    outdatedMessage: 'MySQL desatualizado pode divergir do ambiente de produção.',
    missingMessage: 'MySQL é comum em projetos Laravel e pode ser necessário fora do Docker.',
    documentationUrl: 'https://dev.mysql.com/doc'
  },
  postgres: {
    healthyMessage: 'PostgreSQL está disponível para bancos relacionais locais.',
    warningMessage: 'PostgreSQL está instalado, mas confira serviço, porta e usuário local.',
    outdatedMessage: 'PostgreSQL desatualizado pode divergir de recursos usados em produção.',
    missingMessage: 'PostgreSQL é opcional neste profile, mas comum em aplicações web modernas.',
    documentationUrl: 'https://www.postgresql.org/docs'
  }
}

export function getToolInsight(toolId: ToolCatalogItem['id']): ToolInsight {
  return toolInsights[toolId] ?? defaultInsight
}

export function getToolInsightMessage(toolId: ToolCatalogItem['id'], status: ToolScanStatus): string {
  const insight = getToolInsight(toolId)

  if (status === 'healthy') return insight.healthyMessage
  if (status === 'warning') return insight.warningMessage
  if (status === 'outdated') return insight.outdatedMessage
  return insight.missingMessage
}
