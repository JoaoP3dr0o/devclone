import React, { useEffect, useState } from 'react'

interface UpdateInfo {
  version: string
  percent?: number
}

export function UpdateBanner(): React.JSX.Element | null {
  const [state, setState] = useState<'idle' | 'downloading' | 'ready'>('idle')
  const [info, setInfo] = useState<UpdateInfo | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    window.api.onUpdaterEvent(({ event, data }) => {
      if (event === 'available') {
        setState('downloading')
        setInfo(data as UpdateInfo)
      }
      if (event === 'progress') {
        const p = data as { percent: number }
        setProgress(Math.round(p.percent))
      }
      if (event === 'downloaded') {
        setState('ready')
        setInfo(data as UpdateInfo)
        setProgress(100)
      }
    })
  }, [])

  if (state === 'idle') return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        background: '#1c2128',
        border: '1px solid #30363d',
        borderRadius: '10px',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 9999,
        minWidth: '260px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
      }}
    >
      {state === 'downloading' && (
        <>
          <span style={{ color: '#58a6ff', fontSize: '13px' }}>
            ⬇ Baixando atualização {info?.version}...
          </span>
          <div style={{ background: '#30363d', borderRadius: '4px', height: '4px' }}>
            <div
              style={{
                background: 'linear-gradient(90deg, #1f6feb, #58a6ff)',
                height: '100%',
                width: `${progress}%`,
                transition: 'width 0.3s ease',
                borderRadius: '4px'
              }}
            />
          </div>
          <span style={{ color: '#8b949e', fontSize: '11px' }}>{progress}%</span>
        </>
      )}
      {state === 'ready' && (
        <>
          <span style={{ color: '#3fb950', fontSize: '13px' }}>
            ✓ Atualização {info?.version} pronta
          </span>
          <button
            onClick={() => void window.api.applyUpdate()}
            style={{
              background: '#238636',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Reiniciar e atualizar
          </button>
        </>
      )}
    </div>
  )
}
