import { useEffect, useState } from 'react'

import { useAppStore } from '../store/useAppStore'

type Mode = 'login' | 'register' | 'forgot-password' | 'reset-password'

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

const errorBoxStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: 'rgba(251, 113, 133, 0.1)',
  border: '1px solid rgba(251, 113, 133, 0.25)',
  borderRadius: 8,
  color: '#fca5a5',
  fontSize: 13,
}

const submitButtonStyle = (disabled: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '12px',
  background: disabled ? 'rgba(37, 99, 235, 0.6)' : '#2563eb',
  border: 'none',
  borderRadius: 10,
  color: '#fff',
  fontSize: 14,
  fontWeight: 700,
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: FONT,
  marginTop: 4,
})

const linkButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#3b82f6',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  padding: 0,
  fontFamily: FONT,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  color: '#94a3b8',
  marginBottom: 6,
  fontWeight: 500,
}

function AuthPage(): React.JSX.Element {
  const { login, register, loginWithGoogle } = useAppStore()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  useEffect(() => {
    window.electron.onDeepLink((url: string) => {
      if (url.startsWith('devclone://reset-password')) {
        const token = new URL(url).searchParams.get('token') ?? ''
        setResetToken(token)
        setPassword('')
        setConfirmPassword('')
        setError(null)
        setResetSuccess(false)
        setMode('reset-password')
      }
    })
  }, [])

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

  async function handleGoogle(): Promise<void> {
    setError(null)
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao autenticar com Google.')
    } finally {
      setGoogleLoading(false)
    }
  }

  function switchMode(): void {
    setMode((m) => (m === 'login' ? 'register' : 'login'))
    setError(null)
    setName('')
    setEmail('')
    setPassword('')
  }

  async function handleForgotPassword(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!email.includes('@') || !email.includes('.')) {
      setError('Email inválido.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await window.api.forgotPassword(email)
      setForgotSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await window.api.resetPassword(resetToken, password)
      setResetSuccess(true)
      setTimeout(() => setMode('login'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const modeTitle: Record<Mode, string> = {
    login: 'Entrar na sua conta',
    register: 'Criar uma conta',
    'forgot-password': 'Recuperar senha',
    'reset-password': 'Redefinir senha',
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
          {modeTitle[mode]}
        </h2>

        {/* Login / Cadastro */}
        {(mode === 'login' || mode === 'register') && (
          <>
            <form
              onSubmit={(e) => void handleSubmit(e)}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              {mode === 'register' && (
                <div>
                  <label style={labelStyle}>Nome</label>
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
                <label style={labelStyle}>Email</label>
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
                <label style={labelStyle}>Senha</label>
                <input
                  type="password"
                  placeholder={mode === 'login' ? 'Sua senha' : 'Mínimo 6 caracteres'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>

              {error !== null && <div style={errorBoxStyle}>{error}</div>}

              <button type="submit" disabled={submitting} style={submitButtonStyle(submitting)}>
                {submitting
                  ? mode === 'login'
                    ? 'Entrando...'
                    : 'Criando conta...'
                  : mode === 'login'
                    ? 'Entrar'
                    : 'Criar conta'}
              </button>
            </form>

            {mode === 'login' && (
              <p style={{ textAlign: 'center', margin: '12px 0 0', fontSize: 13 }}>
                <button
                  onClick={() => {
                    setMode('forgot-password')
                    setError(null)
                    setForgotSent(false)
                  }}
                  style={linkButtonStyle}
                >
                  Esqueci minha senha
                </button>
              </p>
            )}

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

            {/* Botão Google */}
            <button
              onClick={() => void handleGoogle()}
              disabled={googleLoading || submitting}
              style={{
                width: '100%',
                padding: '11px',
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.18)',
                borderRadius: 10,
                color: googleLoading ? '#64748b' : '#cbd5e1',
                fontSize: 14,
                fontWeight: 500,
                cursor: googleLoading || submitting ? 'not-allowed' : 'pointer',
                opacity: googleLoading || submitting ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                fontFamily: FONT,
              }}
            >
              <GoogleIcon />
              {googleLoading ? 'Aguardando Google...' : 'Continuar com Google'}
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
              <button onClick={switchMode} style={linkButtonStyle}>
                {mode === 'login' ? 'Criar conta' : 'Entrar'}
              </button>
            </p>
          </>
        )}

        {/* Recuperar senha */}
        {mode === 'forgot-password' && (
          <>
            {forgotSent ? (
              <p
                style={{
                  color: '#86efac',
                  fontSize: 14,
                  textAlign: 'center',
                  margin: '0 0 24px',
                  lineHeight: 1.6,
                }}
              >
                Verifique seu email — enviamos as instruções para você.
              </p>
            ) : (
              <form
                onSubmit={(e) => void handleForgotPassword(e)}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                {error !== null && <div style={errorBoxStyle}>{error}</div>}

                <button
                  type="submit"
                  disabled={submitting}
                  style={submitButtonStyle(submitting)}
                >
                  {submitting ? 'Enviando...' : 'Enviar instruções'}
                </button>
              </form>
            )}

            <p style={{ textAlign: 'center', margin: '24px 0 0', color: '#475569', fontSize: 13 }}>
              <button
                onClick={() => {
                  setMode('login')
                  setError(null)
                  setForgotSent(false)
                  setEmail('')
                }}
                style={linkButtonStyle}
              >
                Voltar para o login
              </button>
            </p>
          </>
        )}

        {/* Redefinir senha */}
        {mode === 'reset-password' && (
          <>
            {resetSuccess ? (
              <p
                style={{
                  color: '#86efac',
                  fontSize: 14,
                  textAlign: 'center',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Senha redefinida com sucesso!
              </p>
            ) : (
              <form
                onSubmit={(e) => void handleResetPassword(e)}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                <div>
                  <label style={labelStyle}>Nova senha</label>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                    autoComplete="new-password"
                    autoFocus
                  />
                </div>

                <div>
                  <label style={labelStyle}>Confirmar nova senha</label>
                  <input
                    type="password"
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={inputStyle}
                    autoComplete="new-password"
                  />
                </div>

                {error !== null && <div style={errorBoxStyle}>{error}</div>}

                <button
                  type="submit"
                  disabled={submitting}
                  style={submitButtonStyle(submitting)}
                >
                  {submitting ? 'Redefinindo...' : 'Redefinir senha'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AuthPage
