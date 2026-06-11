import { useEffect, useRef, useState } from 'react'

import { calculateProfileCompatibility, detectBestProfile } from '@shared/profiles/compatibility'
import { defaultProfiles } from '@shared/profiles/defaultProfiles'
import type { EnvironmentProfile, UserProfile } from '@shared/profiles/profile.types'
import { DEFAULT_USER_PROFILE } from '@shared/profiles/userProfile.utils'
import type { EnvironmentScanResult } from '@shared/scan.types'
import { toolsCatalog } from '@shared/tools/catalog'

import { useActiveProfile } from '../hooks/useActiveProfile'
import { useAppStore } from '../store/useAppStore'

function formatRelativeDate(isoDate: string | undefined): string | null {
  if (!isoDate) return null
  const diffDays = Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'hoje'
  if (diffDays === 1) return 'há 1 dia'
  if (diffDays < 7) return `há ${diffDays} dias`
  if (diffDays < 14) return 'há 1 semana'
  if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`
  if (diffDays < 60) return 'há 1 mês'
  return `há ${Math.floor(diffDays / 30)} meses`
}

export default function ProfilePage(): React.JSX.Element {
  const { userProfile, saveProfile, profileLoading } = useActiveProfile()
  const scanResult = useAppStore((s) => s.scanResult)
  const [nameInput, setNameInput] = useState('')
  const [showProfileManager, setShowProfileManager] = useState(false)
  const [savedIndicator, setSavedIndicator] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const detectedProfile = scanResult ? detectBestProfile(scanResult, defaultProfiles) : null

  useEffect(() => {
    if (!profileLoading) {
      setNameInput(userProfile.name)
    }
  }, [profileLoading, userProfile.name])

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
    await persistProfile(newProfile)
  }

  const checkedCount = userProfile.toolIds.length

  return (
    <section style={{ padding: 32, minWidth: 0 }}>
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
          onClick={() => setShowProfileManager(true)}
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
          Gerenciar perfis
        </button>
      </div>

      <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 0, marginBottom: 24 }}>
        Clique no nome para editar. As ferramentas marcadas são usadas no cálculo de
        compatibilidade e recomendações.
      </p>

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

      {showProfileManager && (
        <ProfileManagerModal
          scanResult={scanResult}
          onClose={() => setShowProfileManager(false)}
        />
      )}
    </section>
  )
}

type ProfileManagerModalProps = {
  scanResult: EnvironmentScanResult | null
  onClose: () => void
}

function SectionLabel({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div
      style={{
        color: '#64748b',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 10
      }}
    >
      {children}
    </div>
  )
}

function ProfileManagerModal({ scanResult, onClose }: ProfileManagerModalProps): React.JSX.Element {
  const profiles = useAppStore((s) => s.profiles)
  const activeProfileId = useAppStore((s) => s.activeProfileId)
  const storeCreateProfile = useAppStore((s) => s.createProfile)
  const storeDeleteProfile = useAppStore((s) => s.deleteProfile)
  const storeSetActiveProfile = useAppStore((s) => s.setActiveProfile)

  const [newName, setNewName] = useState('')
  const [pendingName, setPendingName] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [activating, setActivating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  function installedToolIds(): string[] {
    if (!scanResult) return []
    return scanResult.tools
      .filter((t) => t.status === 'healthy' || t.status === 'degraded')
      .map((t) => t.id)
  }

  function handleClickCreate(): void {
    const trimmed = newName.trim()
    if (!trimmed) return
    if (!scanResult) {
      void handleCreate(trimmed, [])
    } else {
      setPendingName(trimmed)
    }
  }

  async function handleCreate(name: string, toolIds: string[]): Promise<void> {
    setCreating(true)
    await storeCreateProfile(name, toolIds)
    setNewName('')
    setPendingName(null)
    setCreating(false)
  }

  async function handleActivate(id: string): Promise<void> {
    setActivating(id)
    await storeSetActiveProfile(id)
    setActivating(null)
  }

  async function handleDelete(id: string): Promise<void> {
    setDeleting(id)
    await storeDeleteProfile(id)
    setDeleting(null)
  }

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
        aria-label="Gerenciar perfis"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(640px, 100%)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          borderRadius: 20,
          background: 'rgba(15, 23, 42, 0.98)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.42)',
          overflow: 'hidden',
          maxHeight: 'calc(100vh - 48px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.14)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, color: '#e5e7eb' }}>Gerenciar perfis</h2>
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

        {/* Body */}
        <div style={{ padding: 16, display: 'grid', gap: 24, overflowY: 'auto' }}>

          {/* Seus perfis */}
          <section>
            <SectionLabel>Seus perfis</SectionLabel>
            <div style={{ display: 'grid', gap: 8 }}>
              {profiles.map((profile) => {
                const isActive = profile.id === activeProfileId
                const relDate = formatRelativeDate(profile.updatedAt)
                const isActivating = activating === profile.id
                const isDeleting = deleting === profile.id

                return (
                  <div
                    key={profile.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '12px 16px',
                      border: `1px solid ${isActive ? 'rgba(147,197,253,0.3)' : 'rgba(148,163,184,0.14)'}`,
                      borderRadius: 14,
                      background: isActive ? 'rgba(37,99,235,0.08)' : 'rgba(2,6,23,0.3)'
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#e5e7eb', fontSize: 15 }}>
                        {profile.name}
                      </div>
                      <div style={{ color: '#64748b', fontSize: 12, marginTop: 3 }}>
                        {profile.toolIds.length}{' '}
                        {profile.toolIds.length === 1 ? 'ferramenta' : 'ferramentas'}
                        {relDate && ` · ${relDate}`}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                      {isActive ? (
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: 999,
                            background: 'rgba(37,99,235,0.22)',
                            color: '#93c5fd',
                            fontSize: 12,
                            fontWeight: 600
                          }}
                        >
                          Perfil ativo
                        </span>
                      ) : (
                        <button
                          onClick={() => void handleActivate(profile.id)}
                          disabled={isActivating || isDeleting}
                          style={{
                            border: '1px solid rgba(148,163,184,0.22)',
                            borderRadius: 8,
                            padding: '5px 12px',
                            background: 'rgba(30,41,59,0.8)',
                            color: '#cbd5e1',
                            fontWeight: 600,
                            cursor: isActivating ? 'not-allowed' : 'pointer',
                            opacity: isActivating ? 0.6 : 1,
                            fontSize: 13
                          }}
                        >
                          {isActivating ? '...' : 'Ativar'}
                        </button>
                      )}

                      {!isActive && profiles.length > 1 && (
                        <button
                          onClick={() => void handleDelete(profile.id)}
                          disabled={isDeleting || isActivating}
                          aria-label={`Remover ${profile.name}`}
                          style={{
                            border: '1px solid rgba(251,113,133,0.2)',
                            borderRadius: 8,
                            padding: '5px 8px',
                            background: 'rgba(251,113,133,0.06)',
                            color: '#fca5a5',
                            fontWeight: 700,
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            opacity: isDeleting ? 0.6 : 1,
                            fontSize: 12,
                            lineHeight: 1
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Novo perfil */}
          <section>
            <SectionLabel>Novo perfil</SectionLabel>

            {pendingName ? (
              <div
                style={{
                  border: '1px solid rgba(147,197,253,0.22)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  background: 'rgba(37,99,235,0.07)'
                }}
              >
                <p style={{ margin: '0 0 12px', fontSize: 13, color: '#cbd5e1' }}>
                  Como quer começar o perfil{' '}
                  <strong style={{ color: '#e5e7eb' }}>"{pendingName}"</strong>?
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => void handleCreate(pendingName, installedToolIds())}
                    disabled={creating}
                    style={{
                      border: 'none',
                      borderRadius: 9,
                      padding: '8px 16px',
                      background: creating ? 'rgba(148,163,184,0.2)' : '#2563eb',
                      color: creating ? '#64748b' : '#fff',
                      fontWeight: 700,
                      cursor: creating ? 'not-allowed' : 'pointer',
                      fontSize: 13,
                      opacity: creating ? 0.6 : 1
                    }}
                  >
                    {creating ? 'Criando...' : 'Começar com ferramentas instaladas'}
                  </button>
                  <button
                    onClick={() => void handleCreate(pendingName, [])}
                    disabled={creating}
                    style={{
                      border: '1px solid rgba(148,163,184,0.22)',
                      borderRadius: 9,
                      padding: '8px 16px',
                      background: 'rgba(2,6,23,0.4)',
                      color: creating ? '#64748b' : '#cbd5e1',
                      fontWeight: 600,
                      cursor: creating ? 'not-allowed' : 'pointer',
                      fontSize: 13,
                      opacity: creating ? 0.6 : 1
                    }}
                  >
                    Começar vazio
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleClickCreate()
                  }}
                  placeholder="Nome do perfil"
                  disabled={creating}
                  style={{
                    flex: 1,
                    padding: '9px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(148,163,184,0.22)',
                    background: 'rgba(2,6,23,0.4)',
                    color: '#e5e7eb',
                    fontSize: 14,
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
                <button
                  onClick={handleClickCreate}
                  disabled={creating || !newName.trim()}
                  style={{
                    border: 'none',
                    borderRadius: 10,
                    padding: '9px 18px',
                    background: newName.trim() && !creating ? '#2563eb' : 'rgba(148,163,184,0.2)',
                    color: newName.trim() && !creating ? '#fff' : '#64748b',
                    fontWeight: 700,
                    cursor: creating || !newName.trim() ? 'not-allowed' : 'pointer',
                    fontSize: 14,
                    whiteSpace: 'nowrap',
                    opacity: creating ? 0.6 : 1
                  }}
                >
                  {creating ? 'Criando...' : 'Criar'}
                </button>
              </div>
            )}
          </section>

          {/* Perfis padrão */}
          <section>
            <SectionLabel>Perfis padrão</SectionLabel>
            <div style={{ display: 'grid', gap: 10 }}>
              {defaultProfiles.map((preset) => {
                const compat = scanResult
                  ? calculateProfileCompatibility(scanResult, preset)
                  : null

                return (
                  <button
                    key={preset.id}
                    onClick={() =>
                      void handleCreate(
                        preset.name,
                        preset.tools.map((t) => t.toolId)
                      )
                    }
                    disabled={creating}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: 12,
                      padding: '14px 16px',
                      border: '1px solid rgba(148,163,184,0.14)',
                      borderRadius: 14,
                      background: 'rgba(2,6,23,0.3)',
                      color: 'inherit',
                      cursor: creating ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      transition: 'border-color 0.15s, background 0.15s',
                      opacity: creating ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!creating) {
                        e.currentTarget.style.borderColor = 'rgba(147,197,253,0.35)'
                        e.currentTarget.style.background = 'rgba(37,99,235,0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(148,163,184,0.14)'
                      e.currentTarget.style.background = 'rgba(2,6,23,0.3)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#e5e7eb', fontSize: 15 }}>
                        {preset.name}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
                        {preset.description}
                      </div>
                      <div style={{ color: '#64748b', fontSize: 12, marginTop: 6 }}>
                        {preset.tools.length} ferramentas ·{' '}
                        {preset.tools.filter((t) => t.required).length} obrigatórias
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
                            color:
                              compat.score >= 70
                                ? '#4ade80'
                                : compat.score >= 40
                                  ? '#facc15'
                                  : '#f87171'
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
          </section>
        </div>
      </div>
    </div>
  )
}
