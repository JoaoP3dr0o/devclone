# DevClone — Checkpoint

**Data:** 2026-06-03
**Branch:** main
**Último commit:** `d63436f refactor(state): add Zustand global store for tools and profile`

---

## Estado atual do projeto

O DevClone é um app Electron + React + TypeScript que escaneia ferramentas de desenvolvimento instaladas na máquina, calcula compatibilidade com um perfil de stack personalizável e gera recomendações.

### O que está funcionando

| Área | Status |
|---|---|
| Scan real do ambiente via IPC (`scan:environment`) | ✅ |
| Detecção dinâmica de plataforma + capabilities via IPC (`platform:get`) | ✅ |
| Persistência do resultado em `userData/last-scan.json` | ✅ |
| Comando de instalação por tool via IPC (`install:get-command`) | ✅ |
| Cálculo de compatibilidade com profile ativo | ✅ |
| Engine de recomendações com severidade por tool | ✅ |
| Roteador com 5 rotas: `/`, `/tools`, `/scan`, `/profile`, `/settings` | ✅ |
| Sidebar com `NavLink` e highlight ativo dinâmico | ✅ |
| Catálogo de 13 ferramentas com `outdatedStatus` e `installMethods` | ✅ |
| Modal de detalhes de ferramenta com insight e install command | ✅ |
| **ProfilePage completa**: checkboxes, nome editável, 4 presets, auto-detect | ✅ |
| **Zustand global store** (`useAppStore`): perfil + scan compartilhados | ✅ |
| **Reatividade entre páginas**: score na Home atualiza ao mudar perfil | ✅ |

### Estrutura de arquivos relevantes

```
src/
  main/
    ipc/
      install.ipc.ts      — install:get-command
      platform.ipc.ts     — platform:get (detecção dinâmica)
      scan.ipc.ts         — scan:environment, load:lastScan
    services/
      command.service.ts  — executa comandos shell
      install.service.ts  — resolve install command por plataforma
      platform.service.ts — detecta SO + capabilities reais
      scan.service.ts     — itera catálogo e escaneia tools
      storage.service.ts  — salva/lê last-scan.json
  preload/
    index.ts              — expõe IPC bridge para o renderer
    index.d.ts            — tipos do window.electron
  renderer/src/
    store/
      useAppStore.ts      — Zustand store: userProfile, environmentProfile,
                            scanResult, lastScanAt, loadProfile, setProfile,
                            loadLastScan, triggerScan
    pages/
      Home.tsx            — dashboard principal (lê do store via hooks)
      ToolsPage.tsx       — placeholder (catálogo completo)
      ScanPage.tsx        — placeholder (scan detalhado)
      ProfilePage.tsx     — gerenciamento de perfil (lê/escreve no store)
      SettingsPage.tsx    — placeholder (configurações)
    components/
      Layout.tsx          — grid sidebar + conteúdo
      Sidebar.tsx         — NavLink com isActive
      ToolList.tsx        — lista de ferramentas com StatusBadge
      ToolDetailsModal.tsx — modal com insight, versão e install command
      RecommendationsPanel.tsx
      StatCard.tsx / StepList.tsx / StatusBadge.tsx
    hooks/
      useActiveProfile.ts — thin wrapper do store (userProfile, setProfile)
      useEnvironmentScan.ts — thin wrapper do store (scanResult, triggerScan)
    App.tsx               — StoreInitializer carrega perfil + scan no mount
  shared/
    platform/             — tipos PlatformId, CurrentPlatform, capabilities
    profiles/             — EnvironmentProfile, compatibility calculator,
                            defaultProfiles (4 presets), userProfile.utils
    recommendations/      — engine de recomendações com severidade
    tools/                — catalog.ts (13 tools), insights.ts, install.types.ts
    scan.types.ts         — ToolScanResult, EnvironmentScanResult, LastScanStorage
    utils/version.ts      — compareVersions, isVersionLowerThan
```

---

## Dívida técnica conhecida

| Item | Impacto | Notas |
|---|---|---|
| `mockTools` como fallback pré-scan | UX | Mostra versões fictícias antes do primeiro scan |
| postgres versionRegex `\d+\.\d+\.\d+` não captura output real do psql | Detecção | psql retorna `15.3`, não `15.3.0` — versão sempre nula |
| Páginas placeholder sem conteúdo funcional | Feature gap | ToolsPage, ScanPage, SettingsPage ainda são placeholders |
| `PLATFORM_CAPABILITIES` detecta `docker --version` como proxy para DockerDesktop | Imprecisão | Docker pode estar instalado por outros meios |

---

## Próximo passo — Instalação guiada

**Objetivo:** quando o usuário clicar em "Instalar" em um tool com status `missing`, exibir o comando de instalação, pedir confirmação e executar com feedback de progresso em tempo real.

### O que já existe para aproveitar:
- `install:get-command` IPC retorna o comando correto por plataforma
- `executeCommand` em `command.service.ts` executa shell commands
- `ToolDetailsModal.tsx` já exibe o install command como texto
- `useAppStore.triggerScan` pode ser chamado após instalar para atualizar o estado

### O que falta implementar:
1. IPC `install:run-command` que executa o comando e faz stream do output via `webContents.send`
2. Listener no preload e renderer para receber chunks de output em tempo real
3. UI de confirmação: preview do comando → botão "Executar" → progress log
4. Chamar `triggerScan()` do store automaticamente ao terminar a instalação
