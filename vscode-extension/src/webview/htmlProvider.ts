import * as vscode from 'vscode'
import * as crypto from 'crypto'

interface WebviewContentOptions {
  route?: string
  port?: number
  chromeless?: boolean
}

export function getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  options: WebviewContentOptions = {}
): string {
  const nonce = crypto.randomBytes(16).toString('hex')

  const distPath = vscode.Uri.joinPath(extensionUri, '..', 'app', 'vue', 'dist-vscode')
  const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(distPath, 'assets', 'index.js'))
  const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(distPath, 'assets', 'index.css'))

  const csp = [
    `default-src 'none'`,
    `style-src ${webview.cspSource} 'unsafe-inline'`,
    `script-src ${webview.cspSource} 'unsafe-inline'`,
    `font-src ${webview.cspSource}`,
    `img-src ${webview.cspSource} data:`,
    `connect-src http://localhost:*`,
  ].join('; ')

  const chromelessCSS = options.chromeless ? `
    <style>
      ui5-shellbar { display: none !important; }
      ui5-side-navigation { display: none !important; }
      .content-area { padding: 0.5rem !important; }
    </style>` : ''

  const route = options.route || '/'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${styleUri}">
  <style>
    html, body { margin: 0; height: 100%; overflow: hidden; }
    #app { height: 100%; display: flex; flex-direction: column; }
  </style>
  <title>hana-cli Tools</title>${chromelessCSS}
</head>
<body>
  <div id="app"><p style="padding:1rem;color:#ccc;">Loading hana-cli UI...</p></div>
  <script nonce="${nonce}">
    window.__VSCODE__ = true;
    window.__HANA_CLI_PORT__ = ${options.port || 0};
    window.__HANA_CLI_ROUTE__ = '${route}';
    window.__HANA_CLI_CHROMELESS__ = ${!!options.chromeless};
    if (window.location.hash !== '#${route}') {
      window.location.hash = '#${route}';
    }
    window.onerror = function(msg, src, line) {
      var el = document.createElement('pre');
      el.style.cssText = 'color:red;padding:1rem;white-space:pre-wrap;';
      el.textContent = 'ERROR: ' + msg + '\\nSource: ' + src + ':' + line;
      document.getElementById('app').replaceChildren(el);
    };
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
