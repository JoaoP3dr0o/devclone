import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}
const electron = {
  ...electronAPI,
  scanEnvironment: () => ipcRenderer.invoke('scan:environment'),
  loadLastScan: () => ipcRenderer.invoke('load:lastScan'),
  getInstallCommand: (toolId: string) => ipcRenderer.invoke('install:get-command', toolId),
  getPlatform: () => ipcRenderer.invoke('platform:get'),
  runInstallCommand: (toolId: string) => ipcRenderer.invoke('install:run-command', toolId),
  onInstallOutput: (callback: (chunk: { type: 'stdout' | 'stderr'; text: string }) => void) => {
    ipcRenderer.on('install:output', (_event, chunk) => callback(chunk))
  },
  removeInstallListeners: () => ipcRenderer.removeAllListeners('install:output'),
  getUserProfile: () => ipcRenderer.invoke('profile:get'),
  saveUserProfile: (profile: unknown) => ipcRenderer.invoke('profile:save', profile),
  getAllProfiles: () => ipcRenderer.invoke('profile:get-all'),
  createProfile: (name: string, toolIds: string[]) =>
    ipcRenderer.invoke('profile:create', name, toolIds),
  deleteProfile: (id: string) => ipcRenderer.invoke('profile:delete', id),
  setActiveProfile: (id: string) => ipcRenderer.invoke('profile:set-active', id),
  updateProfileTools: (profileId: string, toolIds: string[]) =>
    ipcRenderer.invoke('profile:update-tools', profileId, toolIds),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getUserDataPath: () => ipcRenderer.invoke('app:getUserDataPath'),
  clearScanData: () => ipcRenderer.invoke('app:clearScanData'),
  getSettings: () => ipcRenderer.invoke('app:getSettings'),
  saveSettings: (settings: { autoScan: boolean }) => ipcRenderer.invoke('app:saveSettings', settings),
  exportProfile: () => ipcRenderer.invoke('export:profile'),
  importProfile: () => ipcRenderer.invoke('import:profile'),
  preflight: {
    run: (toolId: string, platform: string) =>
      ipcRenderer.invoke('preflight:run', toolId, platform),
    fix: (checkId: string) => ipcRenderer.invoke('preflight:fix', checkId),
    savePending: (toolId: string) => ipcRenderer.invoke('preflight:save-pending', toolId),
    getPending: () => ipcRenderer.invoke('preflight:get-pending'),
    clearPending: () => ipcRenderer.invoke('preflight:clear-pending')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electron)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electron
  // @ts-ignore (define in dts)
  window.api = api
}
