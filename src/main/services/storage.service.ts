import { app } from 'electron'
import { mkdir, readFile, unlink, writeFile } from 'fs/promises'
import { dirname, join } from 'path'

import type { ProfilesStore, UserProfile } from '../../shared/profiles/profile.types'
import { createDefaultProfilesStore } from '../../shared/profiles/userProfile.utils'
import type { EnvironmentScanResult, LastScanStorage } from '../../shared/scan.types'

// ─── Last scan ───────────────────────────────────────────────────────────────

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
    const content = await readFile(getLastScanFilePath(), 'utf-8')
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

// ─── Profiles ────────────────────────────────────────────────────────────────

const PROFILES_FILE = 'profiles.json'
const ACTIVE_PROFILE_FILE_NAME = 'active-profile.json'

function getProfilesFilePath(): string {
  return join(app.getPath('userData'), PROFILES_FILE)
}

function getActiveProfileFilePath(): string {
  return join(app.getPath('userData'), ACTIVE_PROFILE_FILE_NAME)
}

function isValidProfilesStore(value: unknown): value is ProfilesStore {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v['version'] === 'number' &&
    typeof v['activeProfileId'] === 'string' &&
    Array.isArray(v['profiles'])
  )
}

interface LegacyProfileFile {
  profile: {
    name: string
    toolIds: string[]
  }
}

function isLegacyProfileFile(value: unknown): value is LegacyProfileFile {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  if (!v['profile'] || typeof v['profile'] !== 'object') return false
  const p = v['profile'] as Record<string, unknown>
  return typeof p['name'] === 'string' && Array.isArray(p['toolIds'])
}

export async function saveProfilesStore(store: ProfilesStore): Promise<void> {
  const filePath = getProfilesFilePath()
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify(store, null, 2), 'utf-8')
}

export async function getProfilesStore(): Promise<ProfilesStore> {
  // 1. Try profiles.json
  try {
    const content = await readFile(getProfilesFilePath(), 'utf-8')
    const parsed: unknown = JSON.parse(content)
    if (isValidProfilesStore(parsed)) return parsed
  } catch {
    // does not exist or is corrupt — fall through to migration
  }

  // 2. Try migrating from active-profile.json
  try {
    const content = await readFile(getActiveProfileFilePath(), 'utf-8')
    const legacy: unknown = JSON.parse(content)

    if (isLegacyProfileFile(legacy)) {
      const now = new Date().toISOString()
      const migratedProfile: UserProfile = {
        id: crypto.randomUUID(),
        name: legacy.profile.name,
        toolIds: legacy.profile.toolIds,
        createdAt: now,
        updatedAt: now
      }
      const store: ProfilesStore = {
        version: 1,
        activeProfileId: migratedProfile.id,
        profiles: [migratedProfile]
      }
      await saveProfilesStore(store)
      await unlink(getActiveProfileFilePath())
      console.log('[DevClone] Migrated active-profile.json to profiles.json')
      return store
    }
  } catch {
    // active-profile.json does not exist — fall through to default
  }

  // 3. No existing data: create default store
  const defaultStore = createDefaultProfilesStore()
  await saveProfilesStore(defaultStore)
  return defaultStore
}

export async function getLocalProfilesRaw(): Promise<ProfilesStore | null> {
  try {
    const content = await readFile(getProfilesFilePath(), 'utf-8')
    const parsed: unknown = JSON.parse(content)
    if (isValidProfilesStore(parsed)) return parsed
    return null
  } catch {
    return null
  }
}

const MIGRATED_FLAG_FILE = 'migrated.json'

export async function checkMigrated(): Promise<boolean> {
  try {
    await readFile(join(app.getPath('userData'), MIGRATED_FLAG_FILE), 'utf-8')
    return true
  } catch {
    return false
  }
}

export async function setMigrated(): Promise<void> {
  await writeFile(join(app.getPath('userData'), MIGRATED_FLAG_FILE), '{}', 'utf-8')
}

// ─── Backward-compat wrappers ─────────────────────────────────────────────────

export async function loadUserProfile(): Promise<UserProfile | null> {
  const store = await getProfilesStore()
  return store.profiles.find((p) => p.id === store.activeProfileId) ?? null
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const store = await getProfilesStore()
  const now = new Date().toISOString()
  const profiles = store.profiles.map((p) =>
    p.id === profile.id ? { ...profile, updatedAt: now } : p
  )
  await saveProfilesStore({ ...store, profiles })
}
