import { app } from 'electron'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'

const PENDING_INSTALLS_FILE = 'pending-installs.json'

function getPendingInstallsPath(): string {
  return join(app.getPath('userData'), PENDING_INSTALLS_FILE)
}

export async function savePendingInstall(toolId: string): Promise<void> {
  const current = await getPendingInstalls()
  if (current.includes(toolId)) return
  const updated = [...current, toolId]
  const filePath = getPendingInstallsPath()
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8')
}

export async function getPendingInstalls(): Promise<string[]> {
  try {
    const content = await readFile(getPendingInstallsPath(), 'utf-8')
    const parsed = JSON.parse(content) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

export async function clearPendingInstalls(): Promise<void> {
  const filePath = getPendingInstallsPath()
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify([], null, 2), 'utf-8')
}

export async function hasPendingInstalls(): Promise<boolean> {
  const pending = await getPendingInstalls()
  return pending.length > 0
}
