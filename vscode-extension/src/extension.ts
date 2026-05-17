import * as vscode from 'vscode'
import { startServer, stopServer, scheduleShutdown, injectConnection } from './server/lifecycle.js'
import { registerToolsPanel } from './editors/toolsPanel.js'
import { CalcViewEditorProvider } from './editors/calcViewEditor.js'
import { ArtifactInspectorProvider } from './editors/artifactInspector.js'
import { resolveConnection, type HanaConnection, type ResolveResult } from './connection/resolver.js'
import { ConnectionManager } from './connection/manager.js'
import { createConnectionStatusBar, updateStatus } from './connection/statusBar.js'

let activeWebviewCount = 0
let currentConnection: HanaConnection | null = null
const outputChannel = vscode.window.createOutputChannel('hana-cli')

export function activate(context: vscode.ExtensionContext) {
  try {
    context.subscriptions.push({
      dispose: () => stopServer()
    })

    const statusBar = createConnectionStatusBar()
    context.subscriptions.push(statusBar)

    const connManager = new ConnectionManager(context.secrets)

    const folders = vscode.workspace.workspaceFolders
    if (folders && folders.length > 0) {
      resolveConnection(folders[0]).then((result) => {
        if (result.status === 'connected') {
          currentConnection = result.connection
          injectConnection(result.connection)
        }
        updateStatus(statusBar, result)
      }).catch((err) => {
        outputChannel.appendLine(`Connection auto-resolve failed: ${err}`)
      })
    }

    context.subscriptions.push(
      vscode.commands.registerCommand('hana-cli.addConnection', async () => {
        const host = await vscode.window.showInputBox({
          prompt: 'HANA Host',
          placeHolder: 'e.g. my-hana.hanacloud.ondemand.com'
        })
        if (!host) return

        const portStr = await vscode.window.showInputBox({
          prompt: 'HANA Port',
          placeHolder: '443',
          value: '443'
        })
        if (!portStr) return

        const user = await vscode.window.showInputBox({
          prompt: 'Database User',
          placeHolder: 'e.g. DBADMIN'
        })
        if (!user) return

        const password = await vscode.window.showInputBox({
          prompt: 'Password',
          password: true
        })
        if (!password) return

        const schema = await vscode.window.showInputBox({
          prompt: 'Schema (optional)',
          placeHolder: 'Leave empty for default'
        }) ?? ''

        const conn: HanaConnection = {
          host,
          port: Number(portStr) || 443,
          user,
          password,
          useTLS: true,
          schema,
          source: 'secretStorage'
        }

        const name = `${user}@${host}:${portStr}`
        await connManager.save(name, conn)

        currentConnection = conn
        injectConnection(conn)
        updateStatus(statusBar, { status: 'connected', connection: conn })

        vscode.window.showInformationMessage(`Connected to HANA: ${name}`)
      })
    )

    registerToolsPanel(context)
    CalcViewEditorProvider.register(context)
    ArtifactInspectorProvider.registerAll(context)

    outputChannel.appendLine('hana-cli extension activated successfully')
  } catch (err) {
    outputChannel.appendLine(`Activation error: ${err}`)
    outputChannel.show(true)
    throw err
  }
}

export async function ensureServer(context: vscode.ExtensionContext): Promise<number> {
  return startServer(context, currentConnection ?? undefined)
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
