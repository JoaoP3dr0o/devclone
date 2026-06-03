function ScanPage(): React.JSX.Element {
  return (
    <section style={{ padding: 32 }}>
      <PageBadge label="Em construção" />
      <h1 style={{ fontSize: 42, lineHeight: 1.1, margin: 0 }}>Scan detalhado</h1>
      <p
        style={{ color: '#94a3b8', fontSize: 16, maxWidth: 600, lineHeight: 1.7, marginTop: 14 }}
      >
        Scanner com progresso em tempo real, histórico de scans anteriores e exportação do
        resultado como JSON ou PDF para compartilhamento com o time.
      </p>

      <FeatureList
        features={[
          'Progresso por ferramenta com log de saída em tempo real',
          'Histórico dos últimos 10 scans com diff entre versões',
          'Exportação do resultado como JSON ou PDF',
          'Agendamento de scan automático ao iniciar o app'
        ]}
      />
    </section>
  )
}

export default ScanPage

function PageBadge({ label }: { label: string }): React.JSX.Element {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 999,
        background: 'rgba(37, 99, 235, 0.14)',
        color: '#93c5fd',
        border: '1px solid rgba(147, 197, 253, 0.18)',
        fontSize: 13,
        marginBottom: 14
      }}
    >
      {label}
    </div>
  )
}

function FeatureList({ features }: { features: string[] }): React.JSX.Element {
  return (
    <ul
      style={{
        marginTop: 28,
        display: 'grid',
        gap: 12,
        padding: 0,
        listStyle: 'none'
      }}
    >
      {features.map((f) => (
        <li
          key={f}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#cbd5e1',
            fontSize: 14
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#2563eb',
              flexShrink: 0
            }}
          />
          {f}
        </li>
      ))}
    </ul>
  )
}
