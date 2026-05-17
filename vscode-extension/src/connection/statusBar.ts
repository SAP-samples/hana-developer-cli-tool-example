import * as vscode from 'vscode'
import type { HanaConnection } from './resolver.js'

/**
 * Creates a status bar item that shows the current HANA connection state.
 */
export function createConnectionStatusBar(): vscode.StatusBarItem {
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  )
  statusBar.command = 'hana-cli.addConnection'
  updateStatus(statusBar, null)
  statusBar.show()
  return statusBar
}

/**
 * Updates the status bar item text based on the current connection.
 */
export function updateStatus(
  statusBar: vscode.StatusBarItem,
  conn: HanaConnection | null
): void {
  if (conn) {
    statusBar.text = `$(database) HANA: ${conn.user}@${conn.host}:${conn.port}`
    statusBar.tooltip = `Connected via ${conn.source} | Schema: ${conn.schema || '(default)'}`
  } else {
    statusBar.text = '$(warning) HANA: Not Connected'
    statusBar.tooltip = 'Click to add a HANA connection'
  }
}
