import { useEffect, useRef, useState } from 'react'

import PreflightModal from './PreflightModal'

import { getToolInsight, getToolInsightMessage } from '@shared/tools/insights'
import { toolsCatalog } from '@shared/tools/catalog'
import { mockTools } from '../data/mockTools'
import { useEnvironmentScan } from '../hooks/useEnvironmentScan'
import { useAppStore } from '../store/useAppStore'
import type { DevTool, DevToolId, MissingDep } from '../types/tools'

import StatusBadge from './StatusBadge'

type InstallPhase = 'idle' | 'confirm' | 'running' | 'done'
type InstallResult = { success: boolean; exitCode?: number; error?: string }

type ToolDetailsModalProps = {
  tool: DevTool | null
  onClose: () => void
  onInstallSuccess?: () => void
  onOpenTool?: (toolId: DevToolId) => void
}

function getStatusInsight(tool: DevTool): string {
  if (tool.status === 'pending') return 'Scan em andamento. Aguarde para ver o diagnóstico atualizado.'
  if (tool.status === 'unverified') return 'Ferramenta não verificada neste ambiente.'
  return getToolInsightMessage(tool.id, tool.status)
}

function classifyLine(line: string): 'error' | 'warning' | 'success' | 'info' {
  if (/error|failed|falha|não foi possível/i.test(line)) return 'error'
  if (/warn|aviso/i.test(line)) return 'warning'
  if (/success|conclu|instalado com êxito|verificado com êxito|extraído com êxito|instalado com sucesso/i.test(line)) return 'success'
  return 'info'
}

const LINE_COLORS = { error: '#ff7b72', warning: '#d29922', success: '#3fb950', info: '#c9d1d9' }
const LINE_ICONS = { error: '✗', warning: '⚠', success: '✓', info: '›' }

function ToolDetailsModal({
  tool,
  onClose,
  onInstallSuccess,
  onOpenTool
}: ToolDetailsModalProps): React.JSX.Element | null {
  const { scanResult, scanEnvironment } = useEnvironmentScan()
  const userProfile = useAppStore((s) => s.userProfile)
  const activeProfileId = useAppStore((s) => s.activeProfileId)
  const updateProfileTools = useAppStore((s) => s.updateProfileTools)
  const [installCommand, setInstallCommand] = useState<string | null>(null)
  const [installPhase, setInstallPhase] = useState<InstallPhase>('idle')
  const [outputLog, setOutputLog] = useState<string[]>([])
  const [installResult, setInstallResult] = useState<InstallResult | null>(null)
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null)
  const [installProgress, setInstallProgress] = useState<number | null>(null)
  const [showPreflight, setShowPreflight] = useState(false)
  const [platformId, setPlatformId] = useState<string>('windows')
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.electron
      .getPlatform()
      .then((p) => setPlatformId(p.id))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!tool) {
      setInstallCommand(null)
      return
    }

    let cancelled = false

    window.electron
      .getInstallCommand(tool.id)
      .then((command) => {
        if (!cancelled) setInstallCommand(command)
      })
      .catch(() => {
        if (!cancelled) setInstallCommand(null)
      })

    return () => {
      cancelled = true
    }
  }, [tool?.id])

  useEffect(() => {
    setInstallPhase('idle')
    setOutputLog([])
    setInstallResult(null)
    setPendingPrompt(null)
    setInstallProgress(null)
  }, [tool?.id])

  useEffect(() => {
    return () => {
      window.electron.removeInstallListeners()
    }
  }, [])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [outputLog])

  if (!tool) return null

  const scannedTool = scanResult?.tools.find((t) => t.id === tool.id)
  const degradedDeps: MissingDep[] =
    tool.status === 'degraded' ? (scannedTool?.missingDeps ?? []) : []
  const isInProfile = userProfile.toolIds.includes(tool.id)

  async function handleFix(depId: string): Promise<void> {
    await window.electron.preflight.fix(depId)
    await scanEnvironment()
  }

  const catalogItem = toolsCatalog.find((c) => c.id === tool.id)
  const missingDeps = (catalogItem?.requires ?? [])
    .map((depId) => {
      const base = mockTools.find((t) => t.id === depId)
      if (!base) return null
      const scanned = scanResult?.tools.find((t) => t.id === depId)
      const status = scanned ? scanned.status : base.status
      return status === 'missing' ? { id: depId as DevToolId, name: base.name } : null
    })
    .filter((d): d is { id: DevToolId; name: string } => d !== null)

  const insight = getToolInsight(tool.id)
  const installCommandPreview = installCommand ?? 'Indisponível para esta plataforma'

  async function handleRunInstall(): Promise<void> {
    if (!tool || !installCommand) return

    setInstallPhase('running')
    setOutputLog([])
    setInstallResult(null)
    setPendingPrompt(null)
    setInstallProgress(null)

    window.electron.onInstallOutput((chunk) => {
      if (chunk.type === 'progress') {
        setInstallProgress(chunk.progress)
        return
      }
      if (chunk.type !== 'prompt') {
        setOutputLog((prev) => [...prev, chunk.text])
      }
    })

    window.electron.onInstallPrompt((text) => {
      setPendingPrompt(text)
    })

    try {
      const result = await window.electron.runInstallCommand(tool.id)
      setInstallResult(result)
    } catch (err) {
      setInstallResult({ success: false, error: String(err) })
    } finally {
      setInstallPhase('done')
      setPendingPrompt(null)
      setInstallProgress(null)
      window.electron.removeInstallListeners()
    }
  }

  function handleRescanAndClose(): void {
    onInstallSuccess?.()
    onClose()
  }

  const isRunningOrDone = installPhase === 'running' || installPhase === 'done'

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(2, 6, 23, 0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes de ${tool.name}`}
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 'min(620px, 100%)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          borderRadius: 20,
          background: 'rgba(15, 23, 42, 0.98)',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.42)',
          color: '#e5e7eb',
          overflow: 'hidden',
          maxHeight: 'calc(100vh - 48px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 22px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.14)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'flex-start',
            flexShrink: 0
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>{tool.name}</h2>
              <StatusBadge status={tool.status} />
            </div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 6 }}>{tool.category}</div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => {
                const newToolIds = isInProfile
                  ? userProfile.toolIds.filter((id) => id !== tool.id)
                  : [...userProfile.toolIds, tool.id]
                void updateProfileTools(activeProfileId, newToolIds)
              }}
              style={{
                border: isInProfile ? 'none' : '1px solid rgba(148,163,184,0.22)',
                borderRadius: 10,
                background: isInProfile ? '#2563eb' : 'transparent',
                color: isInProfile ? '#fff' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: 700,
                padding: '8px 12px',
                fontSize: 13,
                whiteSpace: 'nowrap'
              }}
            >
              {isInProfile ? '✓ No perfil' : '+ Adicionar ao perfil'}
            </button>
            <button
              onClick={onClose}
              style={{
                border: '1px solid rgba(148, 163, 184, 0.22)',
                borderRadius: 10,
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#e5e7eb',
                cursor: 'pointer',
                fontWeight: 700,
                padding: '8px 10px',
                flexShrink: 0
              }}
            >
              Fechar
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 22, display: 'grid', gap: 18, overflowY: 'auto' }}>
          {!isRunningOrDone && (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 12
                }}
              >
                <InfoBlock label="Versão atual" value={tool.version ?? 'Não detectada'} />
                <InfoBlock label="Versão mínima" value={tool.minimumVersion ?? 'Não definida'} />
              </div>

              <InfoBlock label="Install command" value={installCommandPreview} />

              {degradedDeps.length > 0 && (
                <div style={{ display: 'grid', gap: 8 }}>
                  {degradedDeps.map((dep) => (
                    <div
                      key={dep.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 12,
                        background: 'rgba(251, 191, 36, 0.08)',
                        border: '1px solid rgba(251, 191, 36, 0.22)'
                      }}
                    >
                      <span style={{ color: '#fcd34d', fontSize: 13 }}>⚠️ {dep.userMessage}</span>
                      {dep.autoFixable && (
                        <button
                          onClick={() => void handleFix(dep.id)}
                          style={{
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            borderRadius: 8,
                            padding: '5px 12px',
                            background: 'rgba(251, 191, 36, 0.12)',
                            color: '#fcd34d',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Corrigir automaticamente
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isInProfile && tool.status === 'missing' && (
                <div
                  style={{
                    fontSize: 13,
                    color: 'rgba(148,163,184,0.7)',
                    padding: '8px 0',
                    borderTop: '1px solid rgba(148,163,184,0.1)'
                  }}
                >
                  ℹ️ Esta ferramenta faz parte do perfil{' '}
                  <strong>{userProfile.name}</strong>{' '}
                  mas ainda não está instalada nesta máquina.
                </div>
              )}

              <div
                style={{
                  border: '1px solid rgba(147, 197, 253, 0.16)',
                  borderRadius: 16,
                  padding: 16,
                  background: 'rgba(37, 99, 235, 0.1)'
                }}
              >
                <div style={{ color: '#93c5fd', fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
                  INSIGHT
                </div>
                <p style={{ margin: 0, color: '#dbeafe', lineHeight: 1.6, fontSize: 14 }}>
                  {getStatusInsight(tool)}
                </p>
              </div>

              <div>
                <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
                  DESCRIÇÃO
                </div>
                <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7, fontSize: 14 }}>
                  {insight.longDescription ?? tool.description}
                </p>
              </div>

              {insight.documentationUrl && (
                <a
                  href={insight.documentationUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#93c5fd', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
                >
                  Documentação
                </a>
              )}
            </>
          )}

          {/* Install section */}
          {tool.status === 'missing' && (
            <>
              {missingDeps.length > 0 && installPhase === 'idle' && (
                <div style={{ display: 'grid', gap: 8 }}>
                  {missingDeps.map((dep) => (
                    <div
                      key={dep.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 12,
                        background: 'rgba(251, 191, 36, 0.08)',
                        border: '1px solid rgba(251, 191, 36, 0.22)'
                      }}
                    >
                      <span style={{ color: '#fcd34d', fontSize: 13 }}>
                        ⚠️ Requer {dep.name} instalado primeiro
                      </span>
                      {onOpenTool && (
                        <button
                          onClick={() => onOpenTool(dep.id)}
                          style={{
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            borderRadius: 8,
                            padding: '5px 12px',
                            background: 'rgba(251, 191, 36, 0.12)',
                            color: '#fcd34d',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Ver {dep.name}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <InstallSection
                phase={installPhase}
                command={installCommand}
                outputLog={outputLog}
                result={installResult}
                logEndRef={logEndRef}
                pendingPrompt={pendingPrompt}
                installProgress={installProgress}
                onRequestInstall={() => setShowPreflight(true)}
                onConfirm={handleRunInstall}
                onCancel={() => setInstallPhase('idle')}
                onRescan={handleRescanAndClose}
                onDismissPrompt={() => setPendingPrompt(null)}
              />

              {showPreflight && tool && (
                <PreflightModal
                  toolId={tool.id}
                  toolName={tool.name}
                  platform={platformId}
                  onProceed={() => {
                    setShowPreflight(false)
                    void handleRunInstall()
                  }}
                  onClose={() => setShowPreflight(false)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

type InstallSectionProps = {
  phase: InstallPhase
  command: string | null
  outputLog: string[]
  result: InstallResult | null
  logEndRef: React.RefObject<HTMLDivElement | null>
  pendingPrompt: string | null
  installProgress: number | null
  onRequestInstall: () => void
  onConfirm: () => void
  onCancel: () => void
  onRescan: () => void
  onDismissPrompt: () => void
}

function InstallSection({
  phase,
  command,
  outputLog,
  result,
  logEndRef,
  pendingPrompt,
  installProgress,
  onRequestInstall,
  onConfirm,
  onCancel,
  onRescan,
  onDismissPrompt
}: InstallSectionProps): React.JSX.Element {
  if (phase === 'idle') {
    return (
      <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.14)', paddingTop: 16 }}>
        <button
          onClick={onRequestInstall}
          disabled={!command}
          style={{
            border: 'none',
            borderRadius: 10,
            padding: '10px 18px',
            background: command ? '#2563eb' : 'rgba(148, 163, 184, 0.2)',
            color: command ? '#fff' : '#64748b',
            fontWeight: 700,
            cursor: command ? 'pointer' : 'not-allowed',
            fontSize: 14
          }}
        >
          Instalar
        </button>
      </div>
    )
  }

  if (phase === 'confirm') {
    return (
      <div
        style={{
          borderTop: '1px solid rgba(148, 163, 184, 0.14)',
          paddingTop: 16,
          display: 'grid',
          gap: 14
        }}
      >
        <div style={{ color: '#94a3b8', fontSize: 13 }}>
          O seguinte comando será executado no seu terminal:
        </div>
        <pre
          style={{
            margin: 0,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(2, 6, 23, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.16)',
            color: '#a5f3fc',
            fontSize: 13,
            fontFamily: 'monospace',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}
        >
          {command}
        </pre>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onConfirm}
            style={{
              border: 'none',
              borderRadius: 10,
              padding: '10px 18px',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Executar
          </button>
          <button
            onClick={onCancel}
            style={{
              border: '1px solid rgba(148, 163, 184, 0.22)',
              borderRadius: 10,
              padding: '10px 18px',
              background: 'transparent',
              color: '#94a3b8',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  const isDone = phase === 'done'
  const lines = outputLog.join('').split('\n').filter((line) => line.trim().length > 0)

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {isDone && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            {result?.success ? 'Instalação concluída' : 'Falha na instalação'}
          </span>
          <span
            style={{
              fontSize: 12,
              padding: '2px 8px',
              borderRadius: 6,
              fontWeight: 700,
              background: result?.success
                ? 'rgba(34, 197, 94, 0.15)'
                : 'rgba(251, 113, 133, 0.15)',
              color: result?.success ? '#4ade80' : '#fda4af'
            }}
          >
            {result?.success ? 'OK' : `exit ${result?.exitCode ?? 1}`}
          </span>
        </div>
      )}

      {installProgress !== null && (
        <div style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: '#58a6ff', fontSize: 12 }}>⬇ Baixando...</span>
            <span style={{ color: '#8b949e', fontSize: 12 }}>{installProgress}%</span>
          </div>
          <div style={{ background: '#30363d', borderRadius: 4, height: 6, overflow: 'hidden' }}>
            <div
              style={{
                background: 'linear-gradient(90deg, #1f6feb, #58a6ff)',
                height: '100%',
                width: `${installProgress}%`,
                transition: 'width 0.3s ease',
                borderRadius: 4
              }}
            />
          </div>
        </div>
      )}

      {pendingPrompt !== null && (
        <div
          style={{
            background: '#1c2128',
            border: '1px solid #d29922',
            borderRadius: 8,
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
        >
          <div style={{ color: '#d29922', fontSize: 13, fontFamily: 'monospace' }}>
            ⚠ O instalador está aguardando sua confirmação:
          </div>
          <div style={{ color: '#c9d1d9', fontSize: 12, fontFamily: 'monospace' }}>
            {pendingPrompt}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                void window.electron.writeToStdin('Y\n')
                onDismissPrompt()
              }}
              style={{
                border: 'none',
                borderRadius: 8,
                padding: '6px 14px',
                background: '#2563eb',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              ✓ Sim
            </button>
            <button
              onClick={() => {
                void window.electron.writeToStdin('N\n')
                onDismissPrompt()
              }}
              style={{
                border: '1px solid rgba(148, 163, 184, 0.22)',
                borderRadius: 8,
                padding: '6px 14px',
                background: 'transparent',
                color: '#94a3b8',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              ✗ Não
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          background: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: 8,
          padding: 12,
          fontFamily: 'monospace',
          fontSize: 13,
          maxHeight: 300,
          overflowY: 'auto'
        }}
      >
        {!isDone && (
          <div style={{ color: '#58a6ff', marginBottom: 8, fontSize: 12 }}>
            ⟳ Instalando...
          </div>
        )}
        {lines.length === 0 && isDone && (
          <span style={{ color: '#8b949e' }}>(sem output)</span>
        )}
        {lines.map((line, i) => {
          const type = classifyLine(line)
          return (
            <div
              key={i}
              style={{ color: LINE_COLORS[type], display: 'flex', gap: 8, lineHeight: 1.5 }}
            >
              <span style={{ opacity: 0.7, flexShrink: 0 }}>{LINE_ICONS[type]}</span>
              <span style={{ wordBreak: 'break-all' }}>{line}</span>
            </div>
          )
        })}
        <div ref={logEndRef} />
      </div>

      {isDone && (
        <div style={{ display: 'flex', gap: 10 }}>
          {result?.success && (
            <button
              onClick={onRescan}
              style={{
                border: 'none',
                borderRadius: 10,
                padding: '10px 18px',
                background: '#2563eb',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              Re-escanear e fechar
            </button>
          )}
          {!result?.success && result?.error && (
            <div
              style={{
                fontSize: 12,
                color: '#fda4af',
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(251, 113, 133, 0.1)',
                border: '1px solid rgba(251, 113, 133, 0.2)'
              }}
            >
              {result.error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div
      style={{
        border: '1px solid rgba(148, 163, 184, 0.14)',
        borderRadius: 14,
        padding: 14,
        background: 'rgba(2, 6, 23, 0.22)'
      }}
    >
      <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>{label}</div>
      <div style={{ color: '#e5e7eb', fontWeight: 800 }}>{value}</div>
    </div>
  )
}

export default ToolDetailsModal
