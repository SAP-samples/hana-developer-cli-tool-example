import * as vscode from 'vscode'
import { getWebviewContent, getWebviewOptions } from '../webview/htmlProvider.js'
import { ensureServer, trackWebviewOpen, trackWebviewClose } from '../extension.js'
import { resolveRuntimeName } from './runtimeName.js'

interface ArtifactConfig {
  viewType: string
  route: string
  kind: string
  /** Query-param key the target Vue view reads the artifact name from. */
  queryKey: string
}

const ARTIFACT_CONFIGS: ArtifactConfig[] = [
  { viewType: 'hana-cli.tableInspector', route: '/inspect-table', kind: 'table', queryKey: 'table' },
  { viewType: 'hana-cli.viewInspector', route: '/inspect-view', kind: 'view', queryKey: 'view' },
  { viewType: 'hana-cli.procedureInspector', route: '/call-procedure', kind: 'procedure', queryKey: 'procedure' },
  { viewType: 'hana-cli.functionInspector', route: '/inspect-function', kind: 'function', queryKey: 'function' },
  { viewType: 'hana-cli.synonymInspector', route: '/inspect-table', kind: 'synonym', queryKey: 'table' },
  { viewType: 'hana-cli.roleInspector', route: '/inspect-table', kind: 'role', queryKey: 'table' },
  { viewType: 'hana-cli.sequenceInspector', route: '/inspect-table', kind: 'sequence', queryKey: 'table' },
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

    // Resolve the runtime (deployed) object name from the design-time file.
    // The filename is the design-time name (e.g. cds.outbox.Messages.hdbtable);
    // HANA knows the runtime name (e.g. cds_outbox_Messages), matched
    // case-sensitively. resolveRuntimeName reads the file content to get it.
    const name = resolveRuntimeName(document.uri.fsPath, this._config.kind)

    const port = await ensureServer(this._context)

    // Pass the artifact name as a route query param the target Vue view reads
    // directly (e.g. /inspect-table?table=NAME). This mirrors how the browser
    // UI navigates to these views and pre-populates the input on load.
    const routeWithName = `${this._config.route}?${this._config.queryKey}=${encodeURIComponent(name)}`

    webviewPanel.webview.html = getWebviewContent(webviewPanel.webview, this._context.extensionUri, {
      route: routeWithName,
      port,
      chromeless: true,
    })

    webviewPanel.webview.onDidReceiveMessage(
      async (message: { type: string; level?: string; text?: string; path?: string }) => {
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
