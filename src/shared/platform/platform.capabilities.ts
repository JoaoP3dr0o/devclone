export type WindowsCapabilities = {
  supportsWinget: boolean
  supportsDockerDesktop: boolean
  supportsWSL: boolean
  supportsPowerShell: boolean
}

export type LinuxCapabilities = {
  supportsApt: boolean
  supportsSnap: boolean
  supportsSystemd: boolean
}

export type MacOSCapabilities = {
  supportsBrew: boolean
  supportsXcodeCLI: boolean
}

export type PlatformCapabilities = {
  windows: WindowsCapabilities
  linux: LinuxCapabilities
  macos: MacOSCapabilities
}

