import * as vscode from 'vscode'
import { getWebviewContent, getWebviewOptions } from '../webview/htmlProvider.js'
import { ensureServer, trackWebviewOpen, trackWebviewClose } from '../extension.js'

/**
 * Custom document representing an .hdbcalculationview file.
 */
class CalcViewDocument implements vscode.CustomDocument {
  readonly uri: vscode.Uri
  private _content: string
  private _version = 0

  private readonly _onDidChange = new vscode.EventEmitter<void>()
  /** Fired to signal the document is dirty. */
  readonly onDidChange = this._onDidChange.event

  constructor(uri: vscode.Uri, content: string) {
    this.uri = uri
    this._content = content
  }

  get content(): string {
    return this._content
  }

  set content(value: string) {
    this._content = value
    this._version++
  }

  get version(): number {
    return this._version
  }

  markDirty(): void {
    this._onDidChange.fire()
  }

  dispose(): void {
    this._onDidChange.dispose()
  }
}

/**
 * CustomEditorProvider for .hdbcalculationview files.
 * Opens the Vue-based calc view graph editor in a webview.
 */
export class CalcViewEditorProvider implements vscode.CustomEditorProvider<CalcViewDocument> {
  private static readonly viewType = 'hana-cli.calcViewEditor'

  private readonly _context: vscode.ExtensionContext
  private readonly _webviews = new Map<string, vscode.WebviewPanel>()

  private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<
    vscode.CustomDocumentContentChangeEvent<CalcViewDocument>
  >()
  readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event

  constructor(context: vscode.ExtensionContext) {
    this._context = context
  }

  /**
   * Register the custom editor provider with VSCode.
   */
  static register(context: vscode.ExtensionContext): void {
    const provider = new CalcViewEditorProvider(context)
    const registration = vscode.window.registerCustomEditorProvider(
      CalcViewEditorProvider.viewType,
      provider,
      {
        webviewOptions: { retainContextWhenHidden: true },
      }
    )
    context.subscriptions.push(registration)
  }

  // --- CustomEditorProvider implementation ---

  async openCustomDocument(
    uri: vscode.Uri,
    _openContext: vscode.CustomDocumentOpenContext,
    _token: vscode.CancellationToken
  ): Promise<CalcViewDocument> {
    const fileData = await vscode.workspace.fs.readFile(uri)
    const content = Buffer.from(fileData).toString('utf-8')
    const document = new CalcViewDocument(uri, content)

    // When the document fires its change event, propagate to VSCode
    document.onDidChange(() => {
      this._onDidChangeCustomDocument.fire({ document })
    })

    return document
  }

  async resolveCustomEditor(
    document: CalcViewDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    const key = document.uri.toString()
    this._webviews.set(key, webviewPanel)
    trackWebviewOpen()

    webviewPanel.webview.options = {
      ...getWebviewOptions(this._context.extensionUri),
      enableScripts: true,
    }

    const port = await ensureServer(this._context)

    webviewPanel.webview.html = getWebviewContent(webviewPanel.webview, this._context.extensionUri, {
      route: '/calcView',
      port,
    })

    // Listen for messages from the webview
    webviewPanel.webview.onDidReceiveMessage(
      (message: { type: string; xml?: string }) => {
        switch (message.type) {
          case 'ready':
            webviewPanel.webview.postMessage({
              type: 'fileContent',
              xml: document.content,
            })
            webviewPanel.webview.postMessage({
              type: 'serverReady',
              port,
            })
            break

          case 'dirty':
            document.markDirty()
            break

          case 'save':
            if (message.xml !== undefined) {
              document.content = message.xml
            }
            break
        }
      },
      undefined,
      []
    )

    webviewPanel.onDidDispose(() => {
      this._webviews.delete(key)
      trackWebviewClose()
    })
  }

  async saveCustomDocument(
    document: CalcViewDocument,
    _cancellation: vscode.CancellationToken
  ): Promise<void> {
    const data = Buffer.from(document.content, 'utf-8')
    await vscode.workspace.fs.writeFile(document.uri, data)
  }

  async saveCustomDocumentAs(
    document: CalcViewDocument,
    destination: vscode.Uri,
    _cancellation: vscode.CancellationToken
  ): Promise<void> {
    const data = Buffer.from(document.content, 'utf-8')
    await vscode.workspace.fs.writeFile(destination, data)
  }

  async revertCustomDocument(
    document: CalcViewDocument,
    _cancellation: vscode.CancellationToken
  ): Promise<void> {
    const fileData = await vscode.workspace.fs.readFile(document.uri)
    document.content = Buffer.from(fileData).toString('utf-8')

    // Re-send content to the webview if it's still open
    const panel = this._webviews.get(document.uri.toString())
    if (panel) {
      panel.webview.postMessage({
        type: 'fileContent',
        xml: document.content,
      })
    }
  }

  async backupCustomDocument(
    document: CalcViewDocument,
    context: vscode.CustomDocumentBackupContext,
    _cancellation: vscode.CancellationToken
  ): Promise<vscode.CustomDocumentBackup> {
    const data = Buffer.from(document.content, 'utf-8')
    await vscode.workspace.fs.writeFile(context.destination, data)
    return {
      id: context.destination.toString(),
      delete: () => {
        vscode.workspace.fs.delete(context.destination).then(undefined, () => {
          // Ignore delete errors for backup cleanup
        })
      },
    }
  }
}
