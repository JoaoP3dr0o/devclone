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

export type OutputChunk =
  | { type: 'stdout' | 'stderr' | 'prompt'; text: string }
  | { type: 'progress'; text: string; progress: number }

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

function parseProgressFromLine(line: string): number | null {
  const match = line.match(/[█▒].*?(\d+)\s*%/)
  if (match) return parseInt(match[1], 10)
  const sizeMatch = line.match(/([\d.]+)\s*MB\s*\/\s*([\d.]+)\s*MB/)
  if (sizeMatch) return Math.round((parseFloat(sizeMatch[1]) / parseFloat(sizeMatch[2])) * 100)
  return null
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

      for (const line of text.split('\n')) {
        if (/^\s*[-\\|/]\s*$/.test(line)) continue
        if (line.trim() === '') continue

        const progress = parseProgressFromLine(line)
        if (progress !== null) {
          onChunk({ type: 'progress', text: line, progress })
          continue
        }

        onChunk({ type, text: line + '\n' })
      }

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
