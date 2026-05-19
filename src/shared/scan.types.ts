export type ToolScanResult = {
  name: string
  installed: boolean
  version: string | null
}

export type EnvironmentScanResult = {
  git: ToolScanResult
  node: ToolScanResult
  vscode: ToolScanResult
}

export type LastScanStorage = {
  version: 1
  lastScanAt: string
  tools: EnvironmentScanResult
}
