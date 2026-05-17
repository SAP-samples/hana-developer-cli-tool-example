// Messages from extension to webview
export type ExtToWebviewMessage =
  | { type: 'serverReady'; port: number }
  | { type: 'themeChanged'; theme: 'light' | 'dark' }
  | { type: 'fileContent'; xml: string }
  | { type: 'requestSave' }
  | { type: 'openArtifact'; kind: string; name: string; schema: string }
  | { type: 'navigate'; route: string }

// Messages from webview to extension
export type WebviewToExtMessage =
  | { type: 'dirty'; value: boolean }
  | { type: 'save'; xml: string }
  | { type: 'showMessage'; level: 'info' | 'warning' | 'error'; text: string }
  | { type: 'openFile'; path: string }
  | { type: 'ready' }
