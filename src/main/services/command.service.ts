import { exec, spawn } from 'child_process'
import type { ChildProcess } from 'child_process'
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

export type OutputChunk = { type: 'stdout' | 'stderr' | 'prompt'; text: string }

const INTERACTIVE_PROMPTS = [
  /\[Y\].*\[N\]/i,
  /\(y\/n\)/i,
  /\[yes\/no\]/i,
  /do you agree/i,
  /press enter/i,
  /continue\?/i,
]

let activeProc: ChildProcess | null = null

export function writeToStdin(text: string): void {
  activeProc?.stdin?.write(text)
}

export function spawnCommand(
  command: string,
  onChunk: (chunk: OutputChunk) => void
): Promise<{ exitCode: number }> {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32'
    const proc = isWindows
      ? spawn('cmd', ['/c', command], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] })
      : spawn('sh', ['-c', command], { stdio: ['pipe', 'pipe', 'pipe'] })

    activeProc = proc

    const handleData = (type: 'stdout' | 'stderr') => (data: Buffer) => {
      const text = data.toString()
      onChunk({ type, text })
      if (INTERACTIVE_PROMPTS.some((re) => re.test(text))) {
        onChunk({ type: 'prompt', text })
      }
    }

    proc.stdout!.on('data', handleData('stdout'))
    proc.stderr!.on('data', handleData('stderr'))
    proc.on('close', (code) => {
      activeProc = null
      resolve({ exitCode: code ?? 0 })
    })
    proc.on('error', (err) => {
      activeProc = null
      reject(err)
    })
  })
}
