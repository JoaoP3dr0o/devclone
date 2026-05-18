import Layout from './components/Layout'
import StatCard from './components/StatCard'
import StepList from './components/StepList'
import ToolList from './components/ToolList'
import { mockTools } from './data/mockTools'

function App(): React.JSX.Element {
  const installedTools = mockTools.filter((tool) => tool.status === 'installed').length
  const missingTools = mockTools.filter((tool) => tool.status === 'missing').length
  const totalTools = mockTools.length

  return (
    <Layout>
      <section style={{ padding: 32 }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 24,
            marginBottom: 28
          }}
        >
          <div>
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
              Windows detectado · MVP local
            </div>

            <h1 style={{ fontSize: 42, lineHeight: 1.1, margin: 0 }}>Clone seu ambiente dev</h1>

            <p
              style={{
                color: '#94a3b8',
                fontSize: 16,
                maxWidth: 720,
                lineHeight: 1.7,
                marginTop: 14
              }}
            >
              O DevClone vai ajudar desenvolvedores Laravel + React a detectar ferramentas,
              salvar um perfil local e futuramente restaurar tudo em uma nova máquina após login.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              style={{
                border: 'none',
                borderRadius: 12,
                padding: '12px 16px',
                background: '#2563eb',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Escanear ambiente
            </button>

            <button
              style={{
                border: '1px solid rgba(148, 163, 184, 0.24)',
                borderRadius: 12,
                padding: '12px 16px',
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#e5e7eb',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Criar perfil
            </button>
          </div>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 16,
            marginBottom: 28
          }}
        >
          <StatCard label="Ferramentas suportadas" value={totalTools.toString()} />
          <StatCard label="Instaladas" value={installedTools.toString()} />
          <StatCard label="Ausentes" value={missingTools.toString()} />
          <StatCard label="Perfil local" value="Não criado" />
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: 18
          }}
        >
          <ToolList tools={mockTools} />
          <StepList />
        </section>
      </section>
    </Layout>
  )
}

export default App
