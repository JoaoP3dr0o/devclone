import { ElectronAPI } from '@electron-toolkit/preload'
import type { EnvironmentScanResult } from '../shared/scan.types'

type DevCloneElectronAPI = ElectronAPI & {
  scanEnvironment: () => Promise<EnvironmentScanResult>
}

declare global {
  interface Window {
    electron: DevCloneElectronAPI
    api: unknown
  }
}
