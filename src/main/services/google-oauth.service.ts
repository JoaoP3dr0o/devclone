import { createHash, randomBytes } from 'crypto'
import http from 'http'
import { shell } from 'electron'

import { GOOGLE_CONFIG } from '../config/google.config'
import { loginWithGoogle, User } from './auth.service'

// ── PKCE helpers ──────────────────────────────────────────────────────────────

function generateCodeVerifier(): string {
  // 32 bytes → 43 base64url chars (dentro do limite 43-128)
  return randomBytes(32).toString('base64url')
}

function generateCodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url')
}

function generateState(): string {
  return randomBytes(16).toString('hex')
}

function buildAuthUrl(codeChallenge: string, state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CONFIG.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_CONFIG.scopes.join(' '),
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
    access_type: 'offline',
  })
  return `${GOOGLE_CONFIG.authEndpoint}?${params.toString()}`
}

// ── Páginas de resposta ao navegador ─────────────────────────────────────────

const SUCCESS_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>DevClone</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Inter,ui-sans-serif,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#080d18;color:#e5e7eb}
  .card{text-align:center;max-width:420px;padding:48px 40px}
  h1{font-size:24px;font-weight:700;color:#34d399;margin-bottom:12px}
  p{color:#94a3b8;font-size:15px;line-height:1.6}
</style>
</head>
<body>
<div class="card">
  <h1>Login realizado!</h1>
  <p>Pode fechar esta aba e voltar ao DevClone.</p>
</div>
</body>
</html>`

const CANCEL_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>DevClone</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Inter,ui-sans-serif,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#080d18;color:#e5e7eb}
  .card{text-align:center;max-width:420px;padding:48px 40px}
  h1{font-size:24px;font-weight:700;color:#fb7185;margin-bottom:12px}
  p{color:#94a3b8;font-size:15px;line-height:1.6}
</style>
</head>
<body>
<div class="card">
  <h1>Login cancelado</h1>
  <p>O login com Google foi cancelado. Pode fechar esta aba.</p>
</div>
</body>
</html>`

// ── Servidor de callback efêmero ──────────────────────────────────────────────

type CallbackServer = {
  port: number
  codePromise: Promise<string>
}

function tryOnPort(port: number, state: string): Promise<CallbackServer> {
  return new Promise<CallbackServer>((resolveServer, rejectServer) => {
    let handled = false
    let timeoutId: ReturnType<typeof setTimeout>

    // Deferred promise para o código de autorização
    let resolveCode!: (code: string) => void
    let rejectCode!: (err: Error) => void
    const codePromise = new Promise<string>((res, rej) => {
      resolveCode = res
      rejectCode = rej
    })

    const server = http.createServer((req, res) => {
      // Ignora requisições extras do browser (favicon etc.)
      if (handled) {
        res.writeHead(200).end()
        return
      }

      const reqUrl = new URL(req.url ?? '/', `http://localhost:${port}`)
      if (reqUrl.pathname !== '/callback') {
        res.writeHead(200).end()
        return
      }

      handled = true
      clearTimeout(timeoutId)

      const error = reqUrl.searchParams.get('error')
      const returnedState = reqUrl.searchParams.get('state')
      const code = reqUrl.searchParams.get('code')

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(error ? CANCEL_HTML : SUCCESS_HTML)

      server.close()

      if (error) {
        rejectCode(new Error('Login cancelado'))
      } else if (returnedState !== state) {
        rejectCode(new Error('Erro de segurança: state inválido'))
      } else if (!code) {
        rejectCode(new Error('Código de autorização não recebido'))
      } else {
        resolveCode(code)
      }
    })

    server.on('error', (err: Error) => {
      clearTimeout(timeoutId)
      // Antes de estar escutando: rejeita a criação do servidor
      // Depois: rejeita a promessa do código
      if (!handled) {
        rejectServer(err)
      } else {
        rejectCode(err)
      }
    })

    server.listen(port, 'localhost', () => {
      // Timeout de 2 minutos para o usuário completar o fluxo
      timeoutId = setTimeout(() => {
        if (!handled) {
          handled = true
          server.close()
          rejectCode(new Error('Tempo esgotado. Tente novamente.'))
        }
      }, 2 * 60 * 1000)

      resolveServer({ port, codePromise })
    })
  })
}

async function startCallbackServer(startPort: number, state: string): Promise<CallbackServer> {
  for (let port = startPort; port < startPort + 10; port++) {
    try {
      return await tryOnPort(port, state)
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'EADDRINUSE') continue
      throw err
    }
  }
  throw new Error('Nenhuma porta disponível para o callback OAuth')
}

// ── Fluxo principal ───────────────────────────────────────────────────────────

export async function startGoogleAuth(): Promise<{ user: User }> {
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)
  const state = generateState()

  const { port, codePromise } = await startCallbackServer(GOOGLE_CONFIG.callbackPort, state)
  const redirectUri = `http://localhost:${port}/callback`
  const authUrl = buildAuthUrl(codeChallenge, state, redirectUri)

  await shell.openExternal(authUrl)

  const code = await codePromise

  return loginWithGoogle(code, codeVerifier, redirectUri)
}
