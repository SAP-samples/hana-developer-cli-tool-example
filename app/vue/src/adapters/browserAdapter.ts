import type { EnvironmentAdapter } from './environment'

export class BrowserAdapter implements EnvironmentAdapter {
  getApiBaseUrl(): string {
    return window.location.origin
  }

  getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}/websockets`
  }

  notifyDirtyState(_dirty: boolean): void {}
  requestSave(): void {}

  getTheme(): 'light' | 'dark' {
    const saved = localStorage.getItem('hana-cli-theme')
    if (saved === 'sap_horizon_dark') return 'dark'
    if (saved && saved !== 'auto') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  onMessage(_handler: (msg: any) => void): void {}
  postMessage(_msg: any): void {}

  isVSCode(): boolean {
    return false
  }
}
