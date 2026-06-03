import { useEffect, useState } from 'react'

import { userProfileToEnvironmentProfile, DEFAULT_USER_PROFILE } from '@shared/profiles/userProfile.utils'
import type { EnvironmentProfile, UserProfile } from '@shared/profiles/profile.types'

type UseActiveProfileResult = {
  userProfile: UserProfile
  environmentProfile: EnvironmentProfile
  profileLoading: boolean
  saveProfile: (profile: UserProfile) => Promise<void>
}

export function useActiveProfile(): UseActiveProfileResult {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    window.electron
      .getUserProfile()
      .then((saved) => setUserProfile(saved ?? DEFAULT_USER_PROFILE))
      .catch(() => setUserProfile(DEFAULT_USER_PROFILE))
      .finally(() => setProfileLoading(false))
  }, [])

  async function saveProfile(profile: UserProfile): Promise<void> {
    await window.electron.saveUserProfile(profile)
    setUserProfile(profile)
  }

  return {
    userProfile,
    environmentProfile: userProfileToEnvironmentProfile(userProfile),
    profileLoading,
    saveProfile
  }
}
