import type { DependencyEntry } from './preflight.types'

export const dependencyMap: Record<string, Record<string, DependencyEntry[]>> = {
  docker: {
    windows: [
      {
        id: 'virtualization',
        label: 'Virtualização habilitada no processador',
        autoFixable: false,
        rebootRequired: false,
        userMessage:
          'O Docker precisa que a virtualização esteja ativada na BIOS do seu computador. Reinicie o computador, entre na BIOS (geralmente F2 ou DEL) e habilite a opção de virtualização.'
      },
      {
        id: 'wsl2',
        label: 'WSL2 (Windows Subsystem for Linux 2)',
        autoFixable: true,
        rebootRequired: true,
        userMessage:
          'O Docker precisa do WSL2 para funcionar no Windows. Vamos instalar isso automaticamente para você.'
      }
    ],
    linux: [
      {
        id: 'curl',
        label: 'curl',
        autoFixable: true,
        rebootRequired: false,
        userMessage: 'Ferramenta de download necessária para a instalação. Resolvemos em segundos.'
      }
    ],
    macos: []
  },

  composer: {
    windows: [
      {
        id: 'php',
        label: 'PHP instalado',
        autoFixable: false,
        rebootRequired: false,
        userMessage:
          'O Composer precisa do PHP. Instale o PHP pela lista de ferramentas antes de continuar.'
      }
    ],
    linux: [
      {
        id: 'php',
        label: 'PHP instalado',
        autoFixable: false,
        rebootRequired: false,
        userMessage: 'Instale o PHP antes de continuar.'
      }
    ],
    macos: [
      {
        id: 'php',
        label: 'PHP instalado',
        autoFixable: false,
        rebootRequired: false,
        userMessage: 'Instale o PHP antes de continuar.'
      }
    ]
  },

  // catalog ID is 'laravel', not 'laravel-installer'
  laravel: {
    windows: [
      {
        id: 'composer',
        label: 'Composer instalado',
        autoFixable: false,
        rebootRequired: false,
        userMessage:
          'O Laravel Installer precisa do Composer. Instale o Composer antes de continuar.'
      }
    ],
    linux: [
      {
        id: 'composer',
        label: 'Composer instalado',
        autoFixable: false,
        rebootRequired: false,
        userMessage: 'Instale o Composer antes de continuar.'
      }
    ],
    macos: [
      {
        id: 'composer',
        label: 'Composer instalado',
        autoFixable: false,
        rebootRequired: false,
        userMessage: 'Instale o Composer antes de continuar.'
      }
    ]
  }
}
