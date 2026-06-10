import type { EnvironmentProfile, UserProfile } from '@shared/profiles/profile.types'
import { useAppStore } from '../store/useAppStore'

type ProfileInput = { name: string; toolIds: string[] }

type UseActiveProfileResult = {
  userProfile: UserProfile
  environmentProfile: EnvironmentProfile
  profileLoading: boolean
  saveProfile: (profile: ProfileInput) => Promise<void>
}

export function useActiveProfile(): UseActiveProfileResult {
  const userProfile = useAppStore((s) => s.userProfile)
  const environmentProfile = useAppStore((s) => s.environmentProfile)
  const profileLoading = useAppStore((s) => s.profileLoading)
  const setProfile = useAppStore((s) => s.setProfile)

  return { userProfile, environmentProfile, profileLoading, saveProfile: setProfile }
}
