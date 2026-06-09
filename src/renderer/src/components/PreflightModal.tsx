import { useEffect, useState } from 'react'

import type { PreflightCheck, PreflightResult } from '@shared/tools/preflight.types'

type Phase = 'checking' | 'all-ok' | 'action-required' | 'reboot-required'

type PreflightModalProps = {
  toolId: string
  toolName: string
  platform: string
  onProceed: () => void
  onClose: () => void
}

function CheckRow({
  check,
  fixing,
  onFix
}: {
  check: PreflightCheck
  fixing: boolean
  onFix: (checkId: string) => void
}): React.JSX.Element {
  const isOk = check.status === 'ok'
  const isManual = check.status === 'manual-required' || (check.status === 'missing' && !check.autoFixable)
  const needsFix = check.status === 'missing' && check.autoFixable

  let icon = '✅'
  let labelColor = '#4ade80'
  if (fixing) {
    icon = '🔄'
    labelColor = '#93c5fd'
  } else if (isManual) {
    icon = '⚠️'
    labelColor = '#fcd34d'
  } else if (needsFix) {
    icon = '❌'
    labelColor = '#fda4af'
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: 8,
        padding: '12px 14px',
        borderRadius: 12,
        background: isOk
          ? 'rgba(74, 222, 128, 0.06)'
          : isManual
            ? 'rgba(251, 191, 36, 0.07)'
            : 'rgba(251, 113, 133, 0.07)',
        border: `1px solid ${
          isOk
            ? 'rgba(74, 222, 128, 0.18)'
            : isManual
              ? 'rgba(251, 191, 36, 0.2)'
              : 'rgba(251, 113, 133, 0.2)'
        }`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: labelColor }}>{check.label}</span>
          {fixing && (
            <span style={{ color: '#93c5fd', fontSize: 12 }}>Corrigindo...</span>
          )}
        </div>

        {needsFix && !fixing && (
          <button
            onClick={() => onFix(check.id)}
            style={{
              border: 'none',
              borderRadius: 8,
              padding: '6px 12px',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 12,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            Corrigir automaticamente
          </button>
        )}
      </div>

      {!isOk && !fixing && (
        <p style={{ margin: 0, color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
          {check.userMessage}
        </p>
      )}
    </div>
  )
}

export default function PreflightModal({
  toolId,
  toolName,
  platform,
  onProceed,
  onClose
}: PreflightModalProps): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>('checking')
  const [checks, setChecks] = useState<PreflightCheck[]>([])
  const [fixing, setFixing] = useState<string | null>(null)
  const [fixError, setFixError] = useState<string | null>(null)
  const [pendingSaved, setPendingSaved] = useState(false)

  useEffect(() => {
    window.electron.preflight
      .run(toolId, platform)
      .then((result: PreflightResult) => {
        setChecks(result.checks)
        setPhase(result.canProceed ? 'all-ok' : 'action-required')
      })
      .catch(() => {
        // on error, allow install to proceed
        setPhase('all-ok')
      })
  }, [toolId, platform])

  // auto-proceed when all checks are ok
  useEffect(() => {
    if (phase !== 'all-ok') return
    const timer = setTimeout(() => onProceed(), 1000)
    return () => clearTimeout(timer)
  }, [phase, onProceed])

  async function handleFix(checkId: string): Promise<void> {
    setFixing(checkId)
    setFixError(null)

    const result = await window.electron.preflight.fix(checkId)

    if (!result.success) {
      setFixing(null)
      setFixError(result.error ?? 'Erro desconhecido ao corrigir.')
      return
    }

    const fixedCheck = checks.find((c) => c.id === checkId)

    if (fixedCheck?.rebootRequired) {
      setFixing(null)
      setPhase('reboot-required')
      return
    }

    // re-run preflight after successful fix
    const fresh = await window.electron.preflight.run(toolId, platform)
    setChecks(fresh.checks)
    setFixing(null)
    setPhase(fresh.canProceed ? 'all-ok' : 'action-required')
  }

  async function handleSavePendingAndClose(): Promise<void> {
    await window.electron.preflight.savePending(toolId)
    setPendingSaved(true)
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(2, 6, 23, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Verificação de requisitos — ${toolName}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(520px, 100%)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          borderRadius: 20,
          background: 'rgba(15, 23, 42, 0.98)',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.52)',
          color: '#e5e7eb',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.14)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 17 }}>Verificando requisitos</h2>
            <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
              Para instalar: {toolName}
            </div>
          </div>
          {phase !== 'checking' && (
            <button
              onClick={onClose}
              style={{
                border: '1px solid rgba(148, 163, 184, 0.22)',
                borderRadius: 10,
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#e5e7eb',
                cursor: 'pointer',
                fontWeight: 700,
                padding: '7px 10px',
                flexShrink: 0
              }}
            >
              Fechar
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: 22, display: 'grid', gap: 16 }}>
          {/* checking */}
          {phase === 'checking' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '20px 0',
                justifyContent: 'center'
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#3b82f6',
                  display: 'inline-block',
                  animation: 'pulse 1.2s infinite'
                }}
              />
              <span style={{ color: '#94a3b8', fontSize: 14 }}>
                Verificando requisitos do sistema...
              </span>
            </div>
          )}

          {/* all-ok */}
          {phase === 'all-ok' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                padding: '20px 0',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: 32 }}>✅</span>
              <span style={{ fontWeight: 700, fontSize: 16, color: '#4ade80' }}>
                Tudo pronto!
              </span>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>
                Iniciando instalação em instantes...
              </span>
            </div>
          )}

          {/* action-required */}
          {phase === 'action-required' && (
            <>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>
                Alguns requisitos precisam ser resolvidos antes de instalar o{' '}
                <strong style={{ color: '#e5e7eb' }}>{toolName}</strong>.
              </p>

              <div style={{ display: 'grid', gap: 10 }}>
                {checks.map((check) => (
                  <CheckRow
                    key={check.id}
                    check={check}
                    fixing={fixing === check.id}
                    onFix={(id) => void handleFix(id)}
                  />
                ))}
              </div>

              {fixError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'rgba(251, 113, 133, 0.1)',
                    border: '1px solid rgba(251, 113, 133, 0.22)',
                    color: '#fda4af',
                    fontSize: 13
                  }}
                >
                  {fixError}
                </div>
              )}
            </>
          )}

          {/* reboot-required */}
          {phase === 'reboot-required' && (
            <>
              <div
                style={{
                  padding: '16px',
                  borderRadius: 14,
                  background: 'rgba(37, 99, 235, 0.1)',
                  border: '1px solid rgba(147, 197, 253, 0.2)'
                }}
              >
                <p style={{ margin: 0, color: '#dbeafe', fontSize: 14, lineHeight: 1.7 }}>
                  O WSL2 foi instalado com sucesso. O{' '}
                  <strong>{toolName}</strong> será instalado automaticamente na próxima vez que
                  você abrir o DevClone.
                </p>
              </div>

              {pendingSaved ? (
                <div style={{ color: '#4ade80', fontSize: 14, textAlign: 'center' }}>
                  Instalação pendente salva. Reinicie o computador para continuar.
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => void handleSavePendingAndClose()}
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
                    Reiniciar agora
                  </button>
                  <button
                    onClick={() => void handleSavePendingAndClose().then(onClose)}
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
                    Lembrar depois
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
