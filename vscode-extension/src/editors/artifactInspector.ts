import * as vscode from 'vscode'
import * as path from 'path'
import { getWebviewContent, getWebviewOptions } from '../webview/htmlProvider.js'
import { ensureServer, trackWebviewOpen, trackWebviewClose } from '../extension.js'

interface ArtifactConfig {
  viewType: string
  route: string
  kind: string
}

const ARTIFACT_CONFIGS: ArtifactConfig[] = [
  { viewType: 'hana-cli.tableInspector', route: '/inspect-table', kind: 'table' },
  { viewType: 'hana-cli.viewInspector', route: '/inspect-view', kind: 'view' },
  { viewType: 'hana-cli.procedureInspector', route: '/call-procedure', kind: 'procedure' },
  { viewType: 'hana-cli.functionInspector', route: '/inspect-function', kind: 'function' },
  { viewType: 'hana-cli.synonymInspector', route: '/inspect-table', kind: 'synonym' },
  { viewType: 'hana-cli.roleInspector', route: '/inspect-table', kind: 'role' },
  { viewType: 'hana-cli.sequenceInspector', route: '/inspect-table', kind: 'sequence' },
]

/**
 * Read-only custom editor provider for HANA artifact inspection.
 * Opens a webview that displays live metadata from the HANA database
 * for the artifact whose name is derived from the opened file.
 */
class ArtifactInspectorProvider implements vscode.CustomReadonlyEditorProvider {
  private readonly _context: vscode.ExtensionContext
  private readonly _config: ArtifactConfig

  constructor(context: vscode.ExtensionContext, config: ArtifactConfig) {
    this._context = context
    this._config = config
  }

  /**
   * Register providers for all artifact types.
   */
  static registerAll(context: vscode.ExtensionContext): void {
    for (const config of ARTIFACT_CONFIGS) {
      const provider = new ArtifactInspectorProvider(context, config)
      const registration = vscode.window.registerCustomEditorProvider(
        config.viewType,
        provider,
        {
          webviewOptions: { retainContextWhenHidden: true },
        }
      )
      context.subscriptions.push(registration)
    }
  }

  // --- CustomReadonlyEditorProvider implementation ---

  async openCustomDocument(
    uri: vscode.Uri,
    _openContext: vscode.CustomDocumentOpenContext,
    _token: vscode.CancellationToken
  ): Promise<vscode.CustomDocument> {
    return { uri, dispose() {} }
  }

  async resolveCustomEditor(
    document: vscode.CustomDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    trackWebviewOpen()

    webviewPanel.webview.options = {
      ...getWebviewOptions(this._context.extensionUri),
      enableScripts: true,
    }

    // Parse artifact name from the filename (strip extension)
    const filename = path.basename(document.uri.fsPath)
    const dotIndex = filename.lastIndexOf('.')
    const name = dotIndex > 0 ? filename.substring(0, dotIndex) : filename

    const port = await ensureServer(this._context)

    webviewPanel.webview.html = getWebviewContent(webviewPanel.webview, this._context.extensionUri, {
      route: this._config.route,
      port,
      chromeless: true,
    })

    webviewPanel.webview.onDidReceiveMessage(
      async (message: { type: string; level?: string; text?: string; path?: string }) => {
        switch (message.type) {
          case 'ready': {
            webviewPanel.webview.postMessage({
              type: 'openArtifact',
              kind: this._config.kind,
              name,
              schema: '',
            })
            break
          }

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
      this._context.subscriptions
    )

    webviewPanel.onDidDispose(
      () => {
        trackWebviewClose()
      },
      undefined,
      this._context.subscriptions
    )
  }
}

export { ArtifactInspectorProvider }
