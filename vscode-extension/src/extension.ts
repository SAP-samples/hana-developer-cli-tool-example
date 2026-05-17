import * as vscode from 'vscode'
import { startServer, stopServer, scheduleShutdown } from './server/lifecycle.js'

let activeWebviewCount = 0

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push({
    dispose: () => stopServer()
  })
}

export async function ensureServer(context: vscode.ExtensionContext): Promise<number> {
  return startServer(context)
}

export function trackWebviewOpen(): void {
  activeWebviewCount++
}

export function trackWebviewClose(): void {
  activeWebviewCount--
  if (activeWebviewCount <= 0) {
    activeWebviewCount = 0
    scheduleShutdown()
  }
}

export function deactivate() {
  return stopServer()
}
