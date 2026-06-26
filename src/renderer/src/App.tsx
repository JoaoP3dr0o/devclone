import { useEffect, useRef, useState } from 'react'
import type { UserProfile } from '@shared/profiles/profile.types'
import { HashRouter, Route, Routes } from 'react-router-dom'

import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import Home from './pages/Home'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import ToolsPage from './pages/ToolsPage'
import { useAppStore } from './store/useAppStore'
import { toolsCatalog } from '@shared/tools/catalog'
import { UpdateBanner } from './components/UpdateBanner'

const APP_FONT =
  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

interface MigrationModalProps {
  profiles: UserProfile[]
  onSend: () => Promise<void>
  onSkip: () => Promise<void>
}

function MigrationModal({ profiles, onSend, onSkip }: MigrationModalProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: APP_FONT,
      }}
    >
      <div
        style={{
          background: '#111827',
          border: '1px solid #1e293b',
          borderRadius: 12,
          padding: '28px 32px',
          maxWidth: 400,
          width: '90%',
        }}
      >
        <p style={{ color: '#e2e8f0', fontSize: 15, margin: '0 0 8px' }}>
          Encontramos {profiles.length} perfil{profiles.length > 1 ? 'is' : ''} neste computador.
        </p>
        <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 24px' }}>
          Deseja enviar para sua conta na nuvem?
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            disabled={loading}
            onClick={() => void onSkip()}
            style={{
              border: '1px solid #334155',
              borderRadius: 8,
              padding: '8px 16px',
              background: 'transparent',
              color: '#94a3b8',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 13,
            }}
          >
            Começar do zero
          </button>
          <button
            disabled={loading}
            onClick={() => {
              setLoading(true)
              void onSend().catch(() => setLoading(false))
            }}
            style={{
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              background: '#2563eb',
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {loading ? 'Enviando...' : 'Enviar para a nuvem'}
          </button>
        </div>
      </div>
    </div>
  )
}

function runScan(): void {
  window.electron
    .getSettings()
    .then((settings) => {
      if (settings.autoScan) {
        void useAppStore.getState().triggerScan()
      } else {
        void useAppStore.getState().loadLastScan()
      }
    })
    .catch(() => {
      void useAppStore.getState().loadLastScan()
    })
}

// Inicializa perfis (nuvem) e scan — só roda quando autenticado
function StoreInitializer(): React.JSX.Element | null {
  const [migrationProfiles, setMigrationProfiles] = useState<UserProfile[] | null>(null)
  const [ready, setReady] = useState(false)
  const checked = useRef(false)

  useEffect(() => {
    if (checked.current) return
    checked.current = true

    async function checkMigration(): Promise<void> {
      try {
        const alreadyMigrated = await window.electron.checkMigrated()
        if (!alreadyMigrated) {
          const localStore = await window.electron.getLocalProfilesRaw()
          if (localStore && localStore.profiles.length > 0) {
            const cloudStore = await window.electron.cloudProfile.fetchAll()
            if (cloudStore.profiles.length === 0) {
              setMigrationProfiles(localStore.profiles)
              return
            }
          }
        }
      } catch {
        // erro na checagem — prossegue normalmente
      }
      setReady(true)
    }

    void checkMigration()
  }, [])

  useEffect(() => {
    if (!ready) return
    void useAppStore.getState().loadAllProfiles()
    runScan()
  }, [ready])

  if (migrationProfiles) {
    return (
      <MigrationModal
        profiles={migrationProfiles}
        onSend={async () => {
          for (const profile of migrationProfiles) {
            await window.electron.cloudProfile.create(profile.name, profile.toolIds)
          }
          await window.electron.setMigrated()
          setMigrationProfiles(null)
          setReady(true)
        }}
        onSkip={async () => {
          await window.electron.setMigrated()
          setMigrationProfiles(null)
          setReady(true)
        }}
      />
    )
  }

  return null
}

function PendingInstallsBanner(): React.JSX.Element | null {
  const [pendingIds, setPendingIds] = useState<string[]>([])
  const [installing, setInstalling] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    window.electron.preflight
      .getPending()
      .then((ids) => setPendingIds(ids))
      .catch(() => {})
  }, [])

  if (pendingIds.length === 0 || dismissed) return null

  const pendingNames = pendingIds
    .map((id) => toolsCatalog.find((t) => t.id === id)?.name ?? id)
    .join(', ')

  async function handleContinue(): Promise<void> {
    setInstalling(true)
    for (const toolId of pendingIds) {
      await window.electron.runInstallCommand(toolId)
    }
    await window.electron.preflight.clearPending()
    await useAppStore.getState().triggerScan()
    setInstalling(false)
    setDismissed(true)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 80,
        background: 'rgba(37, 99, 235, 0.95)',
        color: '#fff',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        fontSize: 14
      }}
    >
      <span>
        {installing
          ? `Instalando ${pendingNames}...`
          : `Continuando instalação de: ${pendingNames}`}
      </span>
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        {!installing && (
          <button
            onClick={() => void handleContinue()}
            style={{
              border: 'none',
              borderRadius: 8,
              padding: '6px 14px',
              background: '#fff',
              color: '#1d4ed8',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            Continuar instalação
          </button>
        )}
        {!installing && (
          <button
            onClick={() => setDismissed(true)}
            style={{
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: 8,
              padding: '6px 14px',
              background: 'transparent',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            Ignorar
          </button>
        )}
      </div>
    </div>
  )
}

function AuthLoadingScreen(): React.JSX.Element {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at top left, rgba(37, 99, 235, 0.18), transparent 32%), #080d18',
        color: '#475569',
        fontFamily: APP_FONT,
        fontSize: 14,
      }}
    >
      Verificando sessão...
    </div>
  )
}

function App(): React.JSX.Element {
  const currentUser = useAppStore((s) => s.currentUser)
  const authLoading = useAppStore((s) => s.authLoading)

  useEffect(() => {
    void useAppStore.getState().loadCurrentUser()
  }, [])

  // Reset route to / whenever the user is not logged in, so the next
  // login always lands on Home regardless of which page was active before.
  useEffect(() => {
    if (!authLoading && currentUser === null) {
      window.location.hash = '#/'
    }
  }, [currentUser, authLoading])

  if (authLoading) {
    return <AuthLoadingScreen />
  }

  if (!currentUser) {
    return <AuthPage />
  }

  return (
    <HashRouter>
      <StoreInitializer />
      <PendingInstallsBanner />
      <UpdateBanner />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}

export default App
