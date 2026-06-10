# DevClone — Checkpoint

**Data:** 2026-06-10
**Branch:** main
**Último commit:** `ba6e25d feat(profiles): add multi-profile manager UI with preset and create flow`
**Remote:** pendente de push

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
| Status `degraded` para ferramentas com dependências ausentes | ✅ |
| Pre-flight checks com botão "Corrigir automaticamente" (wsl2 abre terminal elevado) | ✅ |
| Detecção de virtualização com 4 estratégias em cascata (compatível com Dell Vostro e similares) | ✅ |
| 4 perfis padrão: Laravel+React, Node Full Stack, Python/Data Science, DevOps/Infra | ✅ |
| Detecção automática do melhor perfil após scan | ✅ |
| Estado global com Zustand (`useAppStore`) | ✅ |
| Roteador com 4 páginas: `/`, `/tools`, `/profile`, `/settings` | ✅ |
| Home: dashboard com score, ferramentas, recomendações, empty state para primeiro uso | ✅ |
| ToolsPage: catálogo completo, filtros por categoria e status, busca | ✅ |
| ProfilePage: checkboxes, nome editável, banner de detecção automática | ✅ |
| SettingsPage: versão/plataforma via IPC, dados locais, toggle de scan automático, seção "Em breve" | ✅ |
| Cadeia de dependências entre ferramentas (composer→php, laravel→composer, pnpm→node, bun→node) | ✅ |
| Persistência de `settings.json` com toggle `autoScan` respeitado no `StoreInitializer` | ✅ |
| Export de perfil ativo + último scan para JSON local (save dialog nativo) | ✅ |
| Import de perfil de JSON — cria novo perfil sem sobrescrever o ativo | ✅ |
| **Multi-perfis — backend:** `profiles.json` com `ProfilesStore`, auto-migração de `active-profile.json` | ✅ |
| **Multi-perfis — IPC:** `profile:get-all`, `profile:create`, `profile:delete`, `profile:set-active`, `profile:update-tools` | ✅ |
| **Multi-perfis — UI:** `ProfileManagerModal` com listagem, ativar, deletar, criar novo, perfis padrão com compat % | ✅ |
| Badge "No perfil" em ferramentas missing no `ToolList` | ✅ |
| Linha contextual no `ToolDetailsModal` para ferramentas do perfil não instaladas | ✅ |
| Commits organizados em inglês, GitHub sincronizado | ✅ |

### Modelo de dados — multi-perfis

```typescript
// Persiste em profiles.json
type ProfilesStore = {
  version: number
  activeProfileId: string   // UUID do perfil ativo
  profiles: UserProfile[]
}

type UserProfile = {
  id: string        // crypto.randomUUID()
  name: string
  toolIds: string[]
  createdAt?: string
  updatedAt?: string   // usado para data relativa no modal
}

// Derivado (nunca persiste)
type EnvironmentProfile = {
  id: string; name: string; description: string
  tools: { toolId: string; required: boolean; minimumVersion?: string }[]
}
```

`setProfile()` no store ignora o `id` recebido e usa sempre `activeProfileId` do estado — compatibilidade retroativa com ProfilePage que constrói `UserProfile` sem UUID real.

### Estrutura de arquivos relevantes

```
src/
  main/
    ipc/
      export.ipc.ts       — export:profile
      import.ipc.ts       — import:profile
      install.ipc.ts      — install:get-command, install:run-command
      platform.ipc.ts     — platform:get
      preflight.ipc.ts    — preflight:run/fix/save-pending/get-pending/clear-pending
      profile.ipc.ts      — profile:get/save (compat), profile:get-all/create/delete/set-active/update-tools
      scan.ipc.ts         — scan:environment, load:lastScan
      settings.ipc.ts     — app:getVersion, app:getUserDataPath, app:clearScanData,
                            app:getSettings, app:saveSettings
    services/
      command.service.ts  — executeCommand/spawnCommand com windowsHide:true
      export.service.ts   — lê perfil ativo + lastScan, abre save dialog, escreve DevCloneExport
      import.service.ts   — abre open dialog, valida JSON, cria novo UserProfile
      install.service.ts  — resolve install command por plataforma
      platform.service.ts — detecta SO + capabilities reais
      preflight.service.ts — checkWsl2, checkVirtualization (4 estratégias), checkCurl/php/composer
      scan.service.ts     — refreshWindowsPath (UTF-8 fix) + scanTool + checkToolDependencies
      settings.service.ts — lê/escreve settings.json no userData
      storage.service.ts  — profiles.json (ProfilesStore), last-scan.json; auto-migra active-profile.json
  preload/
    index.ts / index.d.ts — IPC bridge completo incl. getAllProfiles, createProfile,
                            deleteProfile, setActiveProfile, updateProfileTools,
                            exportProfile, importProfile
  renderer/src/
    store/
      useAppStore.ts      — profiles[], activeProfileId, loadAllProfiles, createProfile,
                            deleteProfile, setActiveProfile; setProfile() wrapper compat
    pages/
      Home.tsx            — dashboard + empty state para primeiro uso
      ToolsPage.tsx       — catálogo com filtros, busca, modal de detalhes
      ProfilePage.tsx     — perfil ativo (checkboxes, nome, banner), ProfileManagerModal
      SettingsPage.tsx    — versão, dados locais, export/import, autoScan toggle, em breve
    components/
      ToolList.tsx        — badge "No perfil" para ferramentas missing no perfil ativo
      ToolDetailsModal.tsx — linha contextual quando ferramenta é do perfil mas não instalada
    hooks/
      useActiveProfile.ts — wrapper do store
      useEnvironmentScan.ts — wrapper do store
    App.tsx               — StoreInitializer chama loadAllProfiles() + respeita autoScan
  shared/
    profiles/
      defaultProfiles.ts  — 4 presets EnvironmentProfile
      compatibility.ts    — calculateProfileCompatibility, detectBestProfile
      profile.types.ts    — UserProfile, EnvironmentProfile, ProfilesStore
      userProfile.utils.ts — createProfile(), createDefaultProfilesStore(), DEFAULT_USER_PROFILE
      export.types.ts     — DevCloneExport { devclone_version, exported_at, profile, scan }
    recommendations/      — engine com severidade
    tools/
      catalog.ts          — 15 ferramentas com outdatedStatus e installMethods
      dependency-map.ts   — cadeia de dependências por plataforma
      insights.ts         — textos de insight por ferramenta
      preflight.types.ts  — CheckStatus, PreflightCheck, PreflightResult
    scan.types.ts / utils/version.ts
```

---

## Bugs conhecidos

| # | Bug | Impacto |
|---|---|---|
| 1 | Novo perfil criado manualmente tem 0 ferramentas — não pré-seleciona as já instaladas na máquina | UX: perfil inútil até o usuário selecionar manualmente tudo |
| 2 | Contagem de ferramentas no `ProfileManagerModal` mostra 0 para o perfil ativo recém-criado | Visual: lê `toolIds` do objeto antes do reload completo |
| 3 | Home não mostra informações úteis quando perfil tem 0 ferramentas selecionadas | UX: score 0%, sem recomendações — precisaria de fallback ou orientação |

---

## Dívida técnica menor

| Item | Impacto | Notas |
|---|---|---|
| `mockTools` como fallback pré-scan | UX | Mostra versões fictícias antes do primeiro scan |
| `postgres` versionRegex `\d+\.\d+\.\d+` | Detecção | `psql` retorna `15.3` — versão sempre nula |
| Seção "Múltiplos perfis" em `SettingsPage` lista "Em breve" mas já foi implementada | UX | Remover card da lista "Em breve" |
| Login e autenticação | Feature | Próxima grande fase |
| Cloud Sync | Feature | Depende de login |

---

## Próximo passo imediato

Corrigir os 3 bugs listados acima:

1. **Novo perfil com 0 ferramentas** — ao criar via `ProfileManagerModal`, pré-selecionar automaticamente as ferramentas com status `healthy` ou `degraded` no último scan (se existir)
2. **Contagem errada no modal** — investigar se o problema é no momento do `set()` no store ou na leitura do `profiles` array reativo
3. **Home com perfil vazio** — adicionar fallback/orientação quando `userProfile.toolIds.length === 0`
