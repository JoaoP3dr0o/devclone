import { ApiError, apiRequest } from './api.client'
import { clearToken, getToken, saveToken } from './token.store'

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
}

interface AuthResponse {
  user: User
  token: string
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ user: User }> {
  const data = await apiRequest<AuthResponse>('POST', '/auth/register', { name, email, password })
  saveToken(data.token)
  return { user: data.user }
}

export async function login(email: string, password: string): Promise<{ user: User }> {
  const data = await apiRequest<AuthResponse>('POST', '/auth/login', { email, password })
  saveToken(data.token)
  return { user: data.user }
}

export async function loginWithGoogle(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<{ user: User }> {
  const data = await apiRequest<AuthResponse>('POST', '/auth/google', {
    code,
    codeVerifier,
    redirectUri,
  })
  saveToken(data.token)
  return { user: data.user }
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<void>('DELETE', '/auth/logout', undefined, true)
  } finally {
    clearToken()
  }
}

export async function getCurrentUser(): Promise<{ user: User } | null> {
  if (!getToken()) return null
  try {
    return await apiRequest<{ user: User }>('GET', '/users/me', undefined, true)
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearToken()
    }
    return null
  }
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}
