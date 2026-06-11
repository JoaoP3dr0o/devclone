import { useState } from 'react'

import type { DevTool, DevToolId } from '../types/tools'

import StatusBadge from './StatusBadge'
import ToolDetailsModal from './ToolDetailsModal'
import { useAppStore } from '../store/useAppStore'

type ToolListProps = {
  tools: DevTool[]
  title?: string
  compact?: boolean
  hasScanResult?: boolean
  onToolInstalled?: () => void
}

function getToolRowBackground(status: DevTool['status']): string {
  if (status === 'warning' || status === 'outdated') return 'rgba(250, 204, 21, 0.035)'
  return 'transparent'
}

function ToolList({ tools, title, compact = false, hasScanResult = false, onToolInstalled }: ToolListProps): React.JSX.Element {
  const [selectedTool, setSelectedTool] = useState<DevTool | null>(null)
  const userProfile = useAppStore((s) => s.userProfile)

  return (
    <>
      <div
        style={{
          border: '1px solid rgba(148, 163, 184, 0.16)',
          borderRadius: 20,
          background: 'rgba(15, 23, 42, 0.72)',
          overflow: 'hidden',
          minWidth: 0
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: compact ? 14 : 18,
                color: compact ? '#94a3b8' : '#e5e7eb',
                fontWeight: compact ? 600 : 700
              }}
            >
              {title ?? 'Ferramentas do seu ambiente'}
            </h2>
            {!compact && (
              <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: 13 }}>
                Resultado do último scan — clique para detalhes
              </p>
            )}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool)}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(220px, 1fr) auto',
                gap: 16,
                padding: '16px 20px',
                border: 'none',
                borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                minWidth: 520,
                width: '100%',
                background: getToolRowBackground(tool.status),
                color: 'inherit',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <strong>{tool.name}</strong>
                  <span
                    style={{
                      color: '#94a3b8',
                      background: 'rgba(148, 163, 184, 0.12)',
                      borderRadius: 999,
                      padding: '3px 8px',
                      fontSize: 12
                    }}
                  >
                    {tool.category}
                  </span>
                  {userProfile.toolIds.includes(tool.id) && tool.status === 'missing' && (
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'rgba(59,130,246,0.15)',
                        color: 'rgba(147,197,253,0.8)',
                        marginLeft: 6
                      }}
                    >
                      No perfil
                    </span>
                  )}
                </div>

                <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: 13 }}>
                  {tool.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap' }}>
                {tool.version && (
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>{tool.version}</span>
                )}

                <StatusBadge status={tool.status} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <ToolDetailsModal
        tool={selectedTool}
        onClose={() => setSelectedTool(null)}
        onInstallSuccess={onToolInstalled}
        onOpenTool={(depId: DevToolId) => {
          const dep = tools.find((t) => t.id === depId)
          if (dep) setSelectedTool(dep)
        }}
      />
    </>
  )
}

export default ToolList
