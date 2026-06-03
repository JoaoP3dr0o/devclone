import type { CSSProperties } from 'react'

import type { ToolStatus } from '../types/tools'

type StatusBadgeProps = {
  status: ToolStatus
}

function getStatusLabel(status: ToolStatus): string {
  if (status === 'healthy') return 'Instalado'
  if (status === 'warning') return 'Atenção'
  if (status === 'outdated') return 'Desatualizado'
  if (status === 'missing') return 'Ausente'
  if (status === 'unsupported') return 'Não suportado'
  return 'Pendente'
}

function getStatusStyle(status: ToolStatus): CSSProperties {
  if (status === 'healthy') {
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

  if (status === 'outdated') {
    return {
      color: '#fb923c',
      background: 'rgba(251, 146, 60, 0.12)',
      border: '1px solid rgba(251, 146, 60, 0.25)'
    }
  }

  if (status === 'unsupported') {
    return {
      color: '#64748b',
      background: 'rgba(100, 116, 139, 0.1)',
      border: '1px solid rgba(100, 116, 139, 0.2)'
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
