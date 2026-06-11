import { ipcMain } from 'electron'
import {
  getCurrentUser,
  isAuthenticated,
  login,
  loginWithGoogle,
  logout,
  register,
} from '../services/auth.service'
import { startGoogleAuth } from '../services/google-oauth.service'

export function registerAuthIpc(): void {
  ipcMain.handle('auth:register', (_event, name: unknown, email: unknown, password: unknown) => {
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      throw new Error('Parâmetros inválidos')
    }
    return register(name, email, password)
  })

  ipcMain.handle('auth:login', (_event, email: unknown, password: unknown) => {
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new Error('Parâmetros inválidos')
    }
    return login(email, password)
  })

  ipcMain.handle(
    'auth:google',
    (_event, code: unknown, codeVerifier: unknown, redirectUri: unknown) => {
      if (
        typeof code !== 'string' ||
        typeof codeVerifier !== 'string' ||
        typeof redirectUri !== 'string'
      ) {
        throw new Error('Parâmetros inválidos')
      }
      return loginWithGoogle(code, codeVerifier, redirectUri)
    }
  )

  ipcMain.handle('auth:google-start', () => startGoogleAuth())

  ipcMain.handle('auth:logout', () => logout())

  ipcMain.handle('auth:get-current-user', () => getCurrentUser())

  ipcMain.handle('auth:is-authenticated', () => isAuthenticated())
}
