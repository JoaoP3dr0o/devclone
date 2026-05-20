export type PackageManager = 'winget' | 'apt' | 'brew'

export type PlatformId = 'windows' | 'linux' | 'macos'

export type PlatformDefinition = {
  id: PlatformId
  name: string
  packageManager: PackageManager
}
