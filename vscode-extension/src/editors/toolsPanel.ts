import * as vscode from 'vscode'
import { getWebviewContent, getWebviewOptions } from '../webview/htmlProvider.js'
import { ensureServer, trackWebviewOpen, trackWebviewClose } from '../extension.js'

const log = vscode.window.createOutputChannel('hana-cli webview', { log: true })

const ROUTE_MAP: Record<string, string> = {
  'hana-cli.openTools': '/',
}

const CHROMELESS_ROUTES: Record<string, { route: string; title: string }> = {
  'hana-cli.openCfLogin': { route: '/cf-login', title: 'CF Login' },
  'hana-cli.openQuery': { route: '/query', title: 'Query Console' },
  'hana-cli.showTables': { route: '/tables', title: 'Tables' },
  'hana-cli.showViews': { route: '/views', title: 'Views' },
  'hana-cli.systemInfo': { route: '/system-info', title: 'System Info' },
  'hana-cli.importData': { route: '/import', title: 'Import Data' },
}

let currentPanel: vscode.WebviewPanel | undefined

export function registerToolsPanel(context: vscode.ExtensionContext): void {
  // Full tools panel commands (shared panel with navigation)
  for (const commandId of Object.keys(ROUTE_MAP)) {
    const disposable = vscode.commands.registerCommand(commandId, async () => {
      const route = ROUTE_MAP[commandId]
      log.info(`[toolsPanel] Command invoked: ${commandId}, route: ${route}`)

      if (currentPanel) {
        log.info('[toolsPanel] Reusing existing panel')
        currentPanel.reveal(vscode.ViewColumn.One)
        currentPanel.webview.postMessage({ type: 'navigate', route })
        return
      }

      const port = await ensureServer(context)
      log.info(`[toolsPanel] Server on port ${port}`)

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
        async (message: { type: string; level?: string; text?: string; path?: string }) => {
          log.info(`[toolsPanel] Message from webview: ${JSON.stringify(message)}`)
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

  // Chromeless panel commands (standalone, no nav shell)
  for (const [commandId, config] of Object.entries(CHROMELESS_ROUTES)) {
    const disposable = vscode.commands.registerCommand(commandId, async () => {
      const port = await ensureServer(context)

      const panel = vscode.window.createWebviewPanel(
        commandId,
        config.title,
        vscode.ViewColumn.One,
        {
          ...getWebviewOptions(context.extensionUri),
          retainContextWhenHidden: true,
        }
      )

      trackWebviewOpen()

      panel.webview.html = getWebviewContent(panel.webview, context.extensionUri, {
        route: config.route,
        port,
        chromeless: true,
      })

      panel.onDidDispose(
        () => { trackWebviewClose() },
        undefined,
        context.subscriptions
      )
    })

    context.subscriptions.push(disposable)
  }
}
