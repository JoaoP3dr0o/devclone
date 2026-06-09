import { app } from 'electron'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'

export type AppSettings = {
  autoScan: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  autoScan: true
}

const SETTINGS_FILE_NAME = 'settings.json'
const SETTINGS_VERSION = 1

type StoredSettings = { version: number; autoScan: boolean }

function getSettingsFilePath(): string {
  return join(app.getPath('userData'), SETTINGS_FILE_NAME)
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const content = await readFile(getSettingsFilePath(), 'utf-8')
    const parsed = JSON.parse(content) as StoredSettings
    if (parsed.version !== SETTINGS_VERSION) return DEFAULT_SETTINGS
    return {
      autoScan: typeof parsed.autoScan === 'boolean' ? parsed.autoScan : DEFAULT_SETTINGS.autoScan
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const stored: StoredSettings = { version: SETTINGS_VERSION, ...settings }
  const filePath = getSettingsFilePath()
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify(stored, null, 2), 'utf-8')
}
