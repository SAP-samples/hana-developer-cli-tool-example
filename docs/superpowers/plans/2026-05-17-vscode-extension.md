# VSCode Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a VSCode extension that embeds hana-cli's Vue Web UI as native webviews, registers custom editors for HANA artifacts, and provides a full tools panel — powered by an in-process Express server.

**Architecture:** The extension starts an Express server in-process on activation. Vue webviews load from a dedicated Vite build and communicate with the extension via `acquireVsCodeApi().postMessage()`. Data flows from webview → extension → embedded server → HANA. A `CustomEditorProvider` handles `.hdbcalculationview` files (read/write), and `CustomReadonlyEditorProvider` handles other artifact types.

**Tech Stack:** TypeScript, VSCode Extension API, Express 5, Vue 3, Vite 6, esbuild, UI5 Web Components

**Spec:** `docs/superpowers/specs/2026-05-17-vscode-extension-design.md`

---

## File Structure

```
vscode-extension/
├── src/
│   ├── extension.ts              # Activate/deactivate, register all providers
│   ├── server/
│   │   ├── lifecycle.ts          # Start/stop Express server in-process
│   │   └── port.ts              # Find available port with retry
│   ├── connection/
│   │   ├── resolver.ts          # CAP-first → workspace files → SecretStorage
│   │   ├── manager.ts          # CRUD for stored connections (SecretStorage)
│   │   └── statusBar.ts        # Status bar item + quick pick
│   ├── editors/
│   │   ├── calcViewEditor.ts    # CustomEditorProvider (.hdbcalculationview)
│   │   ├── artifactInspector.ts # CustomReadonlyEditorProvider (table/view/proc/func)
│   │   └── toolsPanel.ts       # Full UI webview panel
│   ├── webview/
│   │   ├── bridge.ts           # Typed postMessage protocol
│   │   └── htmlProvider.ts     # Generate webview HTML (nonces, URIs, CSP)
│   └── commands.ts              # All command handlers
├── package.json                  # Extension manifest (contributes, activation)
├── tsconfig.json                 # TypeScript config
├── esbuild.config.mjs           # Production bundle config
└── test/
    ├── suite/
    │   ├── extension.test.ts    # Activation tests
    │   ├── server.test.ts       # Server lifecycle tests
    │   └── connection.test.ts   # Connection resolver tests
    └── runTests.ts              # Test runner entry

app/vue/
├── src/
│   ├── adapters/
│   │   ├── environment.ts       # EnvironmentAdapter interface
│   │   ├── browserAdapter.ts    # Standalone web implementation
│   │   └── vscodeAdapter.ts     # VSCode webview implementation
│   └── main.ts                  # Updated to initialize adapter
├── vite.config.ts               # Existing (unchanged)
└── vite.config.vscode.ts        # NEW: Webview build config

bin/
└── vscode.js                    # NEW: `hana-cli vscode` CLI command
```

---

## Task 1: Extension Scaffold & Package Manifest

**Files:**
- Create: `vscode-extension/package.json`
- Create: `vscode-extension/tsconfig.json`
- Create: `vscode-extension/src/extension.ts`
- Create: `vscode-extension/.vscodeignore`

- [ ] **Step 1: Create extension package.json**

```json
{
  "name": "hana-cli",
  "displayName": "hana-cli Tools for SAP HANA",
  "description": "Visual editors and database tools for SAP HANA powered by hana-cli",
  "version": "0.1.0",
  "publisher": "SAP-samples",
  "engines": { "vscode": "^1.85.0" },
  "extensionKind": ["workspace"],
  "categories": ["Other", "Visualization"],
  "keywords": ["SAP", "HANA", "database", "calculation view", "CAP"],
  "activationEvents": [
    "workspaceContains:**/*.hdbcalculationview",
    "workspaceContains:**/*.hdbtable",
    "workspaceContains:**/default-env.json",
    "workspaceContains:**/.cdsrc-private.json"
  ],
  "main": "./dist/extension.js",
  "capabilities": {
    "untrustedWorkspaces": { "supported": false }
  },
  "contributes": {
    "commands": [
      { "command": "hana-cli.openTools", "title": "HANA: Open hana-cli Tools" },
      { "command": "hana-cli.openQuery", "title": "HANA: New Query Editor" },
      { "command": "hana-cli.showTables", "title": "HANA: Show Tables" },
      { "command": "hana-cli.showViews", "title": "HANA: Show Views" },
      { "command": "hana-cli.systemInfo", "title": "HANA: System Info" },
      { "command": "hana-cli.addConnection", "title": "HANA: Add Connection" },
      { "command": "hana-cli.importData", "title": "HANA: Import Data" }
    ],
    "customEditors": [
      {
        "viewType": "hana-cli.calcViewEditor",
        "displayName": "Calculation View Editor",
        "selector": [{ "filenamePattern": "*.hdbcalculationview" }],
        "priority": "default"
      },
      {
        "viewType": "hana-cli.tableInspector",
        "displayName": "HANA Table Inspector",
        "selector": [
          { "filenamePattern": "*.hdbtable" },
          { "filenamePattern": "*.hdbmigrationtable" }
        ],
        "priority": "default"
      },
      {
        "viewType": "hana-cli.viewInspector",
        "displayName": "HANA View Inspector",
        "selector": [{ "filenamePattern": "*.hdbview" }],
        "priority": "default"
      },
      {
        "viewType": "hana-cli.procedureInspector",
        "displayName": "HANA Procedure Inspector",
        "selector": [{ "filenamePattern": "*.hdbprocedure" }],
        "priority": "default"
      },
      {
        "viewType": "hana-cli.functionInspector",
        "displayName": "HANA Function Inspector",
        "selector": [{ "filenamePattern": "*.hdbfunction" }],
        "priority": "default"
      },
      {
        "viewType": "hana-cli.synonymInspector",
        "displayName": "HANA Synonym Inspector",
        "selector": [{ "filenamePattern": "*.hdbsynonym" }],
        "priority": "default"
      },
      {
        "viewType": "hana-cli.roleInspector",
        "displayName": "HANA Role Inspector",
        "selector": [{ "filenamePattern": "*.hdbrole" }],
        "priority": "default"
      },
      {
        "viewType": "hana-cli.sequenceInspector",
        "displayName": "HANA Sequence Inspector",
        "selector": [{ "filenamePattern": "*.hdbsequence" }],
        "priority": "default"
      }
    ],
    "menus": {
      "explorer/context": [
        {
          "command": "hana-cli.openTools",
          "when": "resourceExtname == .hdbtable || resourceExtname == .hdbview",
          "group": "hana-cli"
        }
      ]
    }
  },
  "scripts": {
    "compile": "tsc -p ./",
    "bundle": "node esbuild.config.mjs",
    "package": "vsce package",
    "test": "node ./test/runTests.ts"
  },
  "devDependencies": {
    "@types/vscode": "^1.85.0",
    "@vscode/test-electron": "^2.3.0",
    "@vscode/vsce": "^2.22.0",
    "esbuild": "^0.20.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./out",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "out", "dist", "test"]
}
```

- [ ] **Step 3: Create minimal extension.ts (activation only)**

```typescript
import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  console.log('hana-cli extension activated')
}

export function deactivate() {}
```

- [ ] **Step 4: Create .vscodeignore**

```
src/**
test/**
out/**
node_modules/**
.gitignore
tsconfig.json
esbuild.config.mjs
```

- [ ] **Step 5: Install dependencies and verify compilation**

Run: `cd vscode-extension && npm install && npx tsc --noEmit`
Expected: Clean compilation, no errors

- [ ] **Step 6: Commit**

```bash
git add vscode-extension/
git commit -m "feat(vscode): scaffold extension with package manifest and activation"
```

---

## Task 2: Port Discovery & Server Lifecycle

**Files:**
- Create: `vscode-extension/src/server/port.ts`
- Create: `vscode-extension/src/server/lifecycle.ts`
- Create: `vscode-extension/src/server/routes.ts`
- Modify: `vscode-extension/src/extension.ts`

**Important: Static route imports.** The routes must be statically imported (not dynamically discovered via glob) so that esbuild can bundle them into `dist/extension.js`. When packaged as a `.vsix`, there is no filesystem access to `../routes/`. All route modules are imported in a dedicated `routes.ts` barrel file.

- [ ] **Step 1: Create port.ts — find available port**

```typescript
import * as net from 'net'

export function findAvailablePort(startPort = 40000, maxRetries = 10): Promise<number> {
  return new Promise((resolve, reject) => {
    let attempts = 0
    function tryPort(port: number) {
      const server = net.createServer()
      server.unref()
      server.on('error', () => {
        attempts++
        if (attempts >= maxRetries) {
          reject(new Error(`No available port found after ${maxRetries} attempts`))
        } else {
          tryPort(port + 1)
        }
      })
      server.listen(port, '127.0.0.1', () => {
        server.close(() => resolve(port))
      })
    }
    tryPort(startPort + Math.floor(Math.random() * 1000))
  })
}
```

- [ ] **Step 2: Create routes.ts — static barrel of all route modules**

This file statically imports every route module from `../../routes/` so esbuild can trace and bundle them. Each route exports `route(app, server)`.

```typescript
// Static imports — esbuild traces these into the bundle
import * as staticRoutes from '../../routes/static.js'
import * as hanaList from '../../routes/hanaList.js'
import * as hanaInspect from '../../routes/hanaInspect.js'
import * as hanaAnalytics from '../../routes/hanaAnalytics.js'
import * as calcView from '../../routes/calcView.js'
import * as webSocket from '../../routes/webSocket.js'
import * as swagger from '../../routes/swagger.js'
import * as index from '../../routes/index.js'
import * as excel from '../../routes/excel.js'
import * as docs from '../../routes/docs.js'
// ... add all route modules

import type { Express } from 'express'
import type { Server } from 'http'

const allRoutes = [
  staticRoutes, hanaList, hanaInspect, hanaAnalytics,
  calcView, webSocket, swagger, index, excel, docs
]

export function registerAllRoutes(app: Express, server: Server): void {
  for (const routeModule of allRoutes) {
    routeModule.route(app, server)
  }
}
```

**Note:** During implementation, enumerate the actual files in `routes/` and import them all. This is the key design difference from the standalone CLI which uses dynamic glob — the extension needs static imports for bundleability.

- [ ] **Step 3: Create lifecycle.ts — start/stop Express server in-process**

```typescript
import * as vscode from 'vscode'
import * as http from 'http'
import express from 'express'
import { findAvailablePort } from './port.js'
import { registerAllRoutes } from './routes.js'

let server: http.Server | null = null
let currentPort: number | null = null
let shutdownTimer: ReturnType<typeof setTimeout> | null = null

export function getPort(): number | null {
  return currentPort
}

export function isRunning(): boolean {
  return server !== null && server.listening
}

export async function startServer(_context: vscode.ExtensionContext): Promise<number> {
  if (isRunning()) return currentPort!

  cancelShutdownTimer()

  const port = await findAvailablePort()

  const app = express()
  app.set('x-powered-by', false)
  app.disable('etag')

  server = http.createServer()

  // Register all routes via static barrel (bundled by esbuild)
  registerAllRoutes(app, server)

  server.on('request', app)

  return new Promise((resolve, reject) => {
    server!.listen(port, '127.0.0.1', () => {
      currentPort = port
      resolve(port)
    })
    server!.on('error', reject)
  })
}

export async function stopServer(): Promise<void> {
  cancelShutdownTimer()
  if (server) {
    return new Promise((resolve) => {
      server!.close(() => {
        server = null
        currentPort = null
        resolve()
      })
    })
  }
}

export function scheduleShutdown(delayMs = 30000): void {
  cancelShutdownTimer()
  shutdownTimer = setTimeout(() => stopServer(), delayMs)
}

function cancelShutdownTimer(): void {
  if (shutdownTimer) {
    clearTimeout(shutdownTimer)
    shutdownTimer = null
  }
}
```

- [ ] **Step 3: Update extension.ts to manage server lifecycle**

```typescript
import * as vscode from 'vscode'
import { startServer, stopServer } from './server/lifecycle.js'
import { scheduleShutdown } from './server/lifecycle.js'

let activeWebviewCount = 0

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push({
    dispose: () => stopServer()
  })
}

export async function ensureServer(context: vscode.ExtensionContext): Promise<number> {
  return startServer(context)
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
```

- [ ] **Step 4: Verify compilation**

Run: `cd vscode-extension && npx tsc --noEmit`
Expected: Clean compilation

- [ ] **Step 5: Commit**

```bash
git add vscode-extension/src/server/ vscode-extension/src/extension.ts
git commit -m "feat(vscode): add server lifecycle with port discovery and graceful shutdown"
```

---

## Task 3: Webview HTML Provider & Message Bridge

**Files:**
- Create: `vscode-extension/src/webview/htmlProvider.ts`
- Create: `vscode-extension/src/webview/bridge.ts`

- [ ] **Step 1: Create bridge.ts — typed message protocol**

```typescript
// Messages from extension to webview
export type ExtToWebviewMessage =
  | { type: 'serverReady'; port: number }
  | { type: 'themeChanged'; theme: 'light' | 'dark' }
  | { type: 'fileContent'; xml: string }
  | { type: 'requestSave' }
  | { type: 'openArtifact'; kind: string; name: string; schema: string }
  | { type: 'navigate'; route: string }

// Messages from webview to extension
export type WebviewToExtMessage =
  | { type: 'dirty'; value: boolean }
  | { type: 'save'; xml: string }
  | { type: 'showMessage'; level: 'info' | 'warning' | 'error'; text: string }
  | { type: 'openFile'; path: string }
  | { type: 'ready' }
```

- [ ] **Step 2: Create htmlProvider.ts — generate webview HTML with security**

```typescript
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
```

- [ ] **Step 3: Verify compilation**

Run: `cd vscode-extension && npx tsc --noEmit`
Expected: Clean compilation

- [ ] **Step 4: Commit**

```bash
git add vscode-extension/src/webview/
git commit -m "feat(vscode): add webview HTML provider with CSP and typed message bridge"
```

---

## Task 4: Vue Environment Adapter Pattern

**Files:**
- Create: `app/vue/src/adapters/environment.ts`
- Create: `app/vue/src/adapters/browserAdapter.ts`
- Create: `app/vue/src/adapters/vscodeAdapter.ts`
- Modify: `app/vue/src/composables/useHanaApi.ts`
- Modify: `app/vue/src/main.ts`

- [ ] **Step 1: Create environment.ts — adapter interface**

```typescript
export interface EnvironmentAdapter {
  getApiBaseUrl(): string
  getWebSocketUrl(): string
  notifyDirtyState(dirty: boolean): void
  requestSave(): void
  getTheme(): 'light' | 'dark'
  onMessage(handler: (msg: any) => void): void
  postMessage(msg: any): void
  isVSCode(): boolean
}

let currentAdapter: EnvironmentAdapter | null = null

export function setAdapter(adapter: EnvironmentAdapter): void {
  currentAdapter = adapter
}

export function getAdapter(): EnvironmentAdapter {
  if (!currentAdapter) throw new Error('Environment adapter not initialized')
  return currentAdapter
}
```

- [ ] **Step 2: Create browserAdapter.ts — standalone web (existing behavior)**

```typescript
import type { EnvironmentAdapter } from './environment'

export class BrowserAdapter implements EnvironmentAdapter {
  getApiBaseUrl(): string {
    return window.location.origin
  }

  getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}/websockets`
  }

  notifyDirtyState(_dirty: boolean): void {}
  requestSave(): void {}

  getTheme(): 'light' | 'dark' {
    const saved = localStorage.getItem('hana-cli-theme')
    if (saved === 'sap_horizon_dark') return 'dark'
    if (saved && saved !== 'auto') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  onMessage(_handler: (msg: any) => void): void {}
  postMessage(_msg: any): void {}

  isVSCode(): boolean {
    return false
  }
}
```

- [ ] **Step 3: Create vscodeAdapter.ts — webview implementation**

```typescript
import type { EnvironmentAdapter } from './environment'

declare function acquireVsCodeApi(): {
  postMessage(msg: any): void
  getState(): any
  setState(state: any): void
}

export class VSCodeAdapter implements EnvironmentAdapter {
  private vscode = acquireVsCodeApi()
  private port: number = 0
  private theme: 'light' | 'dark' = 'light'
  private messageHandlers: Array<(msg: any) => void> = []

  constructor() {
    this.port = (window as any).__HANA_CLI_PORT__ || 0
    this.theme = document.body.classList.contains('vscode-dark') ? 'dark' : 'light'

    window.addEventListener('message', (event) => {
      const msg = event.data
      if (msg.type === 'serverReady') this.port = msg.port
      if (msg.type === 'themeChanged') this.theme = msg.theme
      for (const handler of this.messageHandlers) handler(msg)
    })

    this.vscode.postMessage({ type: 'ready' })
  }

  getApiBaseUrl(): string {
    return `http://localhost:${this.port}`
  }

  getWebSocketUrl(): string {
    return `ws://localhost:${this.port}/websockets`
  }

  notifyDirtyState(dirty: boolean): void {
    this.vscode.postMessage({ type: 'dirty', value: dirty })
  }

  requestSave(): void {}

  getTheme(): 'light' | 'dark' {
    return this.theme
  }

  onMessage(handler: (msg: any) => void): void {
    this.messageHandlers.push(handler)
  }

  postMessage(msg: any): void {
    this.vscode.postMessage(msg)
  }

  isVSCode(): boolean {
    return true
  }
}
```

- [ ] **Step 4: Modify useHanaApi.ts to use adapter for base URL**

Update `app/vue/src/composables/useHanaApi.ts` to prepend the adapter's API base URL to all fetch calls. The key change: wrap `fetch()` calls with `${baseUrl()}` prefix where `baseUrl()` calls `getAdapter().getApiBaseUrl()` (returns `''` for browser mode via a try/catch fallback).

- [ ] **Step 5: Modify main.ts to initialize adapter before app mount**

Insert adapter initialization before `createApp()`:
```typescript
import { setAdapter } from './adapters/environment'
import { BrowserAdapter } from './adapters/browserAdapter'
import { VSCodeAdapter } from './adapters/vscodeAdapter'

if ((window as any).__VSCODE__) {
  setAdapter(new VSCodeAdapter())
} else {
  setAdapter(new BrowserAdapter())
}
```

- [ ] **Step 6: Run existing Vue tests to verify no regression**

Run: `cd app/vue && npm run test`
Expected: All existing tests pass

- [ ] **Step 7: Commit**

```bash
git add app/vue/src/adapters/ app/vue/src/composables/useHanaApi.ts app/vue/src/main.ts
git commit -m "feat(vue): add environment adapter pattern for VSCode/browser dual-target"
```

---

## Task 5: Dual-Target Vite Build

**Files:**
- Create: `app/vue/vite.config.vscode.ts`
- Modify: `app/vue/package.json` (add `build:vscode` script)

- [ ] **Step 1: Create vite.config.vscode.ts**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.startsWith('ui5-')
        }
      }
    })
  ],
  base: '',
  build: {
    outDir: 'dist-vscode',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
})
```

- [ ] **Step 2: Add build:vscode script to app/vue/package.json**

Add to scripts: `"build:vscode": "vue-tsc --noEmit && vite build --config vite.config.vscode.ts"`

- [ ] **Step 3: Test the webview build**

Run: `cd app/vue && npm run build:vscode`
Expected: Build succeeds, output in `app/vue/dist-vscode/` with `assets/index.js`, `assets/index.css`

- [ ] **Step 4: Verify standalone build still works**

Run: `cd app/vue && npm run build`
Expected: Build succeeds, output in `app/vue/dist/` (unchanged behavior)

- [ ] **Step 5: Add dist-vscode/ to .gitignore**

- [ ] **Step 6: Commit**

```bash
git add app/vue/vite.config.vscode.ts app/vue/package.json .gitignore
git commit -m "feat(vue): add dual-target Vite build for VSCode webview output"
```

---

## Task 6: Full UI Panel (Tools Panel)

**Files:**
- Create: `vscode-extension/src/editors/toolsPanel.ts`
- Modify: `vscode-extension/src/extension.ts`

- [ ] **Step 1: Create toolsPanel.ts**

Implements `registerToolsPanel(context)` that registers commands (`hana-cli.openTools`, `hana-cli.openQuery`, `hana-cli.showTables`, `hana-cli.showViews`, `hana-cli.systemInfo`, `hana-cli.importData`) which open a `WebviewPanel` with `retainContextWhenHidden: true`. Deep-link commands send `{ type: 'navigate', route }` to existing panel or create new one.

Message handler processes `showMessage` and `openFile` from webview.

- [ ] **Step 2: Wire tools panel into extension.ts activate()**

- [ ] **Step 3: Verify compilation**

Run: `cd vscode-extension && npx tsc --noEmit`
Expected: Clean compilation

- [ ] **Step 4: Commit**

```bash
git add vscode-extension/src/editors/toolsPanel.ts vscode-extension/src/extension.ts
git commit -m "feat(vscode): add full UI tools panel with deep-link navigation commands"
```

---

## Task 7: Calc View Custom Editor Provider

**Files:**
- Create: `vscode-extension/src/editors/calcViewEditor.ts`
- Modify: `vscode-extension/src/extension.ts`

- [ ] **Step 1: Create calcViewEditor.ts**

Implements `CalcViewEditorProvider` with `CustomEditorProvider<CalcViewDocument>`:
- `openCustomDocument()` — reads file via `workspace.fs.readFile`
- `resolveCustomEditor()` — creates webview, sends `fileContent` on `ready` message
- `saveCustomDocument()` — writes `document.content` via `workspace.fs.writeFile`
- `revertCustomDocument()` — re-reads from disk, re-sends to webview
- `backupCustomDocument()` — persists to backup URI for hot exit

Handles messages: `ready` → send XML, `dirty` → fire edit event, `save` → update content.

Static `register()` method creates and registers the provider with `retainContextWhenHidden: true`.

- [ ] **Step 2: Register in extension.ts activate()**

- [ ] **Step 3: Verify compilation**

Run: `cd vscode-extension && npx tsc --noEmit`
Expected: Clean compilation

- [ ] **Step 4: Commit**

```bash
git add vscode-extension/src/editors/calcViewEditor.ts vscode-extension/src/extension.ts
git commit -m "feat(vscode): add CustomEditorProvider for .hdbcalculationview files"
```

---

## Task 8: Artifact Inspectors (Read-Only Custom Editors)

**Files:**
- Create: `vscode-extension/src/editors/artifactInspector.ts`
- Modify: `vscode-extension/src/extension.ts`

- [ ] **Step 1: Create artifactInspector.ts**

Implements `ArtifactInspectorProvider` with `CustomReadonlyEditorProvider`. Configurable via an `ArtifactConfig` array mapping viewType → route → artifactKind:
- `tableInspector` → `/inspectTable` → `table`
- `viewInspector` → `/inspectView` → `view`
- `procedureInspector` → `/inspectProcedure` → `procedure`
- `functionInspector` → `/inspectFunction` → `function`
- `synonymInspector` → `/inspectSynonym` → `synonym`
- `roleInspector` → `/inspectRole` → `role`
- `sequenceInspector` → `/inspectSequence` → `sequence`

Static `registerAll(context)` registers all providers. On `ready` message, sends `openArtifact` with the artifact name parsed from the filename (strip extension).

- [ ] **Step 2: Register all inspectors in extension.ts**

- [ ] **Step 3: Verify compilation**

Run: `cd vscode-extension && npx tsc --noEmit`
Expected: Clean compilation

- [ ] **Step 4: Commit**

```bash
git add vscode-extension/src/editors/artifactInspector.ts vscode-extension/src/extension.ts
git commit -m "feat(vscode): add read-only custom editor providers for HANA artifacts"
```

---

## Task 9: Connection Resolver (CAP-First)

**Files:**
- Create: `vscode-extension/src/connection/resolver.ts`
- Create: `vscode-extension/src/connection/manager.ts`
- Create: `vscode-extension/src/connection/statusBar.ts`
- Modify: `vscode-extension/src/server/lifecycle.ts` (inject connection into Express)
- Modify: `vscode-extension/src/extension.ts`

**Important: Connection propagation.** The existing Express routes in `routes/*.js` read credentials from `utils/base.js` which in turn reads from `default-env.json` or environment variables. When running in-process, we bridge the resolved connection by writing a temporary `default-env.json` to a workspace-scoped temp directory and setting `process.env.VCAP_SERVICES` before starting the server. This way routes use their existing credential resolution path without modification.

- [ ] **Step 1: Create resolver.ts**

Implements `resolveConnection(workspaceFolder)` with 3-step resolution:
1. CAP: Check `package.json` for `@sap/cds`, parse `.cdsrc-private.json` credentials
2. Workspace files: Parse `default-env.json` for `VCAP_SERVICES.hana` credentials
3. Returns `null` if none found (triggers VSCode SecretStorage fallback)

Returns `HanaConnection` interface: `{ host, port, user, password, useTLS, schema, source }`

- [ ] **Step 2: Create manager.ts — VSCode SecretStorage CRUD**

`ConnectionManager` class wraps `vscode.SecretStorage` with `getAll()`, `save(name, conn)`, `remove(name)` methods. Storage key: `hana-cli.connections`.

- [ ] **Step 3: Create statusBar.ts**

`createConnectionStatusBar()` creates a `StatusBarItem` (left-aligned). `updateStatus(conn)` sets text to `$(database) HANA: user@host:port` or `$(warning) HANA: Not Connected`.

- [ ] **Step 4: Add connection injection to server lifecycle**

Update `lifecycle.ts` `startServer()` to accept an optional `HanaConnection` parameter. Before starting Express, set `process.env.VCAP_SERVICES` with the resolved credentials in the format the existing routes expect:

```typescript
export function injectConnection(conn: HanaConnection): void {
  process.env.VCAP_SERVICES = JSON.stringify({
    hana: [{
      credentials: {
        host: conn.host,
        port: String(conn.port),
        user: conn.user,
        password: conn.password,
        encrypt: conn.useTLS !== false,
        schema: conn.schema || ''
      }
    }]
  })
}
```

Call this before `registerAllRoutes()` in `startServer()`.

- [ ] **Step 5: Register connection commands and status bar in extension.ts**

Register `hana-cli.addConnection` command with input prompts for host/port/user/password. Auto-resolve connection on activation using `resolveConnection()`. On success, call `injectConnection()` and `updateStatus()`. Show status bar.

- [ ] **Step 5: Verify compilation**

Run: `cd vscode-extension && npx tsc --noEmit`
Expected: Clean compilation

- [ ] **Step 6: Commit**

```bash
git add vscode-extension/src/connection/
git commit -m "feat(vscode): add CAP-first connection resolver with status bar and SecretStorage"
```

---

## Task 10: CLI Installer Command (`hana-cli vscode`)

**Files:**
- Create: `bin/vscode.js`
- Modify: `bin/commandMap.js` (add vscode command)
- Modify: `_i18n/messages_en.properties` (add i18n key)

Reference: `.github/instructions/cli-command-development.instructions.md`

- [ ] **Step 1: Create bin/vscode.js**

Uses `execFileSync` (not `exec` — avoids shell injection) to run `code --install-extension`, `code --uninstall-extension`, or `code --list-extensions --show-versions`. Detects `code`/`codium`/`code-insiders` in PATH. Supports `--insiders` flag. Falls back to instructions if CLI not found. Looks for bundled `.vsix` in `../vscode-extension/` directory.

- [ ] **Step 2: Add i18n key**

Add to `_i18n/messages_en.properties`:
```
vscode=Manage the hana-cli VSCode extension (install, uninstall, status)
```

- [ ] **Step 3: Register in commandMap.js**

Add the vscode command following the existing registration pattern.

- [ ] **Step 4: Test the command**

Run: `node bin/cli.js vscode status`
Expected: Shows whether extension is installed (or "not installed")

- [ ] **Step 5: Commit**

```bash
git add bin/vscode.js _i18n/messages_en.properties bin/commandMap.js
git commit -m "feat(cli): add 'hana-cli vscode' command for extension install/uninstall/status"
```

---

## Task 11: esbuild Bundle Configuration

**Files:**
- Create: `vscode-extension/esbuild.config.mjs`
- Modify: `vscode-extension/package.json` (refine scripts)

- [ ] **Step 1: Create esbuild.config.mjs**

Note: Because `routes.ts` statically imports all route modules, esbuild traces and bundles them automatically. No special plugin needed.

```javascript
import * as esbuild from 'esbuild'

const production = process.argv.includes('--production')

await esbuild.build({
  entryPoints: ['./out/extension.js'],
  bundle: true,
  outfile: './dist/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  sourcemap: !production,
  minify: production,
  treeShaking: true,
})
```

- [ ] **Step 2: Update package.json scripts**

```json
"bundle": "npm run compile && node esbuild.config.mjs --production",
"bundle:dev": "npm run compile && node esbuild.config.mjs",
"package": "npm run bundle && vsce package"
```

- [ ] **Step 3: Test the bundle**

Run: `cd vscode-extension && npm run bundle:dev`
Expected: `dist/extension.js` created

- [ ] **Step 4: Commit**

```bash
git add vscode-extension/esbuild.config.mjs vscode-extension/package.json
git commit -m "feat(vscode): add esbuild configuration for production bundling"
```

---

## Task 12: Root Build Script & Integration

**Files:**
- Modify: `package.json` (root — add `build:vscode` script)

- [ ] **Step 1: Add build:vscode to root package.json scripts**

```json
"build:vscode": "cd app/vue && npm run build:vscode && cd ../../vscode-extension && npm run bundle"
```

- [ ] **Step 2: Run the full build**

Run: `npm run build:vscode`
Expected: Vue webview build + extension bundle both succeed

- [ ] **Step 3: Test packaging**

Run: `cd vscode-extension && npx vsce package --no-dependencies`
Expected: `hana-cli-0.1.0.vsix` created

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "feat: add root build:vscode script for full extension build pipeline"
```

---

## Task 13: Extension Integration Test Scaffold

**Files:**
- Create: `vscode-extension/test/runTests.ts`
- Create: `vscode-extension/test/suite/index.ts`
- Create: `vscode-extension/test/suite/extension.test.ts`

- [ ] **Step 1: Create test runner and suite index**

Standard `@vscode/test-electron` runner that discovers and runs Mocha tests from `test/suite/`.

- [ ] **Step 2: Create activation test**

Tests that the extension is present and all expected commands are registered.

- [ ] **Step 3: Verify tests compile**

Run: `cd vscode-extension && npx tsc -p ./`
Expected: Compiles cleanly

- [ ] **Step 4: Commit**

```bash
git add vscode-extension/test/
git commit -m "test(vscode): add extension integration test scaffold with activation tests"
```

---

## Task 14: End-to-End Smoke Test

**Files:**
- Create: `vscode-extension/test/suite/calcViewEditor.test.ts`

- [ ] **Step 1: Create calc view editor smoke test**

Creates a temp `.hdbcalculationview` file with minimal XML, opens it with `vscode.openWith` using the custom editor viewType, verifies a tab opens for the file.

- [ ] **Step 2: Commit**

```bash
git add vscode-extension/test/suite/calcViewEditor.test.ts
git commit -m "test(vscode): add end-to-end smoke test for calc view custom editor"
```

---

## Task 15: GitHub Actions CI Workflow

**Files:**
- Create: `.github/workflows/vscode-extension.yml`

- [ ] **Step 1: Create CI workflow**

Matrix build on ubuntu/windows/macos × Node 20/22. Steps: install deps, build Vue webview, compile extension, bundle, package VSIX, upload artifact. Release job on `vscode-v*` tags creates GitHub Release with `.vsix`.

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/vscode-extension.yml
git commit -m "ci: add GitHub Actions workflow for VSCode extension build and release"
```

---

## Summary & Verification

After completing all tasks, verify the full flow:

1. **Build:** `npm run build:vscode` produces `app/vue/dist-vscode/` + `vscode-extension/dist/extension.js`
2. **Package:** `cd vscode-extension && npx vsce package` produces `.vsix`
3. **Install:** `code --install-extension hana-cli-0.1.0.vsix`
4. **Test activation:** Open a workspace with `.hdbcalculationview` files
5. **Test calc view:** Double-click a `.hdbcalculationview` → visual editor renders
6. **Test panel:** `Ctrl+Shift+P` → "HANA: Open hana-cli Tools" → full UI loads
7. **Test CLI:** `hana-cli vscode status` → shows installed version
