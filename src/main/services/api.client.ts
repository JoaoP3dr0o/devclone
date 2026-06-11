import { API_CONFIG } from '../config/api.config'
import { getToken } from './token.store'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  auth?: boolean
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (auth) {
    const token = getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_CONFIG.baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const data = (await response.json()) as { message?: string; error?: string }
      message = data.message ?? data.error ?? message
    } catch {
      // use default message
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}
