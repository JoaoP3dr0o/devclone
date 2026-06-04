import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import StatusBadge from '../components/StatusBadge'
import { useEnvironmentScan } from '../hooks/useEnvironmentScan'
import { toolsCatalog } from '@shared/tools/catalog'
import type { EnvironmentScanResult, ToolScanResult, ToolScanStatus } from '@shared/scan.types'
import type { ToolStatus } from '../types/tools'

type ToolDiff = {
  toolName: string
  from: ToolScanStatus
  to: ToolScanStatus
}

function computeDiff(prev: EnvironmentScanResult, curr: EnvironmentScanResult): ToolDiff[] {
  return curr.tools
    .filter((currTool) => {
      const prevTool = prev.tools.find((t) => t.id === currTool.id)
      return prevTool !== undefined && prevTool.status !== currTool.status
    })
    .map((currTool) => {
      const prevTool = prev.tools.find((t) => t.id === currTool.id)!
      return { toolName: currTool.name, from: prevTool.status, to: currTool.status }
    })
}

function statusLabel(status: ToolScanStatus): string {
  switch (status) {
    case 'healthy':
      return 'instalado'
    case 'missing':
      return 'ausente'
    case 'outdated':
      return 'desatualizado'
    case 'warning':
      return 'com atenção'
    case 'unsupported':
      return 'não suportado'
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Nenhum scan realizado'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(iso))
}

function ScanPage(): React.JSX.Element {
  const navigate = useNavigate()
  const { loading, error, scanResult, lastScanAt, scanEnvironment } = useEnvironmentScan()

  const [scanProgressIndex, setScanProgressIndex] = useState(-1)
  const [diff, setDiff] = useState<ToolDiff[]>([])
  const prevScanRef = useRef<EnvironmentScanResult | null>(null)
  const justTriggeredRef = useRef(false)

  // Animate progress through tools during loading
  useEffect(() => {
    if (!loading) {
      setScanProgressIndex(-1)
      return
    }
    setScanProgressIndex(0)
    const interval = setInterval(() => {
      setScanProgressIndex((prev) =>
        prev < toolsCatalog.length - 1 ? prev + 1 : prev
      )
    }, 280)
    return () => clearInterval(interval)
  }, [loading])

  // Compute diff after scan completes
  useEffect(() => {
    if (!loading && justTriggeredRef.current && scanResult) {
      justTriggeredRef.current = false
      if (prevScanRef.current) {
        setDiff(computeDiff(prevScanRef.current, scanResult))
      }
    }
  }, [loading, scanResult])

  async function handleScan(): Promise<void> {
    prevScanRef.current = scanResult
    justTriggeredRef.current = true
    setDiff([])
    await scanEnvironment()
  }

  const hasResult = scanResult !== null && scanResult.tools.length > 0

  const summary = hasResult
    ? {
        installed: scanResult!.tools.filter((t) => t.status === 'healthy').length,
        missing: scanResult!.tools.filter((t) => t.status === 'missing').length,
        outdated: scanResult!.tools.filter(
          (t) => t.status === 'outdated' || t.status === 'warning'
        ).length,
        unsupported: scanResult!.tools.filter((t) => t.status === 'unsupported').length
      }
    : null

  return (
    <section style={{ padding: 32, minWidth: 0 }}>
      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 42, lineHeight: 1.1, margin: 0 }}>Scan do ambiente</h1>
        <p
          style={{
            color: '#94a3b8',
            fontSize: 16,
            maxWidth: 600,
            lineHeight: 1.7,
            marginTop: 14,
            marginBottom: 0
          }}
        >
          Detecta ferramentas instaladas, versões e compatibilidade com o seu perfil ativo.
        </p>
      </header>

      {/* Actions row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 28
        }}
      >
        <button
          onClick={handleScan}
          disabled={loading}
          style={{
            border: 'none',
            borderRadius: 12,
            padding: '12px 20px',
            background: '#2563eb',
            color: '#fff',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.72 : 1,
            fontSize: 15
          }}
        >
          {loading ? 'Escaneando...' : 'Escanear ambiente'}
        </button>

        <span style={{ color: '#64748b', fontSize: 13 }}>
          Último scan: {formatDate(lastScanAt)}
        </span>
      </div>

      {/* Error */}
      {error && !loading && (
        <div
          style={{
            border: '1px solid rgba(251, 113, 133, 0.25)',
            borderRadius: 14,
            padding: '12px 14px',
            background: 'rgba(251, 113, 133, 0.1)',
            color: '#fecdd3',
            fontSize: 13,
            marginBottom: 24
          }}
        >
          {error}
        </div>
      )}

      {/* Loading: animated progress */}
      {loading && <ScanProgress scanProgressIndex={scanProgressIndex} />}

      {/* Results */}
      {!loading && hasResult && (
        <>
          {summary && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: 14,
                marginBottom: 28
              }}
            >
              <SummaryCard label="Instaladas" value={summary.installed} color="#34d399" />
              <SummaryCard label="Ausentes" value={summary.missing} color="#fb7185" />
              <SummaryCard label="Desatualizadas" value={summary.outdated} color="#fb923c" />
              <SummaryCard label="Não suportadas" value={summary.unsupported} color="#64748b" />
            </div>
          )}

          <ToolResultList tools={scanResult!.tools} />

          {diff.length > 0 && <DiffTimeline diff={diff} />}

          <button
            onClick={() => navigate('/tools')}
            style={{
              marginTop: 8,
              border: '1px solid rgba(148, 163, 184, 0.24)',
              borderRadius: 12,
              padding: '10px 18px',
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#e5e7eb',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Ver todas as ferramentas →
          </button>
        </>
      )}

      {/* Empty state */}
      {!loading && !hasResult && !error && <EmptyState />}
    </section>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScanProgress({ scanProgressIndex }: { scanProgressIndex: number }): React.JSX.Element {
  return (
    <div
      style={{
        border: '1px solid rgba(148, 163, 184, 0.16)',
        borderRadius: 20,
        background: 'rgba(15, 23, 42, 0.72)',
        overflow: 'hidden',
        marginBottom: 28
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}
      >
        <PulsingDot />
        <span style={{ fontWeight: 700, fontSize: 14 }}>Escaneando ferramentas...</span>
      </div>

      {toolsCatalog.map((tool, index) => {
        const isDone = index < scanProgressIndex
        const isActive = index === scanProgressIndex

        return (
          <div
            key={tool.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '11px 20px',
              borderBottom: '1px solid rgba(148, 163, 184, 0.06)',
              opacity: index > scanProgressIndex ? 0.28 : 1,
              transition: 'opacity 0.15s'
            }}
          >
            <span
              style={{
                fontSize: 13,
                width: 16,
                color: isDone ? '#34d399' : isActive ? '#93c5fd' : '#475569',
                flexShrink: 0
              }}
            >
              {isDone ? '✓' : isActive ? '◉' : '○'}
            </span>
            <span
              style={{
                fontSize: 14,
                color: isDone ? '#e5e7eb' : isActive ? '#93c5fd' : '#64748b',
                fontWeight: isDone || isActive ? 600 : 400
              }}
            >
              {tool.name}
            </span>
            {isActive && (
              <span style={{ fontSize: 12, color: '#475569' }}>verificando...</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function PulsingDot(): React.JSX.Element {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: '#3b82f6',
        flexShrink: 0,
        animation: 'pulse 1.4s ease-in-out infinite'
      }}
    />
  )
}

function SummaryCard({
  label,
  value,
  color
}: {
  label: string
  value: number
  color: string
}): React.JSX.Element {
  return (
    <div
      style={{
        border: '1px solid rgba(148, 163, 184, 0.14)',
        borderRadius: 16,
        padding: '18px 20px',
        background: 'rgba(15, 23, 42, 0.7)'
      }}
    >
      <div style={{ fontSize: 36, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 6 }}>{label}</div>
    </div>
  )
}

function ToolResultList({ tools }: { tools: ToolScanResult[] }): React.JSX.Element {
  return (
    <div
      style={{
        border: '1px solid rgba(148, 163, 184, 0.16)',
        borderRadius: 20,
        background: 'rgba(15, 23, 42, 0.72)',
        overflow: 'hidden',
        marginBottom: 24
      }}
    >
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
        }}
      >
        <h2 style={{ margin: 0, fontSize: 16 }}>
          Resultado detalhado
          <span style={{ color: '#64748b', fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
            {tools.length} ferramentas
          </span>
        </h2>
      </div>

      {tools.map((tool) => (
        <div
          key={tool.id}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(180px, 1fr) 90px auto',
            gap: 16,
            padding: '12px 20px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.06)',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{tool.name}</span>
            <span
              style={{
                color: '#64748b',
                background: 'rgba(100, 116, 139, 0.1)',
                borderRadius: 999,
                padding: '2px 7px',
                fontSize: 11
              }}
            >
              {tool.category}
            </span>
          </div>
          <span style={{ color: '#94a3b8', fontSize: 13, textAlign: 'right' }}>
            {tool.version ?? '—'}
          </span>
          <StatusBadge status={tool.status as ToolStatus} />
        </div>
      ))}
    </div>
  )
}

function DiffTimeline({ diff }: { diff: ToolDiff[] }): React.JSX.Element {
  return (
    <div
      style={{
        border: '1px solid rgba(148, 163, 184, 0.16)',
        borderRadius: 20,
        background: 'rgba(15, 23, 42, 0.72)',
        overflow: 'hidden',
        marginBottom: 24
      }}
    >
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
        }}
      >
        <h2 style={{ margin: 0, fontSize: 16 }}>
          Mudanças detectadas
          <span
            style={{
              marginLeft: 8,
              fontSize: 12,
              padding: '2px 8px',
              borderRadius: 999,
              background: 'rgba(34, 197, 94, 0.12)',
              color: '#4ade80',
              fontWeight: 700
            }}
          >
            {diff.length}
          </span>
        </h2>
      </div>

      {diff.map((change, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.06)',
            flexWrap: 'wrap'
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: '#34d399',
              flexShrink: 0
            }}
          >
            ↑
          </span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{change.toolName}</span>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>
            passou de{' '}
            <strong style={{ color: '#e5e7eb' }}>{statusLabel(change.from)}</strong> para{' '}
            <strong style={{ color: '#34d399' }}>{statusLabel(change.to)}</strong>
          </span>
        </div>
      ))}
    </div>
  )
}

function EmptyState(): React.JSX.Element {
  return (
    <div
      style={{
        border: '1px solid rgba(148, 163, 184, 0.14)',
        borderRadius: 20,
        padding: '56px 32px',
        textAlign: 'center',
        background: 'rgba(15, 23, 42, 0.4)'
      }}
    >
      <div style={{ fontSize: 44, marginBottom: 16 }}>🔍</div>
      <h2 style={{ margin: '0 0 10px', fontSize: 22 }}>Nenhum scan realizado</h2>
      <p
        style={{
          color: '#94a3b8',
          fontSize: 14,
          margin: 0,
          maxWidth: 360,
          marginInline: 'auto'
        }}
      >
        Clique em "Escanear ambiente" para detectar as ferramentas instaladas no seu sistema.
      </p>
    </div>
  )
}

export default ScanPage
