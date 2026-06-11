import { useEffect, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'

import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import Home from './pages/Home'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import ToolsPage from './pages/ToolsPage'
import { useAppStore } from './store/useAppStore'
import { toolsCatalog } from '@shared/tools/catalog'

const APP_FONT =
  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

// Inicializa dados locais (perfis + scan) — só roda quando autenticado
function StoreInitializer(): null {
  useEffect(() => {
    void useAppStore.getState().loadAllProfiles()
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
  }, [])
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
