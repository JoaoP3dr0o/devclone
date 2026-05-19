import type { EnvironmentRecommendation } from '../../../shared/recommendations/recommendation.types'

type RecommendationsPanelProps = {
  recommendations: EnvironmentRecommendation[]
}

function getSeverityStyle(severity: EnvironmentRecommendation['severity']): {
  label: string
  color: string
  background: string
  border: string
} {
  if (severity === 'high') {
    return {
      label: 'Alta',
      color: '#fb7185',
      background: 'rgba(251, 113, 133, 0.12)',
      border: '1px solid rgba(251, 113, 133, 0.25)'
    }
  }

  if (severity === 'medium') {
    return {
      label: 'Média',
      color: '#facc15',
      background: 'rgba(250, 204, 21, 0.12)',
      border: '1px solid rgba(250, 204, 21, 0.25)'
    }
  }

  return {
    label: 'Baixa',
    color: '#93c5fd',
    background: 'rgba(37, 99, 235, 0.14)',
    border: '1px solid rgba(147, 197, 253, 0.18)'
  }
}

function RecommendationsPanel({
  recommendations
}: RecommendationsPanelProps): React.JSX.Element {
  return (
    <div
      style={{
        border: '1px solid rgba(148, 163, 184, 0.16)',
        borderRadius: 20,
        background: 'rgba(15, 23, 42, 0.72)',
        padding: 20,
        minWidth: 0
      }}
    >
      <h2 style={{ margin: 0, fontSize: 18 }}>Recomendações do ambiente</h2>

      <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
        {recommendations.map((recommendation) => {
          const severityStyle = getSeverityStyle(recommendation.severity)

          return (
            <div
              key={`${recommendation.severity}-${recommendation.title}-${recommendation.toolId ?? 'general'}`}
              style={{
                border: '1px solid rgba(148, 163, 184, 0.12)',
                borderRadius: 14,
                padding: 14,
                background: 'rgba(2, 6, 23, 0.18)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span
                  style={{
                    color: severityStyle.color,
                    background: severityStyle.background,
                    border: severityStyle.border,
                    borderRadius: 999,
                    padding: '4px 8px',
                    fontSize: 12,
                    fontWeight: 800
                  }}
                >
                  {severityStyle.label}
                </span>
                <strong>{recommendation.title}</strong>
              </div>

              <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: 13, lineHeight: 1.5 }}>
                {recommendation.message}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RecommendationsPanel
