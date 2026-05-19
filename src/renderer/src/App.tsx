import Layout from './components/Layout'
import StatCard from './components/StatCard'
import StepList from './components/StepList'
import ToolList from './components/ToolList'
import { mockTools } from './data/mockTools'
import { useEnvironmentScan } from './hooks/useEnvironmentScan'
import type { EnvironmentScanResult } from '../../shared/scan.types'
import type { DevTool, ToolStatus } from './types/tools'

const scannableToolIds = ['git', 'node', 'vscode']

function formatLastScanAt(lastScanAt: string | null): string {
  if (!lastScanAt) return 'Nenhum scan realizado'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(lastScanAt))
}

function isScannableTool(tool: DevTool): boolean {
  return scannableToolIds.includes(tool.id)
}

function getToolScanStatus(
  tool: DevTool,
  scanResult: EnvironmentScanResult | null,
  loading: boolean
): ToolStatus {
  if (loading && isScannableTool(tool)) return 'pending'
  if (!scanResult || !(tool.id in scanResult)) return tool.status

  const result = scanResult[tool.id as keyof EnvironmentScanResult]
  return result.installed ? 'installed' : 'missing'
}

function getToolScanVersion(
  tool: DevTool,
  scanResult: EnvironmentScanResult | null
): string | undefined {
  if (!scanResult || !(tool.id in scanResult)) return tool.version

  const result = scanResult[tool.id as keyof EnvironmentScanResult]
  return result.version ?? undefined
}

function App(): React.JSX.Element {
  const { loading, error, scanResult, lastScanAt, scanEnvironment } = useEnvironmentScan()
  const tools = mockTools.map((tool) => ({
    ...tool,
    status: getToolScanStatus(tool, scanResult, loading),
    version: getToolScanVersion(tool, scanResult)
  }))
  const installedTools = tools.filter((tool) => tool.status === 'installed').length
  const missingTools = tools.filter((tool) => tool.status === 'missing').length
  const totalTools = mockTools.length

  return (
    <Layout>
      <section style={{ padding: 32, minWidth: 0 }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 24,
            marginBottom: 28,
            flexWrap: 'wrap'
          }}
        >
          <div style={{ minWidth: 280, flex: '1 1 520px' }}>
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
            <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 10 }}>
              Ultimo scan: {formatLastScanAt(lastScanAt)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={scanEnvironment}
              disabled={loading}
              style={{
                border: 'none',
                borderRadius: 12,
                padding: '12px 16px',
                background: '#2563eb',
                color: '#fff',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.72 : 1
              }}
            >
              {loading ? 'Escaneando...' : 'Escanear ambiente'}
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

        {error && (
          <div
            style={{
              border: '1px solid rgba(251, 113, 133, 0.25)',
              borderRadius: 14,
              padding: '12px 14px',
              background: 'rgba(251, 113, 133, 0.1)',
              color: '#fecdd3',
              fontSize: 13,
              marginBottom: 18
            }}
          >
            {error}
          </div>
        )}

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(420px, 100%), 1fr))',
            gap: 18,
            minWidth: 0
          }}
        >
          <ToolList tools={tools} hasScanResult={scanResult !== null} />
          <StepList />
        </section>
      </section>
    </Layout>
  )
}

export default App
