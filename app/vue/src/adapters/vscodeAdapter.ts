import type { EnvironmentAdapter } from './environment'

declare function acquireVsCodeApi(): {
  postMessage(msg: any): void
  getState(): any
  setState(state: any): void
}

export class VSCodeAdapter implements EnvironmentAdapter {
  private vscode = acquireVsCodeApi()
  private port: number = 0
  private theme: 'light' | 'dark' = 'light'
  private messageHandlers: Array<(msg: any) => void> = []

  constructor() {
    this.port = (window as any).__HANA_CLI_PORT__ || 0
    this.theme = document.body.classList.contains('vscode-dark') ? 'dark' : 'light'

    window.addEventListener('message', (event) => {
      const msg = event.data
      if (msg.type === 'serverReady') this.port = msg.port
      if (msg.type === 'themeChanged') this.theme = msg.theme
      for (const handler of this.messageHandlers) handler(msg)
    })

    this.vscode.postMessage({ type: 'ready' })
  }

  getApiBaseUrl(): string {
    return `http://localhost:${this.port}`
  }

  getWebSocketUrl(): string {
    return `ws://localhost:${this.port}/websockets`
  }

  notifyDirtyState(dirty: boolean): void {
    this.vscode.postMessage({ type: 'dirty', value: dirty })
  }

  requestSave(): void {}

  getTheme(): 'light' | 'dark' {
    return this.theme
  }

  onMessage(handler: (msg: any) => void): void {
    this.messageHandlers.push(handler)
  }

  postMessage(msg: any): void {
    this.vscode.postMessage(msg)
  }

  isVSCode(): boolean {
    return true
  }
}
