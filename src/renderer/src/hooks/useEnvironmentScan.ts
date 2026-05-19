import { useEffect, useState } from 'react'

import type { EnvironmentScanResult } from '../../../shared/scan.types'

type UseEnvironmentScanResult = {
  loading: boolean
  error: string | null
  scanResult: EnvironmentScanResult | null
  lastScanAt: string | null
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
  const [lastScanAt, setLastScanAt] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadSavedScan(): Promise<void> {
      try {
        const savedScan = await window.electron.loadLastScan()

        if (!isMounted || !savedScan) return

        setScanResult(savedScan.tools)
        setLastScanAt(savedScan.lastScanAt)
      } catch (caughtError) {
        if (!isMounted) return
        setError(getErrorMessage(caughtError))
      }
    }

    loadSavedScan()

    return () => {
      isMounted = false
    }
  }, [])

  async function scanEnvironment(): Promise<void> {
    setLoading(true)
    setError(null)

    try {
      const result = await window.electron.scanEnvironment()
      setScanResult(result)
      setLastScanAt(new Date().toISOString())
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
    lastScanAt,
    scanEnvironment
  }
}
