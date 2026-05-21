import { ElectronAPI } from '@electron-toolkit/preload'
import type { ToolCatalogItem } from '../shared/tools/catalog'
import type { EnvironmentScanResult, LastScanStorage } from '../shared/scan.types'

type DevCloneElectronAPI = ElectronAPI & {
  scanEnvironment: () => Promise<EnvironmentScanResult>
  loadLastScan: () => Promise<LastScanStorage | null>
  getInstallCommand: (toolId: ToolCatalogItem['id']) => Promise<string | null>
}

declare global {
  interface Window {
    electron: DevCloneElectronAPI
    api: unknown
  }
}
