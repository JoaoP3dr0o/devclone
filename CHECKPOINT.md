# DevClone — Checkpoint

**Data:** 2026-06-03
**Branch:** main
**Último commit:** `acce12e fix(scan): handle UTF-8 encoding for PATH with special characters on Windows`
**Sessão atual:** ToolsPage implementada (não commitada)
**Remote:** sincronizado com `origin/main`

---

## Estado atual do projeto

O DevClone é um app Electron + React + TypeScript que escaneia ferramentas de desenvolvimento instaladas na máquina, calcula compatibilidade com um perfil de stack personalizável e gera recomendações.

### O que está funcionando

| Área | Status |
|---|---|
| Scan real do ambiente via IPC (`scan:environment`) | ✅ |
| Detecção de PHP com path não-ASCII no Windows (fix UTF-8) | ✅ |
| Detecção dinâmica de plataforma + capabilities via IPC | ✅ |
| Persistência do resultado em `userData/last-scan.json` | ✅ |
| Comando de instalação por tool via IPC | ✅ |
| Cálculo de compatibilidade com profile ativo | ✅ |
| Engine de recomendações com severidade por tool | ✅ |
| Roteador com 5 rotas: `/`, `/tools`, `/scan`, `/profile`, `/settings` | ✅ |
| Sidebar com `NavLink` e highlight ativo dinâmico | ✅ |
| Catálogo de 13 ferramentas com `outdatedStatus` e `installMethods` | ✅ |
| Modal de detalhes de ferramenta com insight e install command | ✅ |
| ProfilePage completa: checkboxes, nome editável, 4 presets, auto-detect | ✅ |
| Zustand global store (`useAppStore`): perfil + scan compartilhados | ✅ |
| Reatividade entre páginas: score na Home atualiza ao mudar perfil | ✅ |
| ToolsPage: catálogo completo, busca, filtros por categoria + status, badge "No perfil" | ✅ |

### Estrutura de arquivos relevantes

```
src/
  main/
    ipc/
      install.ipc.ts      — install:get-command
      platform.ipc.ts     — platform:get
      scan.ipc.ts         — scan:environment, load:lastScan
    services/
      command.service.ts  — executeCommand({ encoding:'utf8' }), spawnCommand
      install.service.ts  — resolve install command por plataforma
      platform.service.ts — detecta SO + capabilities reais
      scan.service.ts     — refreshWindowsPath (UTF-8 fix) + scanTool por plataforma
      storage.service.ts  — salva/lê last-scan.json
  preload/
    index.ts / index.d.ts — IPC bridge para o renderer
  renderer/src/
    store/
      useAppStore.ts      — Zustand: userProfile, environmentProfile,
                            scanResult, lastScanAt + actions
    pages/
      Home.tsx            — dashboard com score, ferramentas, recomendações
      ToolsPage.tsx       — ⚠️ placeholder vazio
      ScanPage.tsx        — ⚠️ placeholder vazio
      ProfilePage.tsx     — perfil completo (checkboxes, presets, nome)
      SettingsPage.tsx    — ⚠️ placeholder vazio
    hooks/
      useActiveProfile.ts — wrapper do store
      useEnvironmentScan.ts — wrapper do store
    App.tsx               — StoreInitializer + rotas
  shared/
    profiles/             — defaultProfiles (4 presets), compatibility, userProfile.utils
    recommendations/      — engine com severidade
    tools/                — catalog.ts (13 tools), insights.ts, install.types.ts
    scan.types.ts / utils/version.ts
```

---

## Dívida técnica conhecida

| Item | Impacto | Notas |
|---|---|---|
| `mockTools` como fallback pré-scan | UX | Mostra versões fictícias antes do primeiro scan |
| postgres versionRegex `\d+\.\d+\.\d+` | Detecção | psql retorna `15.3` — versão sempre nula |
| `ScanPage`, `SettingsPage` são placeholders | Feature gap | Rotas existem mas sem conteúdo |
| `PLATFORM_CAPABILITIES` detecta docker via `docker --version` | Imprecisão | Docker instalado por outros meios não é detectado |

---

## Próximo passo — Página /scan completa

**Objetivo:** transformar `ScanPage.tsx` (placeholder) na página de scan do ambiente, mostrando progresso ferramenta por ferramenta, histórico de scans e resultado detalhado.

### O que já existe para aproveitar:
- `useEnvironmentScan()` com `loading`, `scanResult`, `lastScanAt`, `scanEnvironment`
- `scan:environment` IPC já implementado no main (retorna `EnvironmentScanResult`)
- `storage.service.ts` já salva `last-scan.json` em `userData`
- `StatusBadge` e `ToolDetailsModal` reutilizáveis

### O que implementar:
1. **Botão "Iniciar Scan"** com estado de loading e resultado
2. **Lista de ferramentas** com status individual pós-scan (animação durante o scan)
3. **Resumo**: total instalado / ausente / desatualizado
4. **Data/hora do último scan** e botão de re-scan
5. **Mensagem de estado vazio** quando nunca foi feito scan
