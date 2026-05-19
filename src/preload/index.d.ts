import { ElectronAPI } from '@electron-toolkit/preload'
import type { EnvironmentScanResult, LastScanStorage } from '../shared/scan.types'

type DevCloneElectronAPI = ElectronAPI & {
  scanEnvironment: () => Promise<EnvironmentScanResult>
  loadLastScan: () => Promise<LastScanStorage | null>
}

declare global {
  interface Window {
    electron: DevCloneElectronAPI
    api: unknown
  }
}
