export type LinuxPackageManager = 'apt' | 'dnf' | 'pacman'

export type LinuxInstallCommand =
  | string
  | Partial<Record<LinuxPackageManager, string>>

export type PlatformInstallCommand = {
  windows?: string
  macos?: string
  linux?: LinuxInstallCommand
}

export type InstallMethods = PlatformInstallCommand
