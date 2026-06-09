import { exec, spawn } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function executeCommand(command: string): Promise<string | null> {
  try {
    const { stdout } = await execAsync(command, { encoding: 'utf8', windowsHide: true })
    return stdout.trim()
  } catch {
    return null
  }
}

export type OutputChunk = { type: 'stdout' | 'stderr'; text: string }

export function spawnCommand(
  command: string,
  onChunk: (chunk: OutputChunk) => void
): Promise<{ exitCode: number }> {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32'
    const proc = isWindows
      ? spawn('cmd', ['/c', command], { windowsHide: true })
      : spawn('sh', ['-c', command])

    proc.stdout.on('data', (data: Buffer) => onChunk({ type: 'stdout', text: data.toString() }))
    proc.stderr.on('data', (data: Buffer) => onChunk({ type: 'stderr', text: data.toString() }))
    proc.on('close', (code) => resolve({ exitCode: code ?? 0 }))
    proc.on('error', reject)
  })
}
