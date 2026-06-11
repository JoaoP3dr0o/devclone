import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import RecommendationsPanel from '../components/RecommendationsPanel'
import StatCard from '../components/StatCard'
import StepList from '../components/StepList'
import ToolList from '../components/ToolList'
import { mockTools } from '../data/mockTools'
import { useActiveProfile } from '../hooks/useActiveProfile'
import { useEnvironmentScan } from '../hooks/useEnvironmentScan'
import { calculateProfileCompatibility } from '@shared/profiles/compatibility'
import { generateEnvironmentRecommendations } from '@shared/recommendations/recommendation.engine'
import type { EnvironmentScanResult } from '@shared/scan.types'
import type { DevTool, ToolStatus } from '../types/tools'

function formatLastScanAt(lastScanAt: string | null): string {
  if (!lastScanAt) return 'Nenhum scan realizado'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(lastScanAt))
}

function getScannedTool(tool: DevTool, scanResult: EnvironmentScanResult | null) {
  return scanResult?.tools.find((scannedTool) => scannedTool.id === tool.id) ?? null
}

function getToolScanStatus(
  tool: DevTool,
  scanResult: EnvironmentScanResult | null,
  loading: boolean
): ToolStatus {
  if (loading) return 'pending'

  const result = getScannedTool(tool, scanResult)
  if (!result) return tool.status

  return result.status
}

function getToolScanVersion(
  tool: DevTool,
  scanResult: EnvironmentScanResult | null
): string | undefined {
  const result = getScannedTool(tool, scanResult)
  if (!result) return tool.version

  return result.version ?? undefined
}

function Home(): React.JSX.Element {
  const navigate = useNavigate()
  const [platformName, setPlatformName] = useState<string>('Detectando...')
  const { loading, error, scanResult, lastScanAt, scanEnvironment } = useEnvironmentScan()
  const { userProfile, environmentProfile } = useActiveProfile()

  useEffect(() => {
    window.electron
      .getPlatform()
      .then((platform) => setPlatformName(platform.name))
      .catch(() => setPlatformName('Plataforma desconhecida'))
  }, [])

  // Empty state — first use, no scan yet
  if (!scanResult) {
    return (
      <section
        style={{
          padding: 32,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)',
          textAlign: 'center'
        }}
      >
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
            marginBottom: 20
          }}
        >
          {platformName} detectado · MVP local
        </div>

        <h1 style={{ fontSize: 42, lineHeight: 1.1, margin: '0 0 16px' }}>
          Clone seu ambiente dev
        </h1>

        <p
          style={{
            color: '#94a3b8',
            fontSize: 16,
            maxWidth: 560,
            lineHeight: 1.7,
            margin: '0 0 12px'
          }}
        >
          Escaneie seu ambiente, monte seu perfil e restaure tudo em qualquer máquina.
        </p>

        <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 32px' }}>
          Escaneie seu ambiente para começar
        </p>

        {error && (
          <div
            style={{
              border: '1px solid rgba(251, 113, 133, 0.25)',
              borderRadius: 14,
              padding: '12px 14px',
              background: 'rgba(251, 113, 133, 0.1)',
              color: '#fecdd3',
              fontSize: 13,
              marginBottom: 24,
              maxWidth: 480
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={scanEnvironment}
          disabled={loading}
          style={{
            border: 'none',
            borderRadius: 12,
            padding: '14px 28px',
            background: '#2563eb',
            color: '#fff',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.72 : 1,
            fontSize: 16
          }}
        >
          {loading ? 'Escaneando...' : 'Escanear ambiente'}
        </button>
      </section>
    )
  }

  // After scan
  const hasProfile = environmentProfile.tools.length > 0

  const tools = mockTools.map((tool) => ({
    ...tool,
    status: getToolScanStatus(tool, scanResult, loading),
    version: getToolScanVersion(tool, scanResult)
  }))

  const profileToolSet = new Set(userProfile.toolIds)

  const profileTools = tools
    .filter((t) => profileToolSet.has(t.id))
    .sort((a, b) => {
      const aOk = a.status === 'healthy' || a.status === 'degraded'
      const bOk = b.status === 'healthy' || b.status === 'degraded'
      if (aOk && !bOk) return -1
      if (!aOk && bOk) return 1
      return 0
    })

  const otherTools = tools.filter(
    (t) => !profileToolSet.has(t.id) && t.status !== 'missing' && t.status !== 'unsupported'
  )

  const compatibility = calculateProfileCompatibility(scanResult, environmentProfile)
  const recommendations = generateEnvironmentRecommendations(scanResult, environmentProfile)

  return (
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
            {platformName} detectado · MVP local
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
            O DevClone vai ajudar desenvolvedores Laravel + React a detectar ferramentas, salvar um
            perfil local e futuramente restaurar tudo em uma nova máquina após login.
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
            {loading ? 'Escaneando...' : 'Re-escanear'}
          </button>

          <button
            onClick={() => navigate('/profile')}
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
            Meu perfil
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
          marginBottom: hasProfile ? 28 : 16
        }}
      >
        <StatCard label="Profile ativo" value={userProfile.name} />
        {hasProfile && (
          <>
            <StatCard label="Compatibilidade" value={`${compatibility.score}%`} />
            <StatCard label="OK" value={compatibility.healthy.length.toString()} />
            <StatCard label="Ausentes" value={compatibility.missing.length.toString()} />
            <StatCard label="Desatualizadas" value={compatibility.outdated.length.toString()} />
          </>
        )}
      </section>

      {!hasProfile && (
        <div
          style={{
            border: '1px solid rgba(147, 197, 253, 0.18)',
            borderRadius: 14,
            padding: '14px 18px',
            background: 'rgba(37, 99, 235, 0.07)',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap'
          }}
        >
          <div style={{ fontSize: 14, color: '#cbd5e1' }}>
            <span style={{ color: '#93c5fd', fontWeight: 700 }}>Perfil vazio — </span>
            adicione ferramentas para calcular compatibilidade e ver recomendações.
          </div>
          <button
            onClick={() => navigate('/profile')}
            style={{
              border: 'none',
              borderRadius: 8,
              padding: '7px 14px',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 13,
              whiteSpace: 'nowrap'
            }}
          >
            Configurar perfil
          </button>
        </div>
      )}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: hasProfile
            ? 'repeat(auto-fit, minmax(min(420px, 100%), 1fr))'
            : '1fr',
          gap: 18,
          minWidth: 0
        }}
      >
        <div style={{ display: 'grid', gap: 18, minWidth: 0 }}>
          {profileTools.length > 0 && (
            <ToolList
              title="No seu perfil"
              tools={profileTools}
              hasScanResult={true}
              onToolInstalled={scanEnvironment}
            />
          )}
          {otherTools.length > 0 && (
            <ToolList
              title="Outras instaladas"
              compact
              tools={otherTools}
              hasScanResult={true}
              onToolInstalled={scanEnvironment}
            />
          )}
        </div>
        {hasProfile && (
          <div style={{ display: 'grid', gap: 18 }}>
            <RecommendationsPanel recommendations={recommendations} />
            <StepList />
          </div>
        )}
      </section>
    </section>
  )
}

export default Home
