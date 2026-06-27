import { describe, it, expect } from 'vitest'
import { resolveInstallCommand } from '../install.service'
import type { InstallMethods } from '../../../shared/tools/install.types'

const fullMethods: InstallMethods = {
  windows: 'winget install Tool.Id',
  linux: {
    apt: 'sudo apt install tool -y',
    dnf: 'sudo dnf install tool -y',
    // pacman intentionally omitted — simulates vscode/postman TODOs
  },
  macos: 'brew install tool'
}

describe('resolveInstallCommand', () => {
  it('windows: returns the windows string', () => {
    expect(resolveInstallCommand(fullMethods, 'windows', null)).toBe('winget install Tool.Id')
  })

  it('macos: returns the macos string', () => {
    expect(resolveInstallCommand(fullMethods, 'macos', null)).toBe('brew install tool')
  })

  it('linux distro-agnostic string: returns it regardless of manager', () => {
    const methods: InstallMethods = { linux: 'curl -fsSL https://bun.sh/install | bash' }
    expect(resolveInstallCommand(methods, 'linux', null)).toBe('curl -fsSL https://bun.sh/install | bash')
    expect(resolveInstallCommand(methods, 'linux', 'apt')).toBe('curl -fsSL https://bun.sh/install | bash')
    expect(resolveInstallCommand(methods, 'linux', 'pacman')).toBe('curl -fsSL https://bun.sh/install | bash')
  })

  it('linux object + manager apt: returns the apt command', () => {
    expect(resolveInstallCommand(fullMethods, 'linux', 'apt')).toBe('sudo apt install tool -y')
  })

  it('linux object + manager dnf: returns the dnf command', () => {
    expect(resolveInstallCommand(fullMethods, 'linux', 'dnf')).toBe('sudo dnf install tool -y')
  })

  it('linux object without the manager key (pacman not in fullMethods): returns null', () => {
    expect(resolveInstallCommand(fullMethods, 'linux', 'pacman')).toBeNull()
  })

  it('linux + no manager detected (null): returns null', () => {
    expect(resolveInstallCommand(fullMethods, 'linux', null)).toBeNull()
  })

  it('linux with no linux entry at all: returns null', () => {
    const methods: InstallMethods = { windows: 'winget install Tool', macos: 'brew install tool' }
    expect(resolveInstallCommand(methods, 'linux', 'apt')).toBeNull()
  })
})
