import { ElectronAPI } from '@electron-toolkit/preload'
import type { ToolCatalogItem } from '../shared/tools/catalog'
import type { LastScanStorage } from '../shared/scan.types'
import type { CurrentPlatform } from '../shared/platform/platform.types'

type DevCloneElectronAPI = ElectronAPI & {
  scanEnvironment: () => Promise<LastScanStorage>
  loadLastScan: () => Promise<LastScanStorage | null>
  getInstallCommand: (toolId: ToolCatalogItem['id']) => Promise<string | null>
  getPlatform: () => Promise<CurrentPlatform>
}

declare global {
  interface Window {
    electron: DevCloneElectronAPI
    api: unknown
  }
}
