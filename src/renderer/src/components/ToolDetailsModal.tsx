import { useEffect, useState } from 'react'

import { getToolInsight, getToolInsightMessage } from '@shared/tools/insights'
import type { DevTool } from '../types/tools'

import StatusBadge from './StatusBadge'

type ToolDetailsModalProps = {
  tool: DevTool | null
  onClose: () => void
}

function getStatusInsight(tool: DevTool): string {
  if (tool.status === 'pending') return 'Scan em andamento. Aguarde para ver o diagnóstico atualizado.'
  return getToolInsightMessage(tool.id, tool.status)
}

function ToolDetailsModal({ tool, onClose }: ToolDetailsModalProps): React.JSX.Element | null {
  const [installCommand, setInstallCommand] = useState<string | null>(null)

  useEffect(() => {
    if (!tool) {
      setInstallCommand(null)
      return
    }

    let cancelled = false

    window.electron
      .getInstallCommand(tool.id)
      .then((command) => {
        if (!cancelled) {
          setInstallCommand(command)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInstallCommand(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [tool?.id])

  if (!tool) return null

  const insight = getToolInsight(tool.id)
  const installCommandPreview = installCommand ?? 'Installation not available'

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
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '20px 22px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.14)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'flex-start'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>{tool.name}</h2>
              <StatusBadge status={tool.status} />
            </div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 6 }}>{tool.category}</div>
          </div>

          <button
            onClick={onClose}
            style={{
              border: '1px solid rgba(148, 163, 184, 0.22)',
              borderRadius: 10,
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#e5e7eb',
              cursor: 'pointer',
              fontWeight: 700,
              padding: '8px 10px'
            }}
          >
            Fechar
          </button>
        </div>

        <div style={{ padding: 22, display: 'grid', gap: 18 }}>
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
        </div>
      </div>
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
