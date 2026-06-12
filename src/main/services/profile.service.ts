import { ApiError, apiRequest } from './api.client'
import { clearToken } from './token.store'
import type { ProfilesStore, UserProfile } from '../../shared/profiles/profile.types'

interface ApiProfile {
  id: string
  name: string
  toolIds: string[]
  isActive: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

function mapApiProfileToLocal(api: ApiProfile): UserProfile {
  return {
    id: api.id,
    name: api.name,
    toolIds: api.toolIds,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  }
}

function handleUnauthorized(error: unknown): never {
  if (error instanceof ApiError && error.status === 401) {
    clearToken()
    throw new Error('UNAUTHORIZED')
  }
  throw error
}

export async function fetchProfiles(): Promise<ProfilesStore> {
  try {
    const { profiles } = await apiRequest<{ profiles: ApiProfile[] }>('GET', '/profiles', undefined, true)
    const active = profiles.find((p) => p.isActive) ?? profiles[0]
    return {
      version: 1,
      activeProfileId: active?.id ?? '',
      profiles: profiles.map(mapApiProfileToLocal),
    }
  } catch (error) {
    handleUnauthorized(error)
  }
}

export async function createProfile(name: string, toolIds: string[]): Promise<UserProfile> {
  try {
    const { profile } = await apiRequest<{ profile: ApiProfile }>('POST', '/profiles', { name, toolIds }, true)
    return mapApiProfileToLocal(profile)
  } catch (error) {
    handleUnauthorized(error)
  }
}

export async function updateProfile(
  id: string,
  data: { name?: string; toolIds?: string[] }
): Promise<UserProfile> {
  try {
    const { profile } = await apiRequest<{ profile: ApiProfile }>('PATCH', `/profiles/${id}`, data, true)
    return mapApiProfileToLocal(profile)
  } catch (error) {
    handleUnauthorized(error)
  }
}

export async function deleteProfile(id: string): Promise<void> {
  try {
    await apiRequest<void>('DELETE', `/profiles/${id}`, undefined, true)
  } catch (error) {
    handleUnauthorized(error)
  }
}

export async function activateProfile(id: string): Promise<void> {
  try {
    await apiRequest<void>('PATCH', `/profiles/${id}/activate`, undefined, true)
  } catch (error) {
    console.error('[DevClone] activateProfile — error:', error)
    handleUnauthorized(error)
  }
}
