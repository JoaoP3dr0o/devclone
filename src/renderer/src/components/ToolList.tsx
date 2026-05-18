import type { DevTool } from '../types/tools'

import StatusBadge from './StatusBadge'

type ToolListProps = {
  tools: DevTool[]
}

function ToolList({ tools }: ToolListProps): React.JSX.Element {
  return (
    <div
      style={{
        border: '1px solid rgba(148, 163, 184, 0.16)',
        borderRadius: 20,
        background: 'rgba(15, 23, 42, 0.72)',
        overflow: 'hidden'
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
          <h2 style={{ margin: 0, fontSize: 18 }}>Ferramentas do MVP</h2>
          <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: 13 }}>
            Catálogo inicial focado em Laravel + React.
          </p>
        </div>
      </div>

      <div>
        {tools.map((tool) => (
          <div
            key={tool.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 16,
              padding: '16px 20px',
              borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
              </div>

              <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: 13 }}>
                {tool.description}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {tool.version && (
                <span style={{ color: '#94a3b8', fontSize: 13 }}>{tool.version}</span>
              )}

              <StatusBadge status={tool.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ToolList
