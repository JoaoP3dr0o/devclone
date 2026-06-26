# DevClone — Checkpoint

**Data:** 2026-06-26
**Branch:** main
**Último commit:** `263c473 chore: ignore tsbuildinfo build artifacts`
**Remote:** sincronizado com origin/main

---

## Estado atual do projeto

O DevClone é um app Electron + React + TypeScript que escaneia ferramentas de desenvolvimento instaladas na máquina, calcula compatibilidade com um perfil de stack personalizável e gera recomendações. O app agora requer autenticação e se integra com uma API REST externa.

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
| SettingsPage: versão/plataforma via IPC, dados locais, toggle de scan automático | ✅ |
| Cadeia de dependências entre ferramentas (composer→php, laravel→composer, pnpm→node, bun→node) | ✅ |
| Persistência de `settings.json` com toggle `autoScan` respeitado no `StoreInitializer` | ✅ |
| Export de perfil ativo + último scan para JSON local (save dialog nativo) | ✅ |
| Import de perfil de JSON — cria novo perfil sem sobrescrever o ativo | ✅ |
| **Multi-perfis — backend:** `profiles.json` com `ProfilesStore`, auto-migração de `active-profile.json` | ✅ |
| **Multi-perfis — IPC:** `profile:get-all`, `profile:create`, `profile:delete`, `profile:set-active`, `profile:update-tools` | ✅ |
| **Multi-perfis — UI:** `ProfileManagerModal` com listagem, ativar, deletar, criar novo, perfis padrão com compat % | ✅ |
| Badge "No perfil" em ferramentas missing no `ToolList` | ✅ |
| Linha contextual no `ToolDetailsModal` para ferramentas do perfil não instaladas | ✅ |
| **Fix de 5 erros TypeScript pré-existentes** (literal union vs string em 5 arquivos) | ✅ |
| **Auth — camada main process:** `token.store`, `api.client`, `auth.service` | ✅ |
| **Auth — tela de login/cadastro:** `AuthPage` com email/senha, toggle de modo, validação, erros da API | ✅ |
| **Auth — guard:** App.tsx bloqueia todo o app até autenticação; `loadCurrentUser()` verifica token salvo no boot | ✅ |
| **Auth — Google OAuth PKCE:** servidor HTTP efêmero, `shell.openExternal`, CSRF via state, timeout 2 min | ✅ |
| **Auth — Conta no Settings:** seção com nome/email e botão "Sair" (logout → volta para AuthPage automaticamente) | ✅ |
| **Sincronização de perfis com a nuvem:** `profile.service.ts` chama `apiRequest()` — API é fonte da verdade | ✅ |
| **API de produção:** `https://api.devclone.com.br` configurada como fallback em `api.config.ts` | ✅ |
| **Validação end-to-end em produção:** login email/senha, registro, perfis na nuvem, token persistido | ✅ |
| **Build do instalador Windows:** `devclone-1.0.0-setup.exe` gerado via `npm run build:win` | ✅ |
| **Deep link `devclone://` registrado no sistema:** `setAsDefaultProtocolClient` + `electron-builder.yml` (`protocols`) | ✅ |
| **Recuperação de senha — tela "Esqueci minha senha":** campo de email, chama `POST /auth/forgot-password`, exibe confirmação | ✅ |
| **Recuperação de senha — deep link:** `devclone://reset-password?token=xxx` capturado no main process e enviado ao renderer via IPC `deep-link` | ✅ |
| **Recuperação de senha — tela de redefinição:** nova senha + confirmação, valida coincidência, chama `POST /auth/reset-password`, redireciona para login | ✅ |
| Commits organizados em inglês, GitHub sincronizado | ✅ |

---

## Integração com a API

### Infraestrutura

| Item | Detalhe |
|---|---|
| API REST (produção) | `https://api.devclone.com.br` — fallback em `src/main/config/api.config.ts` |
| API REST (dev) | `http://localhost:3333` — sobrepõe via variável de ambiente `VITE_API_URL` |
| Autenticação | JWT salvo no main process via `electron-store` (criptografado) |
| Token nunca exposto ao renderer | Fica em `src/main/services/token.store.ts` |
| Wrapper de chamadas | `apiRequest<T>()` em `src/main/services/api.client.ts` |

### `apiRequest<T>(method, path, body?, auth?)`

```ts
// Uso típico — chamada autenticada:
const data = await apiRequest<{ profiles: Profile[] }>('GET', '/profiles', undefined, true)

// Chamada pública:
const data = await apiRequest<AuthResponse>('POST', '/auth/login', { email, password })
```

- Injeta `Authorization: Bearer <token>` automaticamente quando `auth: true`
- Lança `ApiError` (com `.status: number`) se a resposta não for ok — a mensagem vem do body da API
- 204 sem corpo retorna `undefined as T`

### Endpoints de auth já integrados

| Canal IPC | Rota da API | Handler |
|---|---|---|
| `auth:register` | `POST /auth/register` | `auth.service.register` |
| `auth:login` | `POST /auth/login` | `auth.service.login` |
| `auth:google` | `POST /auth/google` | `auth.service.loginWithGoogle` |
| `auth:google-start` | — (fluxo PKCE local) | `google-oauth.service.startGoogleAuth` |
| `auth:logout` | `DELETE /auth/logout` | `auth.service.logout` |
| `auth:get-current-user` | `GET /users/me` | `auth.service.getCurrentUser` |
| `auth:is-authenticated` | — (verifica token local) | `auth.service.isAuthenticated` |
| `auth:forgot-password` | `POST /auth/forgot-password` | `auth.ipc` (inline `apiRequest`) |
| `auth:reset-password` | `POST /auth/reset-password` | `auth.ipc` (inline `apiRequest`) |

---

## Modelo de dados

### Perfis (local vs API)

```ts
// Local — persiste em profiles.json no userData
type UserProfile = {
  id: string          // deve ser o mesmo id do Profile da API após sync
  name: string
  toolIds: string[]
  createdAt?: string
  updatedAt?: string
}

type ProfilesStore = {
  version: number
  activeProfileId: string
  profiles: UserProfile[]
}

// API — rotas: GET/POST /profiles, PATCH/DELETE /profiles/:id, PATCH /profiles/:id/activate
type ApiProfile = {
  id: string
  name: string
  toolIds: string[]
  isActive: boolean   // ← mapeia para activeProfileId no store local
  userId: string      // ← não precisa chegar ao renderer
  createdAt: string
  updatedAt: string
}
```

**Mapeamento API → local:** descartar `isActive` e `userId`; o perfil com `isActive: true` vira o `activeProfileId` do store.

---

## Estrutura de arquivos relevantes

```
src/
  main/
    config/
      api.config.ts       — API_CONFIG.baseUrl (default: http://localhost:3333)
      google.config.ts    — GOOGLE_CONFIG: clientId, scopes, callbackPort (8888)
    ipc/
      auth.ipc.ts         — auth:register/login/google/google-start/logout/get-current-user/is-authenticated
      export.ipc.ts       — export:profile
      import.ipc.ts       — import:profile
      install.ipc.ts      — install:get-command, install:run-command
      platform.ipc.ts     — platform:get
      preflight.ipc.ts    — preflight:run/fix/save-pending/get-pending/clear-pending
      profile.ipc.ts      — profile:get/save (compat), profile:get-all/create/delete/set-active/update-tools
      scan.ipc.ts         — scan:environment, load:lastScan
      settings.ipc.ts     — app:getVersion/getUserDataPath/clearScanData/getSettings/saveSettings
    services/
      api.client.ts       — apiRequest<T>() + ApiError
      auth.service.ts     — register, login, loginWithGoogle, logout, getCurrentUser, isAuthenticated
      google-oauth.service.ts — startGoogleAuth(): PKCE + servidor HTTP efêmero
      token.store.ts      — saveToken/getToken/clearToken (electron-store criptografado)
      command.service.ts  — executeCommand/spawnCommand com windowsHide:true
      export.service.ts   — lê perfil ativo + lastScan, abre save dialog
      import.service.ts   — abre open dialog, valida JSON, cria novo UserProfile
      install.service.ts  — resolve install command por plataforma
      platform.service.ts — detecta SO + capabilities reais
      preflight.service.ts — checkWsl2, checkVirtualization (4 estratégias), checkCurl/php/composer
      scan.service.ts     — refreshWindowsPath (UTF-8 fix) + scanTool + checkToolDependencies
      settings.service.ts — lê/escreve settings.json no userData
      storage.service.ts  — profiles.json (ProfilesStore), last-scan.json; auto-migra active-profile.json
  preload/
    index.ts / index.d.ts — IPC bridge completo incl. auth.{register,login,google,googleStart,logout,
                            getCurrentUser,isAuthenticated} + getAllProfiles, createProfile,
                            deleteProfile, setActiveProfile, updateProfileTools,
                            exportProfile, importProfile
  renderer/src/
    store/
      useAppStore.ts      — currentUser, authLoading, loadCurrentUser, register, login,
                            loginWithGoogle, logout; profiles[], activeProfileId, loadAllProfiles,
                            createProfile, deleteProfile, setActiveProfile; setProfile() wrapper compat
    pages/
      AuthPage.tsx        — 4 modos: login, register, forgot-password, reset-password;
                            deep link via window.electron.onDeepLink; botão Google
      Home.tsx            — dashboard + empty state para primeiro uso
      ToolsPage.tsx       — catálogo com filtros, busca, modal de detalhes
      ProfilePage.tsx     — perfil ativo (checkboxes, nome, banner), ProfileManagerModal
      SettingsPage.tsx    — seção Conta (nome/email/logout), versão, dados locais, export/import, autoScan
    components/
      ToolList.tsx        — badge "No perfil" para ferramentas missing no perfil ativo
      ToolDetailsModal.tsx — linha contextual quando ferramenta é do perfil mas não instalada
    hooks/
      useActiveProfile.ts — wrapper do store
      useEnvironmentScan.ts — wrapper do store
    App.tsx               — guard de auth (authLoading → AuthPage → app); StoreInitializer
                            só roda quando currentUser existe
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
| Instalador sem code signing | Distribuição | Windows SmartScreen bloqueia o `.exe` para usuários novos |

---

## Marco de produção (2026-06-26)

O app está em produção e funcional end-to-end:
- Login, registro e sincronização de perfis apontam para `https://api.devclone.com.br`
- Instalador `devclone-1.0.0-setup.exe` gerado e assinado (self-signed via `signtool.exe`)
- Fluxo validado manualmente: autenticação, criação de perfil, scan, persistência de token
- Recuperação de senha end-to-end: email → deep link `devclone://reset-password?token=xxx` → redefinição

---

## Pendente

| Item | Prioridade | Notas |
|---|---|---|
| **Google OAuth em produção** | Alta | Callback URL precisa ser registrada no Google Cloud Console apontando para produção |
| **Code signing (certificado EV)** | Média | Elimina o bloqueio do Windows SmartScreen; requer compra de certificado |
| **Landing page** | Média | Página de marketing / download em `devclone.com.br` |
| **Suporte Linux e macOS** | Média | Builds e testes nas outras plataformas-alvo |
| **Validação de senha com feedback visual** | Baixa | Indicador de força da senha, requisitos visíveis ao digitar (polimento UX) |
| **Auto-update** | Baixa | `electron-updater` com `blockmap` já gerado — falta configurar o servidor de update |

---

## Próximo passo

Suporte Linux e macOS — builds nas outras plataformas-alvo e validação do deep link `devclone://` em cada SO.
