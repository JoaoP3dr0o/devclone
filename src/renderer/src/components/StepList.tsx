type Step = {
  number: string
  title: string
  text: string
}

const steps: Step[] = [
  {
    number: '1',
    title: 'Suporte Linux',
    text: 'Instalação de ferramentas em distribuições Ubuntu, Fedora e Arch.'
  },
  {
    number: '2',
    title: 'Suporte macOS',
    text: 'Instalação via Homebrew e detecção de ambiente Apple Silicon.'
  },
  {
    number: '3',
    title: 'Marketplace de perfis',
    text: 'Compartilhe e descubra perfis da comunidade.'
  },
  {
    number: '4',
    title: 'CLI companion',
    text: 'Gerencie seu ambiente pelo terminal sem abrir o app.'
  }
]

function StepList(): React.JSX.Element {
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
      <h2 style={{ margin: 0, fontSize: 18 }}>Próximos passos</h2>

      <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
        {steps.map((step) => (
          <StepItem key={step.number} step={step} />
        ))}
      </div>
    </div>
  )
}

function StepItem({ step }: { step: Step }): React.JSX.Element {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '34px 1fr',
        gap: 12,
        alignItems: 'start'
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          background: 'rgba(37, 99, 235, 0.18)',
          color: '#93c5fd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800
        }}
      >
        {step.number}
      </div>

      <div>
        <strong>{step.title}</strong>
        <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 13, lineHeight: 1.5 }}>
          {step.text}
        </p>
      </div>
    </div>
  )
}

export default StepList
