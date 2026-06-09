export type CheckStatus = 'ok' | 'missing' | 'needs-update' | 'manual-required'

export interface DependencyEntry {
  id: string
  label: string
  autoFixable: boolean
  rebootRequired: boolean
  userMessage: string
}

export interface PreflightCheck {
  id: string
  label: string
  status: CheckStatus
  autoFixable: boolean
  rebootRequired: boolean
  userMessage: string
}

export interface PreflightResult {
  canProceed: boolean
  checks: PreflightCheck[]
  requiresReboot: boolean
}
