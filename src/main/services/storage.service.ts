import { app } from 'electron'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'

import type { EnvironmentScanResult, LastScanStorage } from '../../shared/scan.types'

const LAST_SCAN_FILE_NAME = 'last-scan.json'
const STORAGE_VERSION = 1

function getLastScanFilePath(): string {
  return join(app.getPath('userData'), LAST_SCAN_FILE_NAME)
}

export async function saveLastScan(tools: EnvironmentScanResult): Promise<LastScanStorage> {
  const lastScan: LastScanStorage = {
    version: STORAGE_VERSION,
    lastScanAt: new Date().toISOString(),
    tools
  }
  const filePath = getLastScanFilePath()

  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify(lastScan, null, 2), 'utf-8')

  return lastScan
}

export async function loadLastScan(): Promise<LastScanStorage | null> {
  try {
    const filePath = getLastScanFilePath()
    const content = await readFile(filePath, 'utf-8')
    const parsed = JSON.parse(content) as LastScanStorage

    if (parsed.version !== STORAGE_VERSION || !parsed.lastScanAt || !parsed.tools) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}
