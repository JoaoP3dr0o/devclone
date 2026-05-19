export type ToolStatus = 'installed' | 'missing' | 'pending'

export type DevToolId =
  | 'git'
  | 'node'
  | 'php'
  | 'composer'
  | 'laravel'
  | 'vscode'
  | 'docker'
  | 'mysql'
  | 'postman'

export type DevTool = {
  id: DevToolId
  name: string
  category: string
  description: string
  status: ToolStatus
  version?: string
}
