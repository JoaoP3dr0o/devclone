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

export const PLATFORM_CAPABILITIES: PlatformCapabilities = {
  windows: {
    supportsWinget: true,
    supportsDockerDesktop: true,
    supportsWSL: true,
    supportsPowerShell: true
  },
  linux: {
    supportsApt: true,
    supportsSnap: true,
    supportsSystemd: true
  },
  macos: {
    supportsBrew: true,
    supportsXcodeCLI: true
  }
}
