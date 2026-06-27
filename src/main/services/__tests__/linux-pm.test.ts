import { vi, describe, it, expect, beforeEach } from 'vitest'

describe('linux package manager detection', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  function mockCommand(aptPath: string | null, dnfPath: string | null, pacmanPath: string | null) {
    vi.doMock('../command.service', () => ({
      executeCommand: vi.fn().mockImplementation((cmd: string) => {
        if (cmd.includes('apt-get')) return Promise.resolve(aptPath)
        if (cmd.includes('dnf')) return Promise.resolve(dnfPath)
        if (cmd.includes('pacman')) return Promise.resolve(pacmanPath)
        return Promise.resolve(null)
      })
    }))
  }

  it('detects apt when apt-get is present', async () => {
    mockCommand('/usr/bin/apt-get', null, null)
    const { initLinuxPackageManager, getLinuxPackageManager } = await import('../linux-pm.service')
    await initLinuxPackageManager('linux')
    expect(getLinuxPackageManager()).toBe('apt')
  })

  it('detects dnf when only dnf is present', async () => {
    mockCommand(null, '/usr/bin/dnf', null)
    const { initLinuxPackageManager, getLinuxPackageManager } = await import('../linux-pm.service')
    await initLinuxPackageManager('linux')
    expect(getLinuxPackageManager()).toBe('dnf')
  })

  it('detects pacman when only pacman is present', async () => {
    mockCommand(null, null, '/usr/bin/pacman')
    const { initLinuxPackageManager, getLinuxPackageManager } = await import('../linux-pm.service')
    await initLinuxPackageManager('linux')
    expect(getLinuxPackageManager()).toBe('pacman')
  })

  it('returns null when no package manager is found', async () => {
    mockCommand(null, null, null)
    const { initLinuxPackageManager, getLinuxPackageManager } = await import('../linux-pm.service')
    await initLinuxPackageManager('linux')
    expect(getLinuxPackageManager()).toBeNull()
  })

  it('apt wins when multiple package managers are present', async () => {
    mockCommand('/usr/bin/apt-get', '/usr/bin/dnf', '/usr/bin/pacman')
    const { initLinuxPackageManager, getLinuxPackageManager } = await import('../linux-pm.service')
    await initLinuxPackageManager('linux')
    expect(getLinuxPackageManager()).toBe('apt')
  })

  it('does nothing on non-linux platforms', async () => {
    mockCommand('/usr/bin/apt-get', null, null)
    const { initLinuxPackageManager, getLinuxPackageManager } = await import('../linux-pm.service')
    await initLinuxPackageManager('win32')
    expect(getLinuxPackageManager()).toBeNull()
  })
})
