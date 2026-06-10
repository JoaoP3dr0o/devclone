export type EnvironmentProfileTool = {
  toolId: string
  required: boolean
  minimumVersion?: string
}

export type EnvironmentProfile = {
  id: string
  name: string
  description: string
  tools: EnvironmentProfileTool[]
}

export type UserProfile = {
  id: string
  name: string
  toolIds: string[]
  createdAt?: string
  updatedAt?: string
}

export type ProfilesStore = {
  version: number
  activeProfileId: string
  profiles: UserProfile[]
}
