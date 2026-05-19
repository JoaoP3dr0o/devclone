function parseVersion(version: string): number[] {
  return version
    .split('.')
    .map((part) => Number.parseInt(part, 10))
    .map((part) => (Number.isNaN(part) ? 0 : part))
}

export function compareVersions(currentVersion: string, targetVersion: string): number {
  const currentParts = parseVersion(currentVersion)
  const targetParts = parseVersion(targetVersion)
  const maxLength = Math.max(currentParts.length, targetParts.length)

  for (let index = 0; index < maxLength; index += 1) {
    const currentPart = currentParts[index] ?? 0
    const targetPart = targetParts[index] ?? 0

    if (currentPart > targetPart) return 1
    if (currentPart < targetPart) return -1
  }

  return 0
}

export function isVersionLowerThan(currentVersion: string, minimumVersion: string): boolean {
  return compareVersions(currentVersion, minimumVersion) < 0
}
