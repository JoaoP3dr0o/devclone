function SettingsPage(): React.JSX.Element {
  return (
    <section style={{ padding: 32 }}>
      <PageBadge label="Em construção" />
      <h1 style={{ fontSize: 42, lineHeight: 1.1, margin: 0 }}>Configurações</h1>
      <p
        style={{ color: '#94a3b8', fontSize: 16, maxWidth: 600, lineHeight: 1.7, marginTop: 14 }}
      >
        Preferências do aplicativo: tema, atalhos de teclado, atualizações automáticas e
        gerenciamento de conta para sincronização cloud.
      </p>

      <FeatureList
        features={[
          'Alternância de tema claro/escuro',
          'Configuração de atalhos de teclado',
          'Atualizações automáticas via electron-updater',
          'Gerenciamento de conta e tokens de acesso cloud'
        ]}
      />
    </section>
  )
}

export default SettingsPage

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
