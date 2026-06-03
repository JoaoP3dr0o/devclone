import { app } from 'electron'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'

import type { EnvironmentScanResult, LastScanStorage } from '../../shared/scan.types'
import type { SavedUserProfile, UserProfile } from '../../shared/profiles/profile.types'

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

const ACTIVE_PROFILE_FILE_NAME = 'active-profile.json'
const PROFILE_STORAGE_VERSION = 1

function getActiveProfileFilePath(): string {
  return join(app.getPath('userData'), ACTIVE_PROFILE_FILE_NAME)
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const saved: SavedUserProfile = { version: PROFILE_STORAGE_VERSION, profile }
  const filePath = getActiveProfileFilePath()
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify(saved, null, 2), 'utf-8')
}

export async function loadUserProfile(): Promise<UserProfile | null> {
  try {
    const content = await readFile(getActiveProfileFilePath(), 'utf-8')
    const parsed = JSON.parse(content) as SavedUserProfile
    if (parsed.version !== PROFILE_STORAGE_VERSION || !parsed.profile?.toolIds) return null
    return parsed.profile
  } catch {
    return null
  }
}

export async function loadLastScan(): Promise<LastScanStorage | null> {
  try {
    const filePath = getLastScanFilePath()
    const content = await readFile(filePath, 'utf-8')
    const parsed = JSON.parse(content) as LastScanStorage

    if (
      parsed.version !== STORAGE_VERSION ||
      !parsed.lastScanAt ||
      !parsed.tools ||
      !Array.isArray(parsed.tools.tools)
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}
