export interface EnvironmentAdapter {
  getApiBaseUrl(): string
  getWebSocketUrl(): string
  notifyDirtyState(dirty: boolean): void
  requestSave(): void
  getTheme(): 'light' | 'dark'
  onMessage(handler: (msg: any) => void): void
  postMessage(msg: any): void
  isVSCode(): boolean
}

let currentAdapter: EnvironmentAdapter | null = null

export function setAdapter(adapter: EnvironmentAdapter): void {
  currentAdapter = adapter
}

export function getAdapter(): EnvironmentAdapter {
  if (!currentAdapter) throw new Error('Environment adapter not initialized')
  return currentAdapter
}
