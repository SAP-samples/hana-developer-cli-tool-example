import * as vscode from 'vscode'
import * as path from 'path'
import { startServer, stopServer, scheduleShutdown, injectConnection } from './server/lifecycle.js'
import { registerToolsPanel } from './editors/toolsPanel.js'
import { CalcViewEditorProvider } from './editors/calcViewEditor.js'
import { ArtifactInspectorProvider } from './editors/artifactInspector.js'
import { resolveConnectionInDir, type HanaConnection, type ResolveResult } from './connection/resolver.js'
import { discoverConfigDirs } from './connection/discovery.js'
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
      autoResolveConnection(folders[0]).then((result) => {
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

/**
 * Auto-resolve the workspace HANA connection.
 *
 * The connection config (`.cdsrc-private.json`, `default-env.json`, or a CAP
 * `package.json`) may not live at the workspace root — it is common for the
 * CAP project to sit in a subfolder (e.g. `cap/`). This:
 *   1. Honors an explicit `hana-cli.projectPath` setting when present.
 *   2. Otherwise scans the workspace for config-bearing directories.
 *   3. Prompts via QuickPick when more than one candidate is found.
 */
async function autoResolveConnection(
  workspaceFolder: vscode.WorkspaceFolder
): Promise<ResolveResult> {
  const rootPath = workspaceFolder.uri.fsPath

  // 1. Explicit override wins.
  const override = vscode.workspace
    .getConfiguration('hana-cli')
    .get<string>('projectPath')
  if (override && override.trim()) {
    const dir = path.isAbsolute(override) ? override : path.join(rootPath, override)
    outputChannel.appendLine(`Using configured hana-cli.projectPath: ${dir}`)
    return resolveConnectionInDir(dir)
  }

  // 2. Discover config-bearing directories (bounded scan).
  const candidates = discoverConfigDirs(rootPath)
  if (candidates.length === 0) {
    // Fall back to resolving the root itself (preserves prior behavior).
    return resolveConnectionInDir(rootPath)
  }

  // 3. Single candidate → use it directly.
  if (candidates.length === 1) {
    return resolveConnectionInDir(candidates[0].dir)
  }

  // 4. Multiple candidates → let the user choose.
  const picked = await vscode.window.showQuickPick(
    candidates.map((c) => {
      const rel = path.relative(rootPath, c.dir) || '.'
      return {
        label: rel,
        description: c.kinds.join(', '),
        detail: c.dir,
        dir: c.dir
      }
    }),
    {
      title: 'hana-cli: Select the project to connect',
      placeHolder: 'Multiple HANA connection configs found — pick one'
    }
  )

  if (!picked) {
    // User dismissed the picker — default to the shallowest candidate.
    return resolveConnectionInDir(candidates[0].dir)
  }
  return resolveConnectionInDir(picked.dir)
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
