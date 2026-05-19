import { useState } from 'react'

import type { EnvironmentScanResult } from '../../../shared/scan.types'

type UseEnvironmentScanResult = {
  loading: boolean
  error: string | null
  scanResult: EnvironmentScanResult | null
  scanEnvironment: () => Promise<void>
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Não foi possível escanear o ambiente.'
}

export function useEnvironmentScan(): UseEnvironmentScanResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<EnvironmentScanResult | null>(null)

  async function scanEnvironment(): Promise<void> {
    setLoading(true)
    setError(null)

    try {
      const result = await window.electron.scanEnvironment()
      setScanResult(result)
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    scanResult,
    scanEnvironment
  }
}
