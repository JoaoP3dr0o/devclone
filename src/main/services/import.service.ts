import { dialog } from 'electron'
import { readFile } from 'fs/promises'

import type { UserProfile } from '../../shared/profiles/profile.types'
import { toolsCatalog } from '../../shared/tools/catalog'
import { saveUserProfile } from './storage.service'

export type ImportResult =
  | { success: true; profile: UserProfile; ignoredTools: string[] }
  | { success: false; cancelled: true }
  | { success: false; error: string }

function isValidImportShape(
  value: unknown
): value is { profile: { name: string; toolIds: unknown[] } } {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  if (!v['profile'] || typeof v['profile'] !== 'object') return false
  const p = v['profile'] as Record<string, unknown>
  return typeof p['name'] === 'string' && Array.isArray(p['toolIds'])
}

export async function importProfile(): Promise<ImportResult> {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'DevClone Profile', extensions: ['json'] }]
  })

  if (canceled || !filePaths[0]) {
    return { success: false, cancelled: true }
  }

  let parsed: unknown
  try {
    const content = await readFile(filePaths[0], 'utf-8')
    parsed = JSON.parse(content)
  } catch {
    return { success: false, error: 'Arquivo inválido ou corrompido' }
  }

  if (!isValidImportShape(parsed)) {
    return { success: false, error: 'Arquivo inválido ou corrompido' }
  }

  const knownIds = new Set(toolsCatalog.map((t) => t.id))
  const rawIds = parsed.profile.toolIds
  const validIds = rawIds.filter((id): id is string => typeof id === 'string' && knownIds.has(id))
  const ignoredTools = rawIds.filter(
    (id): id is string => typeof id === 'string' && !knownIds.has(id)
  )

  const profile: UserProfile = {
    id: 'active-profile',
    name: parsed.profile.name,
    toolIds: validIds
  }

  await saveUserProfile(profile)
  return { success: true, profile, ignoredTools }
}
