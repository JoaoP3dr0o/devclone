import { executeCommand } from './command.service'
import type { LinuxPackageManager } from '../../shared/tools/install.types'

// undefined = not yet probed; null = probed but none found
let cachedManager: LinuxPackageManager | null | undefined = undefined

export async function initLinuxPackageManager(): Promise<void> {
  if (process.platform !== 'linux') return
  if (cachedManager !== undefined) return

  const [apt, dnf, pacman] = await Promise.all([
    executeCommand('command -v apt-get'),
    executeCommand('command -v dnf'),
    executeCommand('command -v pacman')
  ])

  if (apt !== null) { cachedManager = 'apt'; return }
  if (dnf !== null) { cachedManager = 'dnf'; return }
  if (pacman !== null) { cachedManager = 'pacman'; return }
  cachedManager = null
}

export function getLinuxPackageManager(): LinuxPackageManager | null {
  return cachedManager ?? null
}
