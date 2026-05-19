import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function executeCommand(command: string): Promise<string | null> {
  try {
    const { stdout } = await execAsync(command)
    return stdout.trim()
  } catch {
    return null
  }
}
