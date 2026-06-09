# DevClone — Checkpoint

**Data:** 2026-06-09
**Branch:** main
**Último commit:** `5715426 feat(settings-page): implement settings with data management and auto-scan toggle`
**Remote:** sincronizado com `origin/main`

---

## Estado atual do projeto

O DevClone é um app Electron + React + TypeScript que escaneia ferramentas de desenvolvimento instaladas na máquina, calcula compatibilidade com um perfil de stack personalizável e gera recomendações.

### O que está funcionando

| Área | Status |
|---|---|
| App sem erros, typecheck limpo | ✅ |
| Fluxo de primeiro uso (Home vazia até primeiro scan) | ✅ |
| Scan real da máquina com detecção de plataforma (Windows/Linux/macOS) | ✅ |
| Fix de encoding UTF-8 para usuários com acentos no nome (Windows) | ✅ |
| Fix de PATH stale após instalação (`refreshWindowsPath`) | ✅ |
| `windowsHide: true` em todos os processos filhos (sem janelas de terminal durante scan) | ✅ |
| Instalação guiada com log ao vivo e re-scan automático | ✅ |
| Sistema de perfis dinâmico com persistência local | ✅ |
| 4 perfis padrão: Laravel+React, Node Full Stack, Python/Data Science, DevOps/Infra | ✅ |
| Detecção automática do melhor perfil após scan | ✅ |
| Estado global com Zustand (`useAppStore`) | ✅ |
| Roteador com 4 páginas: `/`, `/tools`, `/profile`, `/settings` | ✅ |
| Aba Scan removida do menu | ✅ |
| Home: dashboard com score, ferramentas, recomendações, empty state para primeiro uso | ✅ |
| ToolsPage: catálogo completo, filtros por categoria e status, busca, badge "No perfil" | ✅ |
| ProfilePage: checkboxes, nome editável, modal de perfis padrão com score de compatibilidade | ✅ |
| SettingsPage: versão/plataforma via IPC, dados locais, toggle de scan automático, seção "Em breve" | ✅ |
| Cadeia de dependências entre ferramentas (composer→php, laravel→composer, pnpm→node, bun→node) | ✅ |
| Status `degraded` para ferramentas com dependências ausentes | ✅ |
| Pre-flight checks com botão "Corrigir automaticamente" (wsl2 abre terminal elevado) | ✅ |
| Detecção de virtualização com múltiplas estratégias (compatível com Dell Vostro e similares) | ✅ |
| Persistência de `settings.json` com toggle `autoScan` respeitado no `StoreInitializer` | ✅ |
| Commits organizados em inglês, GitHub sincronizado | ✅ |

### Estrutura de arquivos relevantes

```
src/
  main/
    ipc/
      install.ipc.ts      — install:get-command, install:run-command
      platform.ipc.ts     — platform:get
      preflight.ipc.ts    — preflight:run/fix/save-pending/get-pending/clear-pending
      profile.ipc.ts      — profile:get, profile:save
      scan.ipc.ts         — scan:environment, load:lastScan
      settings.ipc.ts     — app:getVersion, app:getUserDataPath, app:clearScanData,
                            app:getSettings, app:saveSettings
    services/
      command.service.ts  — executeCommand/spawnCommand com windowsHide:true
      install.service.ts  — resolve install command por plataforma
      platform.service.ts — detecta SO + capabilities reais
      preflight.service.ts — checkWsl2, checkVirtualization (4 estratégias), checkCurl/php/composer
      scan.service.ts     — refreshWindowsPath (UTF-8 fix) + scanTool + checkToolDependencies
      settings.service.ts — lê/escreve settings.json no userData
      storage.service.ts  — salva/lê last-scan.json e active-profile.json
  preload/
    index.ts / index.d.ts — IPC bridge completo para o renderer
  renderer/src/
    store/
      useAppStore.ts      — Zustand: userProfile, environmentProfile,
                            scanResult, lastScanAt, clearScanData + actions
    pages/
      Home.tsx            — dashboard + empty state para primeiro uso
      ToolsPage.tsx       — catálogo com filtros, busca, modal de detalhes
      ProfilePage.tsx     — perfil completo (checkboxes, presets, nome)
      SettingsPage.tsx    — versão, dados locais, autoScan toggle, em breve
    hooks/
      useActiveProfile.ts — wrapper do store
      useEnvironmentScan.ts — wrapper do store
    App.tsx               — StoreInitializer (respeita autoScan) + rotas
  shared/
    profiles/             — defaultProfiles (4 presets), compatibility, userProfile.utils
    recommendations/      — engine com severidade
    tools/
      catalog.ts          — 15 ferramentas com outdatedStatus e installMethods
      dependency-map.ts   — cadeia de dependências por plataforma
      insights.ts         — textos de insight por ferramenta
      preflight.types.ts  — CheckStatus, PreflightCheck, PreflightResult
    scan.types.ts / utils/version.ts
```

---

## Dívida técnica conhecida

| Item | Impacto | Notas |
|---|---|---|
| Botão "Criar perfil" na Home não navega para `/profile` | UX | Botão existe mas não tem `onClick` implementado |
| Seção "STATUS DO MVP" na Sidebar desatualizada | UX | Texto fixo que não reflete o estado real |
| Descrição da Home menciona "Laravel + React" de forma específica | UX | Deveria ser stack-agnostic |
| Título "Ferramentas do MVP" na Home desatualizado | UX | Deveria ser "Ferramentas do seu ambiente" |
| `mockTools` como fallback pré-scan | UX | Mostra versões fictícias antes do primeiro scan |
| `postgres` versionRegex `\d+\.\d+\.\d+` | Detecção | `psql` retorna `15.3` — versão sempre nula |
| Múltiplos perfis por usuário | Feature | Depende de login/conta |
| Login e autenticação | Feature | Próxima grande fase |
| Cloud Sync | Feature | Depende de login |
| Export/Import de perfil local | Feature | Útil mesmo sem conta |

---

## Próximo passo imediato

Quatro ajustes de polish na Home e Sidebar:

1. Renomear botão "Criar perfil" → "Meu perfil" com navegação para `/profile`
2. Remover seção "STATUS DO MVP" da Sidebar
3. Atualizar descrição da Home para ser stack-agnostic
4. Renomear "Ferramentas do MVP" → "Ferramentas do seu ambiente"
