import type { CSSProperties } from 'react'

import type { ToolStatus } from '../types/tools'

type StatusBadgeProps = {
  status: ToolStatus
}

function getStatusLabel(status: ToolStatus): string {
  if (status === 'installed') return 'Instalado'
  if (status === 'missing') return 'Ausente'
  return 'Pendente'
}

function getStatusStyle(status: ToolStatus): CSSProperties {
  if (status === 'installed') {
    return {
      color: '#34d399',
      background: 'rgba(52, 211, 153, 0.12)',
      border: '1px solid rgba(52, 211, 153, 0.25)'
    }
  }

  if (status === 'missing') {
    return {
      color: '#fb7185',
      background: 'rgba(251, 113, 133, 0.12)',
      border: '1px solid rgba(251, 113, 133, 0.25)'
    }
  }

  return {
    color: '#facc15',
    background: 'rgba(250, 204, 21, 0.12)',
    border: '1px solid rgba(250, 204, 21, 0.25)'
  }
}

function StatusBadge({ status }: StatusBadgeProps): React.JSX.Element {
  return (
    <span
      style={{
        ...getStatusStyle(status),
        borderRadius: 999,
        padding: '5px 10px',
        fontSize: 12,
        fontWeight: 700
      }}
    >
      {getStatusLabel(status)}
    </span>
  )
}

export default StatusBadge
