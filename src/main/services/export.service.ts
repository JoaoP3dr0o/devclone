import { app, dialog } from 'electron'
import { writeFile } from 'fs/promises'

import type { DevCloneExport } from '../../shared/profiles/export.types'
import { loadLastScan, loadUserProfile } from './storage.service'

export type ExportResult =
  | { success: true; path: string }
  | { success: false; cancelled: true }
  | { success: false; error: string }

export async function exportProfile(): Promise<ExportResult> {
  const profile = await loadUserProfile()
  if (!profile) {
    return { success: false, error: 'Nenhum perfil encontrado para exportar' }
  }

  const lastScan = await loadLastScan()
  const date = new Date().toISOString().slice(0, 10)
  const safeName = profile.name.replace(/[^a-zA-Z0-9]/g, '-')

  const exportData: DevCloneExport = {
    devclone_version: app.getVersion(),
    exported_at: new Date().toISOString(),
    profile: {
      name: profile.name,
      toolIds: profile.toolIds
    },
    scan: lastScan
      ? { lastScanAt: lastScan.lastScanAt, tools: lastScan.tools.tools }
      : null
  }

  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: `devclone-${safeName}-${date}.json`,
    filters: [{ name: 'DevClone Profile', extensions: ['json'] }]
  })

  if (canceled || !filePath) {
    return { success: false, cancelled: true }
  }

  await writeFile(filePath, JSON.stringify(exportData, null, 2), 'utf-8')
  return { success: true, path: filePath }
}
