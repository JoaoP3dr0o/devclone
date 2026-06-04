import { useState } from 'react'

import StatusBadge from '../components/StatusBadge'
import ToolDetailsModal from '../components/ToolDetailsModal'
import { mockTools } from '../data/mockTools'
import { useActiveProfile } from '../hooks/useActiveProfile'
import { useEnvironmentScan } from '../hooks/useEnvironmentScan'
import { toolsCatalog } from '@shared/tools/catalog'
import type { EnvironmentScanResult } from '@shared/scan.types'
import type { DevTool, ToolStatus } from '../types/tools'

function getScannedTool(tool: DevTool, scanResult: EnvironmentScanResult | null) {
  return scanResult?.tools.find((s) => s.id === tool.id) ?? null
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

const ALL_CATEGORIES = [...new Set(toolsCatalog.map((t) => t.category))]

const STATUS_FILTERS: { label: string; value: ToolStatus }[] = [
  { label: 'Instalado', value: 'healthy' },
  { label: 'Ausente', value: 'missing' },
  { label: 'Desatualizado', value: 'outdated' },
  { label: 'Atenção', value: 'warning' }
]

function ToolsPage(): React.JSX.Element {
  const { loading, scanResult, scanEnvironment } = useEnvironmentScan()
  const { environmentProfile } = useActiveProfile()
  const [selectedTool, setSelectedTool] = useState<DevTool | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ToolStatus | null>(null)

  const profileToolIds = new Set(environmentProfile.tools.map((t) => t.toolId))

  const tools = mockTools.map((tool) => ({
    ...tool,
    status: getToolScanStatus(tool, scanResult, loading),
    version: getToolScanVersion(tool, scanResult)
  }))

  const filtered = tools.filter((tool) => {
    const matchesSearch =
      search === '' || tool.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === null || tool.category === categoryFilter
    const matchesStatus = statusFilter === null || tool.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const hasActiveFilter = search !== '' || categoryFilter !== null || statusFilter !== null

  function toggleCategory(cat: string): void {
    setCategoryFilter((prev) => (prev === cat ? null : cat))
  }

  function toggleStatus(status: ToolStatus): void {
    setStatusFilter((prev) => (prev === status ? null : status))
  }

  function clearFilters(): void {
    setSearch('')
    setCategoryFilter(null)
    setStatusFilter(null)
  }

  return (
    <section style={{ padding: 32, minWidth: 0 }}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 42, lineHeight: 1.1, margin: 0 }}>Ferramentas</h1>
        <p
          style={{
            color: '#94a3b8',
            fontSize: 16,
            maxWidth: 600,
            lineHeight: 1.7,
            marginTop: 14,
            marginBottom: 0
          }}
        >
          Catálogo completo do seu stack. Clique em qualquer ferramenta para ver detalhes e
          instalar.
        </p>
      </header>

      <div style={{ display: 'grid', gap: 12, marginBottom: 22 }}>
        {/* Search + Scan */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="search"
            placeholder="Buscar ferramenta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: '1 1 240px',
              padding: '10px 14px',
              border: '1px solid rgba(148, 163, 184, 0.22)',
              borderRadius: 12,
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#e5e7eb',
              fontSize: 14,
              outline: 'none'
            }}
          />
          <button
            onClick={scanEnvironment}
            disabled={loading}
            style={{
              border: 'none',
              borderRadius: 12,
              padding: '10px 16px',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.72 : 1,
              fontSize: 14,
              whiteSpace: 'nowrap'
            }}
          >
            {loading ? 'Escaneando...' : 'Escanear'}
          </button>
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ALL_CATEGORIES.map((cat) => {
            const active = categoryFilter === cat
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 999,
                  border: active
                    ? '1px solid rgba(147, 197, 253, 0.4)'
                    : '1px solid rgba(148, 163, 184, 0.2)',
                  background: active ? 'rgba(37, 99, 235, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                  color: active ? '#93c5fd' : '#94a3b8',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontWeight: active ? 700 : 400
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Status chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map(({ label, value }) => {
            const active = statusFilter === value
            return (
              <button
                key={value}
                onClick={() => toggleStatus(value)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 999,
                  border: active
                    ? '1px solid rgba(147, 197, 253, 0.4)'
                    : '1px solid rgba(148, 163, 184, 0.2)',
                  background: active ? 'rgba(37, 99, 235, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                  color: active ? '#93c5fd' : '#94a3b8',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontWeight: active ? 700 : 400
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Results count */}
      <div
        style={{
          color: '#94a3b8',
          fontSize: 13,
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}
      >
        <span>
          {filtered.length} ferramenta{filtered.length !== 1 ? 's' : ''}
        </span>
        {hasActiveFilter && (
          <button
            onClick={clearFilters}
            style={{
              marginLeft: 8,
              color: '#2563eb',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              padding: 0
            }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Tool list */}
      <div
        style={{
          border: '1px solid rgba(148, 163, 184, 0.16)',
          borderRadius: 20,
          background: 'rgba(15, 23, 42, 0.72)',
          overflow: 'hidden'
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 14 }}
          >
            Nenhuma ferramenta encontrada para os filtros selecionados.
          </div>
        ) : (
          filtered.map((tool) => {
            const isInProfile = profileToolIds.has(tool.id)
            return (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(220px, 1fr) auto',
                  gap: 16,
                  padding: '16px 20px',
                  border: 'none',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                  width: '100%',
                  background: 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
                  >
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
                    {isInProfile && (
                      <span
                        style={{
                          color: '#818cf8',
                          background: 'rgba(129, 140, 248, 0.12)',
                          border: '1px solid rgba(129, 140, 248, 0.25)',
                          borderRadius: 999,
                          padding: '3px 8px',
                          fontSize: 11,
                          fontWeight: 700
                        }}
                      >
                        No perfil
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: 13 }}>
                    {tool.description}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tool.version && (
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>{tool.version}</span>
                  )}
                  <StatusBadge status={tool.status} />
                </div>
              </button>
            )
          })
        )}
      </div>

      <ToolDetailsModal
        tool={selectedTool}
        onClose={() => setSelectedTool(null)}
        onInstallSuccess={scanEnvironment}
      />
    </section>
  )
}

export default ToolsPage
