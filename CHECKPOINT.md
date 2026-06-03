# DevClone — Checkpoint

**Data:** 2026-06-03
**Branch:** main
**Último commit:** `a0629cf feat(router): implement multi-page navigation with react-router-dom`

---

## Estado atual do projeto

O DevClone é um app Electron + React + TypeScript que escaneia ferramentas de desenvolvimento instaladas na máquina, calcula compatibilidade com um perfil de stack (Laravel + React) e gera recomendações.

### O que está funcionando

| Área | Status |
|---|---|
| Scan real do ambiente via IPC (`scan:environment`) | ✅ |
| Detecção dinâmica de plataforma + capabilities via IPC (`platform:get`) | ✅ |
| Persistência do resultado em `userData/last-scan.json` | ✅ |
| Comando de instalação por tool via IPC (`install:get-command`) | ✅ |
| Cálculo de compatibilidade com profile ativo (Laravel + React) | ✅ |
| Engine de recomendações com severidade por tool | ✅ |
| Roteador com 5 rotas: `/`, `/tools`, `/scan`, `/profile`, `/settings` | ✅ |
| Sidebar com `NavLink` e highlight ativo dinâmico | ✅ |
| Catálogo de 13 ferramentas com `outdatedStatus` e `installMethods` | ✅ |
| Modal de detalhes de ferramenta com insight e install command | ✅ |

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
    pages/
      Home.tsx            — dashboard principal com scan e recomendações
      ToolsPage.tsx       — placeholder (catálogo completo)
      ScanPage.tsx        — placeholder (scan detalhado)
      ProfilePage.tsx     — placeholder (gerenciamento de perfis)
      SettingsPage.tsx    — placeholder (configurações)
    components/
      Layout.tsx          — grid sidebar + conteúdo, sem minWidth fixo
      Sidebar.tsx         — NavLink com isActive
      ToolList.tsx        — lista de ferramentas com StatusBadge
      ToolDetailsModal.tsx — modal com insight, versão e install command
      RecommendationsPanel.tsx
      StatCard.tsx / StepList.tsx / StatusBadge.tsx
  shared/
    platform/             — tipos PlatformId, CurrentPlatform, capabilities
    profiles/             — EnvironmentProfile, compatibility calculator
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
| Sem estado global (prop drilling em Home.tsx) | Escalabilidade | Resolve com Context/Zustand na próxima fase |
| postgres versionRegex `\d+\.\d+\.\d+` não captura output real do psql | Detecção | psql retorna `15.3`, não `15.3.0` — versão sempre nula |
| Páginas placeholder sem conteúdo funcional | Feature gap | Intencionais — router está pronto para receber implementação |
| `PLATFORM_CAPABILITIES` detecta `docker --version` como proxy para DockerDesktop | Imprecisão | Docker pode estar instalado por outros meios |

---

## Próximo passo — Instalação guiada

**Objetivo:** quando o usuário clicar em "Instalar" em um tool com status `missing`, exibir o comando de instalação, pedir confirmação e executar com feedback de progresso em tempo real.

### O que já existe para aproveitar:
- `install:get-command` IPC retorna o comando correto por plataforma
- `executeCommand` em `command.service.ts` executa shell commands
- `ToolDetailsModal.tsx` já exibe o install command como texto

### O que falta implementar:
1. IPC `install:run-command` que executa o comando e faz stream do output via `ipcMain.emit` / `webContents.send`
2. Listener no preload e renderer para receber chunks de output
3. UI de confirmação: preview do comando → botão "Executar" → progress log
4. Atualizar o scan automaticamente ao terminar a instalação
