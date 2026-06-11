import { useState } from 'react'

import { useAppStore } from '../store/useAppStore'

type Mode = 'login' | 'register'

const FONT = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

function GoogleIcon(): React.JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: 'rgba(15, 23, 42, 0.8)',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  borderRadius: 10,
  color: '#e2e8f0',
  fontSize: 14,
  fontFamily: FONT,
  outline: 'none',
  boxSizing: 'border-box',
}

function AuthPage(): React.JSX.Element {
  const { login, register } = useAppStore()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function validate(): string | null {
    if (mode === 'register' && name.trim().length === 0) return 'Nome é obrigatório.'
    if (!email.includes('@') || !email.includes('.')) return 'Email inválido.'
    if (password.length < 6) return 'Senha deve ter no mínimo 6 caracteres.'
    return null
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  function switchMode(): void {
    setMode((m) => (m === 'login' ? 'register' : 'login'))
    setError(null)
    setName('')
    setEmail('')
    setPassword('')
  }

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at top left, rgba(37, 99, 235, 0.18), transparent 32%), #080d18',
        color: '#e5e7eb',
        fontFamily: FONT,
        padding: 24,
      }}
    >
      {/* Cabeçalho */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#f1f5f9',
            margin: '0 0 6px',
            letterSpacing: '-0.02em',
          }}
        >
          DevClone
        </h1>
        <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>Ambiente dev em um clique</p>
      </div>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(148, 163, 184, 0.12)',
          borderRadius: 20,
          padding: '36px 40px',
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#f1f5f9',
            margin: '0 0 24px',
            textAlign: 'center',
          }}
        >
          {mode === 'login' ? 'Entrar na sua conta' : 'Criar uma conta'}
        </h2>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {mode === 'register' && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  color: '#94a3b8',
                  marginBottom: 6,
                  fontWeight: 500,
                }}
              >
                Nome
              </label>
              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                autoComplete="name"
                autoFocus
              />
            </div>
          )}

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                color: '#94a3b8',
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              autoComplete="email"
              autoFocus={mode === 'login'}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                color: '#94a3b8',
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              Senha
            </label>
            <input
              type="password"
              placeholder={mode === 'login' ? 'Sua senha' : 'Mínimo 6 caracteres'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error !== null && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(251, 113, 133, 0.1)',
                border: '1px solid rgba(251, 113, 133, 0.25)',
                borderRadius: 8,
                color: '#fca5a5',
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px',
              background: submitting ? 'rgba(37, 99, 235, 0.6)' : '#2563eb',
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: FONT,
              marginTop: 4,
            }}
          >
            {submitting
              ? mode === 'login'
                ? 'Entrando...'
                : 'Criando conta...'
              : mode === 'login'
                ? 'Entrar'
                : 'Criar conta'}
          </button>
        </form>

        {/* Divisor */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '20px 0',
            color: '#334155',
            fontSize: 12,
          }}
        >
          <span style={{ flex: 1, height: 1, background: 'rgba(148, 163, 184, 0.12)' }} />
          ou
          <span style={{ flex: 1, height: 1, background: 'rgba(148, 163, 184, 0.12)' }} />
        </div>

        {/* Botão Google — desabilitado até a Parte 2.5 */}
        <button
          disabled
          title="Em breve"
          style={{
            width: '100%',
            padding: '11px',
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
            borderRadius: 10,
            color: '#475569',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'not-allowed',
            opacity: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontFamily: FONT,
          }}
        >
          <GoogleIcon />
          Continuar com Google
        </button>

        {/* Alternância de modo */}
        <p
          style={{
            textAlign: 'center',
            margin: '24px 0 0',
            color: '#475569',
            fontSize: 13,
          }}
        >
          {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
          <button
            onClick={switchMode}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              padding: 0,
              fontFamily: FONT,
            }}
          >
            {mode === 'login' ? 'Criar conta' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default AuthPage
