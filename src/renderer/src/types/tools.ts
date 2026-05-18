export type ToolStatus = 'installed' | 'missing' | 'pending'

export type DevTool = {
  id: string
  name: string
  category: string
  description: string
  status: ToolStatus
  version?: string
}
