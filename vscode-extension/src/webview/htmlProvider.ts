import * as vscode from 'vscode'
import * as crypto from 'crypto'

export function getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  options: { route?: string; port?: number } = {}
): string {
  const nonce = crypto.randomBytes(16).toString('hex')

  // Path to the Vue webview build
  const distPath = vscode.Uri.joinPath(extensionUri, '..', 'app', 'vue', 'dist-vscode')
  const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(distPath, 'assets', 'index.js'))
  const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(distPath, 'assets', 'index.css'))

  const csp = [
    `default-src 'none'`,
    `style-src ${webview.cspSource} 'unsafe-inline'`,
    `script-src 'nonce-${nonce}'`,
    `font-src ${webview.cspSource}`,
    `img-src ${webview.cspSource} data:`,
    `connect-src http://localhost:*`,
  ].join('; ')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${styleUri}">
  <title>hana-cli Tools</title>
</head>
<body>
  <div id="app"></div>
  <script nonce="${nonce}">
    window.__VSCODE__ = true;
    window.__HANA_CLI_PORT__ = ${options.port || 0};
    window.__HANA_CLI_ROUTE__ = '${options.route || '/'}';
  </script>
  <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
</body>
</html>`
}

export function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
  const distPath = vscode.Uri.joinPath(extensionUri, '..', 'app', 'vue', 'dist-vscode')
  return {
    enableScripts: true,
    localResourceRoots: [distPath]
  }
}
