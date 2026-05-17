import * as vscode from 'vscode'
import type { HanaConnection, ResolveResult } from './resolver.js'

/**
 * Creates a status bar item that shows the current HANA connection state.
 */
export function createConnectionStatusBar(): vscode.StatusBarItem {
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  )
  statusBar.command = 'hana-cli.addConnection'
  updateStatus(statusBar, { status: 'no-config' })
  statusBar.show()
  return statusBar
}

/**
 * Updates the status bar item text based on the resolve result.
 */
export function updateStatus(
  statusBar: vscode.StatusBarItem,
  result: ResolveResult
): void {
  switch (result.status) {
    case 'connected': {
      const conn = result.connection
      const label = conn.instanceName
        ? `${conn.instanceName} (${conn.host.split('.')[0]})`
        : `${conn.user}@${conn.host}:${conn.port}`
      statusBar.text = `$(database) HANA: ${label}`
      statusBar.tooltip = conn.instanceName
        ? `HDI Container: ${conn.instanceName}\nHost: ${conn.host}:${conn.port}\nUser: ${conn.user}\nSchema: ${conn.schema || '(default)'}\nSource: ${conn.source}`
        : `Connected via ${conn.source} | Schema: ${conn.schema || '(default)'}`
      statusBar.backgroundColor = undefined
      statusBar.command = 'hana-cli.addConnection'
      break
    }
    case 'cf-login-required':
      statusBar.text = `$(warning) HANA: CF login required`
      statusBar.tooltip = `CAP binding found for "${result.instance}" but credentials couldn't be resolved.\nClick to open CF Login.`
      statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground')
      statusBar.command = 'hana-cli.openCfLogin'
      break
    case 'no-config':
      statusBar.text = '$(warning) HANA: Not Connected'
      statusBar.tooltip = 'Click to add a HANA connection'
      statusBar.backgroundColor = undefined
      statusBar.command = 'hana-cli.addConnection'
      break
  }
}
