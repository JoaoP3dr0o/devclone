import type { EnvironmentScanResult } from '@shared/scan.types'
import { useAppStore } from '../store/useAppStore'

type UseEnvironmentScanResult = {
  loading: boolean
  error: string | null
  scanResult: EnvironmentScanResult | null
  lastScanAt: string | null
  scanEnvironment: () => Promise<void>
}

export function useEnvironmentScan(): UseEnvironmentScanResult {
  const scanResult = useAppStore((s) => s.scanResult)
  const lastScanAt = useAppStore((s) => s.lastScanAt)
  const scanLoading = useAppStore((s) => s.scanLoading)
  const scanError = useAppStore((s) => s.scanError)
  const triggerScan = useAppStore((s) => s.triggerScan)

  return {
    loading: scanLoading,
    error: scanError,
    scanResult,
    lastScanAt,
    scanEnvironment: triggerScan
  }
}
