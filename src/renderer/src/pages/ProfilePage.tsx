import { useEffect, useRef, useState } from 'react'

import { calculateProfileCompatibility, detectBestProfile } from '@shared/profiles/compatibility'
import { defaultProfiles } from '@shared/profiles/defaultProfiles'
import type { EnvironmentProfile, UserProfile } from '@shared/profiles/profile.types'
import { DEFAULT_USER_PROFILE } from '@shared/profiles/userProfile.utils'
import type { EnvironmentScanResult } from '@shared/scan.types'
import { toolsCatalog } from '@shared/tools/catalog'

import { useActiveProfile } from '../hooks/useActiveProfile'

export default function ProfilePage(): React.JSX.Element {
  const { userProfile, saveProfile, profileLoading } = useActiveProfile()
  const [nameInput, setNameInput] = useState('')
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [savedIndicator, setSavedIndicator] = useState(false)
  const [scanResult, setScanResult] = useState<EnvironmentScanResult | null>(null)
  const [detectedProfile, setDetectedProfile] = useState<EnvironmentProfile | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!profileLoading) {
      setNameInput(userProfile.name)
    }
  }, [profileLoading, userProfile.name])

  useEffect(() => {
    window.electron
      .loadLastScan()
      .then((saved) => {
        if (!saved) return
        setScanResult(saved.tools)
        setDetectedProfile(detectBestProfile(saved.tools, defaultProfiles))
      })
      .catch(() => {})
  }, [])

  async function persistProfile(profile: UserProfile): Promise<void> {
    await saveProfile(profile)
    setSavedIndicator(true)
    setTimeout(() => setSavedIndicator(false), 2000)
  }

  function handleNameBlur(): void {
    const trimmed = nameInput.trim() || DEFAULT_USER_PROFILE.name
    setNameInput(trimmed)
    if (trimmed !== userProfile.name) {
      persistProfile({ ...userProfile, name: trimmed })
    }
  }

  function toggleTool(toolId: UserProfile['toolIds'][number]): void {
    const newToolIds = userProfile.toolIds.includes(toolId)
      ? userProfile.toolIds.filter((id) => id !== toolId)
      : [...userProfile.toolIds, toolId]
    persistProfile({ ...userProfile, toolIds: newToolIds })
  }

  async function applyPreset(preset: EnvironmentProfile): Promise<void> {
    const newProfile: UserProfile = {
      id: 'active-profile',
      name: preset.name,
      toolIds: preset.tools.map((t) => t.toolId)
    }
    setNameInput(preset.name)
    setShowPresetModal(false)
    await persistProfile(newProfile)
  }

  const checkedCount = userProfile.toolIds.length

  return (
    <section style={{ padding: 32, minWidth: 0 }}>
      {/* Header */}
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
        Perfil ativo
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 300px' }}>
          <input
            ref={nameInputRef}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => e.key === 'Enter' && nameInputRef.current?.blur()}
            disabled={profileLoading}
            style={{
              fontSize: 36,
              fontWeight: 800,
              lineHeight: 1.1,
              background: 'transparent',
              border: 'none',
              borderBottom: '2px solid transparent',
              color: '#e5e7eb',
              outline: 'none',
              padding: '2px 0',
              minWidth: 0,
              flex: 1,
              cursor: 'text',
              transition: 'border-color 0.15s'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderBottomColor = 'rgba(147, 197, 253, 0.5)'
            }}
            placeholder="Nome do perfil"
            aria-label="Nome do perfil"
          />
          {savedIndicator && (
            <span
              style={{
                fontSize: 12,
                color: '#4ade80',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 6,
                background: 'rgba(34, 197, 94, 0.12)',
                whiteSpace: 'nowrap'
              }}
            >
              Salvo
            </span>
          )}
        </div>

        <button
          onClick={() => setShowPresetModal(true)}
          style={{
            border: '1px solid rgba(148, 163, 184, 0.24)',
            borderRadius: 10,
            padding: '10px 16px',
            background: 'rgba(15, 23, 42, 0.7)',
            color: '#e5e7eb',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
            whiteSpace: 'nowrap'
          }}
        >
          Usar perfil padrão
        </button>
      </div>

      <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 0, marginBottom: 24 }}>
        Clique no nome para editar. As ferramentas marcadas são usadas no cálculo de
        compatibilidade e recomendações.
      </p>

      {/* Auto-detect banner */}
      {detectedProfile &&
        scanResult &&
        detectedProfile.name !== userProfile.name && (
          <div
            style={{
              border: '1px solid rgba(147, 197, 253, 0.22)',
              borderRadius: 14,
              padding: '12px 16px',
              background: 'rgba(37, 99, 235, 0.08)',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap'
            }}
          >
            <div style={{ fontSize: 14, color: '#cbd5e1' }}>
              <span style={{ color: '#93c5fd', fontWeight: 700 }}>Detectado: </span>
              Seu ambiente se parece mais com{' '}
              <strong style={{ color: '#e5e7eb' }}>{detectedProfile.name}</strong>.
            </div>
            <button
              onClick={() => applyPreset(detectedProfile)}
              style={{
                border: 'none',
                borderRadius: 8,
                padding: '7px 14px',
                background: '#2563eb',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              Usar este perfil
            </button>
          </div>
        )}

      {/* Tool list */}
      <div
        style={{
          border: '1px solid rgba(148, 163, 184, 0.16)',
          borderRadius: 20,
          background: 'rgba(15, 23, 42, 0.72)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <h2 style={{ margin: 0, fontSize: 16 }}>Ferramentas incluídas no perfil</h2>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>
            {checkedCount} de {toolsCatalog.length} selecionadas
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))'
          }}
        >
          {toolsCatalog.map((tool) => {
            const checked = userProfile.toolIds.includes(tool.id)
            return (
              <label
                key={tool.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '14px 20px',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
                  cursor: 'pointer',
                  background: checked ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
                  transition: 'background 0.1s'
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleTool(tool.id)}
                  style={{
                    marginTop: 3,
                    width: 16,
                    height: 16,
                    accentColor: '#2563eb',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap'
                    }}
                  >
                    <span style={{ fontWeight: 700, color: checked ? '#e5e7eb' : '#94a3b8' }}>
                      {tool.name}
                    </span>
                    <span
                      style={{
                        color: '#64748b',
                        background: 'rgba(148, 163, 184, 0.1)',
                        borderRadius: 999,
                        padding: '2px 7px',
                        fontSize: 11
                      }}
                    >
                      {tool.category}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: '3px 0 0',
                      color: '#64748b',
                      fontSize: 12,
                      lineHeight: 1.5
                    }}
                  >
                    {tool.description}
                  </p>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {/* Preset modal */}
      {showPresetModal && (
        <PresetModal
          profiles={defaultProfiles}
          scanResult={scanResult}
          onApply={applyPreset}
          onClose={() => setShowPresetModal(false)}
        />
      )}
    </section>
  )
}

type PresetModalProps = {
  profiles: EnvironmentProfile[]
  scanResult: EnvironmentScanResult | null
  onApply: (profile: EnvironmentProfile) => void
  onClose: () => void
}

function PresetModal({ profiles, scanResult, onApply, onClose }: PresetModalProps): React.JSX.Element {
  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(2, 6, 23, 0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Escolher perfil padrão"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(640px, 100%)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          borderRadius: 20,
          background: 'rgba(15, 23, 42, 0.98)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.42)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.14)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, color: '#e5e7eb' }}>Perfis padrão</h2>
          <button
            onClick={onClose}
            style={{
              border: '1px solid rgba(148, 163, 184, 0.22)',
              borderRadius: 8,
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#e5e7eb',
              cursor: 'pointer',
              fontWeight: 700,
              padding: '6px 10px'
            }}
          >
            Fechar
          </button>
        </div>

        <div style={{ padding: 16, display: 'grid', gap: 10 }}>
          {profiles.map((profile) => {
            const compat = scanResult
              ? calculateProfileCompatibility(scanResult, profile)
              : null

            return (
              <button
                key={profile.id}
                onClick={() => onApply(profile)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 12,
                  padding: '14px 16px',
                  border: '1px solid rgba(148, 163, 184, 0.14)',
                  borderRadius: 14,
                  background: 'rgba(2, 6, 23, 0.3)',
                  color: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(147, 197, 253, 0.35)'
                  e.currentTarget.style.background = 'rgba(37, 99, 235, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.14)'
                  e.currentTarget.style.background = 'rgba(2, 6, 23, 0.3)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#e5e7eb', fontSize: 15 }}>
                    {profile.name}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
                    {profile.description}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 6 }}>
                    {profile.tools.length} ferramentas ·{' '}
                    {profile.tools.filter((t) => t.required).length} obrigatórias
                  </div>
                </div>

                {compat && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      gap: 4,
                      flexShrink: 0
                    }}
                  >
                    <span
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: compat.score >= 70 ? '#4ade80' : compat.score >= 40 ? '#facc15' : '#f87171'
                      }}
                    >
                      {compat.score}%
                    </span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>compatível</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
