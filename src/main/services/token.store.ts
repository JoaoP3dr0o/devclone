import Store from 'electron-store'

// TODO: em produção, usar uma chave derivada de variável de ambiente (ex: process.env.STORE_ENCRYPTION_KEY)
const ENCRYPTION_KEY = 'devclone-token-store-key'

interface StoreSchema {
  token: string
}

const store = new Store<StoreSchema>({
  name: 'auth',
  encryptionKey: ENCRYPTION_KEY,
})

export function saveToken(token: string): void {
  store.set('token', token)
}

export function getToken(): string | null {
  return store.get('token') ?? null
}

export function clearToken(): void {
  store.delete('token')
}
