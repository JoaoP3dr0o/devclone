import type {
  LinuxCapabilities,
  MacOSCapabilities,
  WindowsCapabilities
} from '../../shared/platform/platform.capabilities'
import { PLATFORMS } from '../../shared/platform/platform.constants'
import type { CurrentPlatform, PlatformId } from '../../shared/platform/platform.types'

import { executeCommand } from './command.service'

const NODE_PLATFORM_TO_ID: Partial<Record<NodeJS.Platform, PlatformId>> = {
  win32: 'windows',
  linux: 'linux',
  darwin: 'macos'
}

function resolvePlatformId(): PlatformId {
  return NODE_PLATFORM_TO_ID[process.platform] ?? 'windows'
}

async function detectWindowsCapabilities(): Promise<WindowsCapabilities> {
  const [winget, docker, wsl, powershell] = await Promise.all([
    executeCommand('winget --version'),
    executeCommand('docker --version'),
    executeCommand('wsl --list'),
    executeCommand('powershell -Command "echo ok"')
  ])
  return {
    supportsWinget: winget !== null,
    supportsDockerDesktop: docker !== null,
    supportsWSL: wsl !== null,
    supportsPowerShell: powershell !== null
  }
}

async function detectLinuxCapabilities(): Promise<LinuxCapabilities> {
  const [apt, snap, systemd] = await Promise.all([
    executeCommand('apt --version'),
    executeCommand('snap --version'),
    executeCommand('systemctl --version')
  ])
  return {
    supportsApt: apt !== null,
    supportsSnap: snap !== null,
    supportsSystemd: systemd !== null
  }
}

async function detectMacOSCapabilities(): Promise<MacOSCapabilities> {
  const [brew, xcode] = await Promise.all([
    executeCommand('brew --version'),
    executeCommand('xcode-select --version')
  ])
  return {
    supportsBrew: brew !== null,
    supportsXcodeCLI: xcode !== null
  }
}

export function getCurrentPlatform(): Pick<CurrentPlatform, 'id' | 'name' | 'packageManager'> {
  const id = resolvePlatformId()
  const platform = PLATFORMS.find((entry) => entry.id === id) ?? PLATFORMS[0]
  return {
    id: platform.id,
    name: platform.name,
    packageManager: platform.packageManager
  }
}

export async function detectCurrentPlatform(): Promise<CurrentPlatform> {
  const base = getCurrentPlatform()
  let capabilities: CurrentPlatform['capabilities']

  if (base.id === 'windows') capabilities = await detectWindowsCapabilities()
  else if (base.id === 'linux') capabilities = await detectLinuxCapabilities()
  else capabilities = await detectMacOSCapabilities()

  return { ...base, capabilities }
}
