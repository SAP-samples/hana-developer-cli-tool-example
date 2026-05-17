import * as vscode from 'vscode'
import { getWebviewContent, getWebviewOptions } from '../webview/htmlProvider.js'
import { ensureServer, trackWebviewOpen, trackWebviewClose } from '../extension.js'

const ROUTE_MAP: Record<string, string> = {
  'hana-cli.openTools': '/',
  'hana-cli.openQuery': '/queryConsole',
  'hana-cli.showTables': '/tables',
  'hana-cli.showViews': '/views',
  'hana-cli.systemInfo': '/systemInfo',
  'hana-cli.importData': '/import',
}

let currentPanel: vscode.WebviewPanel | undefined

export function registerToolsPanel(context: vscode.ExtensionContext): void {
  for (const commandId of Object.keys(ROUTE_MAP)) {
    const disposable = vscode.commands.registerCommand(commandId, async () => {
      const route = ROUTE_MAP[commandId]
      const port = await ensureServer(context)

      if (currentPanel) {
        currentPanel.reveal(vscode.ViewColumn.One)
        currentPanel.webview.postMessage({ type: 'navigate', route })
        return
      }

      const panel = vscode.window.createWebviewPanel(
        'hana-cli.toolsPanel',
        'hana-cli Tools',
        vscode.ViewColumn.One,
        {
          ...getWebviewOptions(context.extensionUri),
          retainContextWhenHidden: true,
        }
      )

      currentPanel = panel
      trackWebviewOpen()

      panel.webview.html = getWebviewContent(panel.webview, context.extensionUri, {
        route,
        port,
      })

      panel.webview.onDidReceiveMessage(
        (message: { type: string; level?: string; text?: string; path?: string }) => {
          switch (message.type) {
            case 'showMessage': {
              const text = message.text || ''
              switch (message.level) {
                case 'warning':
                  vscode.window.showWarningMessage(text)
                  break
                case 'error':
                  vscode.window.showErrorMessage(text)
                  break
                default:
                  vscode.window.showInformationMessage(text)
              }
              break
            }
            case 'openFile': {
              if (message.path) {
                const uri = vscode.Uri.file(message.path)
                vscode.workspace.openTextDocument(uri).then((doc) => {
                  vscode.window.showTextDocument(doc)
                })
              }
              break
            }
          }
        },
        undefined,
        context.subscriptions
      )

      panel.onDidDispose(
        () => {
          currentPanel = undefined
          trackWebviewClose()
        },
        undefined,
        context.subscriptions
      )
    })

    context.subscriptions.push(disposable)
  }
}
