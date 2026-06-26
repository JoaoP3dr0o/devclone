import { useEffect, useState } from 'react'

import { DEFAULT_USER_PROFILE } from '@shared/profiles/userProfile.utils'
import { useAppStore } from '../store/useAppStore'

type AppSettings = { autoScan: boolean }

function SectionHeader({ title }: { title: string }): React.JSX.Element {
  return (
    <h2
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        margin: '0 0 12px'
      }}
    >
      {title}
    </h2>
  )
}

function Card({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div
      style={{
        border: '1px solid rgba(148, 163, 184, 0.12)',
        borderRadius: 14,
        background: 'rgba(15, 23, 42, 0.5)',
        overflow: 'hidden',
        marginBottom: 32
      }}
    >
      {children}
    </div>
  )
}

function Row({
  label,
  description,
  last = false,
  children
}: {
  label: string
  description?: string
  last?: boolean
  children?: React.ReactNode
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px 20px',
        gap: 16,
        borderBottom: last ? 'none' : '1px solid rgba(148, 163, 184, 0.08)'
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 500 }}>{label}</div>
        {description && (
          <div
            style={{
              color: '#475569',
              fontSize: 12,
              marginTop: 3,
              wordBreak: 'break-all'
            }}
          >
            {description}
          </div>
        )}
      </div>
      {children && <div style={{ flexShrink: 0 }}>{children}</div>}
    </div>
  )
}

function ActionButton({
  label,
  loading = false,
  variant = 'default',
  onClick
}: {
  label: string
  loading?: boolean
  variant?: 'default' | 'danger'
  onClick: () => void
}): React.JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        border:
          variant === 'danger'
            ? '1px solid rgba(251, 113, 133, 0.3)'
            : '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: 8,
        padding: '7px 14px',
        background:
          variant === 'danger' ? 'rgba(251, 113, 133, 0.1)' : 'rgba(30, 41, 59, 0.8)',
        color: variant === 'danger' ? '#fca5a5' : '#cbd5e1',
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        fontSize: 13,
        whiteSpace: 'nowrap'
      }}
    >
      {label}
    </button>
  )
}

function Toggle({
  checked,
  onChange
}: {
  checked: boolean
  onChange: (value: boolean) => void
}): React.JSX.Element {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 999,
        border: 'none',
        background: checked ? '#2563eb' : 'rgba(148, 163, 184, 0.2)',
        cursor: 'pointer',
        position: 'relative',
        flexShrink: 0
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.15s',
          display: 'block'
        }}
      />
    </button>
  )
}

function ComingSoonCard({ label }: { label: string }): React.JSX.Element {
  return (
    <div
      style={{
        border: '1px solid rgba(148, 163, 184, 0.08)',
        borderRadius: 12,
        padding: '14px 18px',
        background: 'rgba(15, 23, 42, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
      }}
    >
      <span style={{ color: '#475569', fontSize: 14 }}>{label}</span>
      <span
        style={{
          padding: '3px 8px',
          borderRadius: 999,
          background: 'rgba(148, 163, 184, 0.08)',
          color: '#475569',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}
      >
        Em breve
      </span>
    </div>
  )
}

function SettingsPage(): React.JSX.Element {
  const { setProfile, clearScanData, loadProfile, currentUser, logout } = useAppStore()

  const [version, setVersion] = useState('...')
  const [platform, setPlatform] = useState('Detectando...')
  const [dataPath, setDataPath] = useState('...')
  const [settings, setSettings] = useState<AppSettings>({ autoScan: true })

  const [loggingOut, setLoggingOut] = useState(false)
  const [clearingData, setClearingData] = useState(false)
  const [clearDataFeedback, setClearDataFeedback] = useState<string | null>(null)
  const [resettingProfile, setResettingProfile] = useState(false)
  const [resetProfileFeedback, setResetProfileFeedback] = useState<string | null>(null)

  const [exporting, setExporting] = useState(false)
  const [exportFeedback, setExportFeedback] = useState<{ ok: boolean; message: string } | null>(null)
  const [importing, setImporting] = useState(false)
  const [importFeedback, setImportFeedback] = useState<{ ok: boolean; message: string } | null>(null)
  const [ignoredWarning, setIgnoredWarning] = useState<string | null>(null)

  useEffect(() => {
    window.electron.getVersion().then(setVersion).catch(() => setVersion('—'))
    window.electron
      .getPlatform()
      .then((p) => setPlatform(p.name))
      .catch(() => setPlatform('—'))
    window.electron.getUserDataPath().then(setDataPath).catch(() => setDataPath('—'))
    window.electron
      .getSettings()
      .then(setSettings)
      .catch(() => {})
  }, [])

  async function handleLogout(): Promise<void> {
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }

  async function handleClearData(): Promise<void> {
    setClearingData(true)
    await clearScanData()
    setClearingData(false)
    setClearDataFeedback('Dados de scan removidos')
    setTimeout(() => setClearDataFeedback(null), 2500)
  }

  async function handleResetProfile(): Promise<void> {
    setResettingProfile(true)
    await setProfile(DEFAULT_USER_PROFILE)
    setResettingProfile(false)
    setResetProfileFeedback('Perfil resetado')
    setTimeout(() => setResetProfileFeedback(null), 2500)
  }

  async function handleExport(): Promise<void> {
    setExporting(true)
    setExportFeedback(null)
    const result = await window.electron.exportProfile()
    setExporting(false)
    if (result.cancelled) return
    if (result.success && result.path) {
      const filename = result.path.split(/[/\\]/).pop() ?? result.path
      setExportFeedback({ ok: true, message: `Salvo em: ${filename}` })
      setTimeout(() => setExportFeedback(null), 2000)
    } else if (!result.success && result.error) {
      setExportFeedback({ ok: false, message: result.error })
    }
  }

  async function handleImport(): Promise<void> {
    setImporting(true)
    setImportFeedback(null)
    setIgnoredWarning(null)
    const result = await window.electron.importProfile()
    setImporting(false)
    if (result.cancelled) return
    if (result.success && result.profile) {
      void loadProfile()
      setImportFeedback({ ok: true, message: `Perfil '${result.profile.name}' importado com sucesso` })
      setTimeout(() => setImportFeedback(null), 2000)
      if (result.ignoredTools && result.ignoredTools.length > 0) {
        setIgnoredWarning(
          `${result.ignoredTools.length} ferramenta(s) do arquivo não foram reconhecidas e foram ignoradas.`
        )
      }
    } else if (!result.success && result.error) {
      setImportFeedback({ ok: false, message: result.error })
    }
  }

  async function handleAutoScanChange(value: boolean): Promise<void> {
    const next: AppSettings = { ...settings, autoScan: value }
    setSettings(next)
    await window.electron.saveSettings(next)
  }

  return (
    <section style={{ padding: 32, maxWidth: 680 }}>
      <h1 style={{ fontSize: 32, lineHeight: 1.1, margin: '0 0 6px', color: '#f1f5f9' }}>
        Configurações
      </h1>
      <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 36px' }}>
        Preferências locais do DevClone
      </p>

      {/* Conta */}
      <SectionHeader title="Conta" />
      <Card>
        <Row
          label={currentUser?.name ?? ''}
          description={currentUser?.email ?? ''}
          last
        >
          <ActionButton
            label={loggingOut ? 'Saindo...' : 'Sair'}
            loading={loggingOut}
            variant="danger"
            onClick={() => void handleLogout()}
          />
        </Row>
      </Card>

      {/* Sobre o app */}
      <SectionHeader title="Sobre o app" />
      <Card>
        <Row label="Nome">
          <span style={{ color: '#94a3b8', fontSize: 13 }}>DevClone</span>
        </Row>
        <Row label="Versão">
          <span style={{ color: '#94a3b8', fontSize: 13 }}>v{version}</span>
        </Row>
        <Row label="Plataforma" last>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>{platform}</span>
        </Row>
      </Card>

      {/* Dados locais */}
      <SectionHeader title="Dados locais" />
      <Card>
        <Row label="Diretório de dados" description={dataPath} />
        <Row
          label="Limpar dados de scan"
          description="Remove o resultado do último scan salvo localmente"
        >
          <ActionButton
            label={clearingData ? 'Limpando...' : (clearDataFeedback ?? 'Limpar dados de scan')}
            loading={clearingData}
            variant="danger"
            onClick={() => void handleClearData()}
          />
        </Row>
        <Row
          label="Resetar perfil"
          description="Volta ao perfil padrão: Meu perfil"
        >
          <ActionButton
            label={resettingProfile ? 'Resetando...' : (resetProfileFeedback ?? 'Resetar perfil')}
            loading={resettingProfile}
            onClick={() => void handleResetProfile()}
          />
        </Row>
        <Row label="Exportar perfil" description="Salva seu perfil e ambiente em um arquivo .json">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <ActionButton
              label={exporting ? 'Exportando...' : 'Exportar'}
              loading={exporting}
              onClick={() => void handleExport()}
            />
            {exportFeedback && (
              <span
                style={{
                  fontSize: 11,
                  color: exportFeedback.ok ? '#4ade80' : '#fca5a5',
                  maxWidth: 200,
                  textAlign: 'right'
                }}
              >
                {exportFeedback.message}
              </span>
            )}
          </div>
        </Row>
        <Row
          label="Importar perfil"
          description="Restaura um perfil exportado de outra máquina"
          last
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <ActionButton
              label={importing ? 'Importando...' : 'Importar'}
              loading={importing}
              onClick={() => void handleImport()}
            />
            {importFeedback && (
              <span
                style={{
                  fontSize: 11,
                  color: importFeedback.ok ? '#4ade80' : '#fca5a5',
                  maxWidth: 200,
                  textAlign: 'right'
                }}
              >
                {importFeedback.message}
              </span>
            )}
            {ignoredWarning && (
              <span style={{ fontSize: 11, color: '#fbbf24', maxWidth: 200, textAlign: 'right' }}>
                {ignoredWarning}
              </span>
            )}
          </div>
        </Row>
      </Card>

      {/* Scan automático */}
      <SectionHeader title="Scan automático" />
      <Card>
        <Row
          label="Escanear ao abrir o app"
          description="Executa o scan do ambiente automaticamente ao iniciar"
          last
        >
          <Toggle checked={settings.autoScan} onChange={(v) => void handleAutoScanChange(v)} />
        </Row>
      </Card>

      {/* Em breve */}
      <SectionHeader title="Em breve" />
      <div style={{ display: 'grid', gap: 8 }}>
        <ComingSoonCard label="Suporte Linux — Instalação de ferramentas em distribuições Ubuntu, Fedora e Arch" />
        <ComingSoonCard label="Suporte macOS — Instalação de ferramentas via Homebrew" />
        <ComingSoonCard label="Marketplace de perfis — Compartilhe e descubra perfis da comunidade" />
        <ComingSoonCard label="CLI companion — Gerencie seu ambiente pelo terminal" />
      </div>
    </section>
  )
}

export default SettingsPage
