# VSCode Extension for hana-cli

**Date:** 2026-05-17  
**Status:** Draft  
**Author:** Thomas Jung + Claude

## Summary

A VSCode extension that surfaces hana-cli's Vue Web UI inside VSCode as native webviews, registers custom editors for HANA design-time artifacts (`.hdbcalculationview`, `.hdbtable`, `.hdbview`, etc.), and provides the full hana-cli tools experience as an editor panel — all powered by an embedded Express server running in-process on the extension host.

## Goals

1. Open `.hdbcalculationview` files in a visual graph editor natively in VSCode
2. Provide rich read-only inspectors for HANA artifacts (tables, views, procedures, functions)
3. Surface all 30+ hana-cli UI views inside VSCode without requiring a browser
4. Work in all VSCode environments: Desktop, SSH Remote, Containers, BAS, Codespaces
5. Maximize code reuse — the Vue app and Express REST APIs remain the single source of truth

## Non-Goals

- Replacing the standalone `hana-cli ui` browser experience (it continues to work independently)
- Reimplementing views in VSCode-native tree views or custom UI (we embed the Vue app)
- Supporting VSCode Web (browser-only VSCode) — requires workspace extension host

## Architecture

### Integration Model: Hybrid Direct Webview + Embedded Server

```
┌─────────────────────────────────────────────────────────────────┐
│  VSCode Extension Host (local or remote)                        │
│                                                                 │
│  ┌──────────────────┐       ┌─────────────────────────────┐    │
│  │  Extension Core   │       │  Embedded Express Server     │    │
│  │                  │       │  (started on activation)     │    │
│  │  • Activation    │       │                             │    │
│  │  • Server mgmt   │◄─────►│  • /hana/* REST APIs        │    │
│  │  • Connection    │       │  • /websockets (WS)         │    │
│  │  • Commands      │       │  • File I/O (calcview)      │    │
│  │  • Custom Editor │       │                             │    │
│  └────────┬─────────┘       └──────────────┬──────────────┘    │
│           │                                │                    │
│           │ acquireVsCodeApi()             │ fetch()            │
│           │ postMessage                    │                    │
│           ▼                                ▼                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  VSCode Webview (Vue App)                                │    │
│  │                                                         │    │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐   │    │
│  │  │ Calc View   │  │ Artifact     │  │ All Other    │   │    │
│  │  │ Editor      │  │ Inspectors   │  │ Views        │   │    │
│  │  │ (Custom     │  │ (Table,View, │  │ (30+ pages)  │   │    │
│  │  │  Editor)    │  │  Proc, Func) │  │              │   │    │
│  │  └─────────────┘  └──────────────┘  └──────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
           │
           │ HANA Client (hdb driver)
           ▼
  ┌─────────────────┐
  │  SAP HANA DB    │
  └─────────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Server model | In-process Express (not child process) | No PATH issues, no version mismatch, shares extension host Node.js |
| Webview loading | Direct bundle (not iframe) | Native VSCode CSP, theme sync, acquireVsCodeApi() access |
| Build strategy | Dual Vite target | Standalone web + webview bundle from same source |
| File I/O (calc view) | CustomEditorProvider via postMessage | VSCode owns file lifecycle (dirty, save, revert, backup) |
| File I/O (inspectors) | CustomReadonlyEditorProvider | Parse artifact → query HANA via embedded server |
| Remote support | `extensionKind: ["workspace"]` | Extension runs where files are (remote host) |
| Connection resolution | CAP-first with fallback chain | Matches primary audience (CAP developers) |

## Directory Structure

```
vscode-extension/
├── src/
│   ├── extension.ts              # activate/deactivate, register providers
│   ├── server/
│   │   ├── lifecycle.ts          # Start/stop embedded Express server
│   │   └── port.ts              # Random port allocation + discovery
│   ├── connection/
│   │   ├── resolver.ts          # CAP-first connection detection
│   │   ├── manager.ts          # VSCode SecretStorage fallback
│   │   └── statusBar.ts        # Connection status indicator
│   ├── editors/
│   │   ├── calcViewEditor.ts    # CustomEditorProvider for .hdbcalculationview
│   │   ├── artifactInspector.ts # CustomReadonlyEditorProvider for .hdbtable, etc.
│   │   └── toolsPanel.ts       # Full UI panel provider
│   ├── webview/
│   │   ├── bridge.ts           # postMessage protocol (extension ↔ Vue)
│   │   └── htmlProvider.ts     # Generate webview HTML with nonces, URIs
│   └── commands.ts              # VSCode command palette entries
├── package.json                  # Extension manifest
├── tsconfig.json
└── esbuild.config.mjs           # Bundle for distribution
```

## Custom Editors

### Calculation View Editor (Read/Write)

Registered as the default editor for `.hdbcalculationview` files. Users double-click a calc view file and get the visual graph editor.

**File lifecycle:**

1. **Open:** VSCode calls `resolveCustomEditor(document, webviewPanel)`. Extension reads file content via `document.getText()`, creates webview, sends `{ type: 'fileContent', xml }`. Vue parses XML and renders the graph.
2. **Edit:** Mutations in the canvas fire `{ type: 'dirty', value: true }`. Extension marks document dirty. Undo/redo stays in Vue's command-pattern composable.
3. **Save (Ctrl+S):** VSCode calls `saveCustomDocument()`. Extension sends `{ type: 'requestSave' }` → Vue serializes model to XML → sends `{ type: 'save', xml }` → extension writes via `workspace.fs.writeFile()`.
4. **Revert:** Extension re-reads file from disk, re-sends `fileContent` to webview.
5. **Backup:** Extension implements `backupCustomDocument()` for hot exit / crash recovery.

**Escape hatch:** Right-click → "Open With" → "Text Editor" for raw XML editing.

### Artifact Inspectors (Read-Only)

| File Extension | View | Provider |
|---|---|---|
| `.hdbtable`, `.hdbmigrationtable` | Inspect Table | `CustomReadonlyEditorProvider` |
| `.hdbview` | Inspect View | `CustomReadonlyEditorProvider` |
| `.hdbprocedure` | Inspect Procedure | `CustomReadonlyEditorProvider` |
| `.hdbfunction` | Inspect Function | `CustomReadonlyEditorProvider` |
| `.hdbsynonym` | Synonym Viewer | `CustomReadonlyEditorProvider` |
| `.hdbrole` | Role Viewer | `CustomReadonlyEditorProvider` |
| `.hdbsequence` | Sequence Viewer | `CustomReadonlyEditorProvider` |

**Flow:** Open file → parse artifact name/schema → query HANA via embedded server REST API → display live metadata (columns, indexes, size, dependencies).

**When no connection:** Shows "Connect to HANA to view live metadata" prompt with a connection action button.

## Full UI Panel

- **Activation:** Activity bar icon, command palette (`HANA: Open hana-cli Tools`), or keyboard shortcut
- **Behavior:** Opens as an editor tab (not sidebar). Vue app's internal navigation handles routing.
- **State:** `retainContextWhenHidden: true` preserves state across tab switches
- **Deep linking:** VSCode commands navigate to specific views within the panel

## Connection Management

### Resolution Order

```
1. CAP project detection
   ├── Workspace has package.json with @sap/cds?
   ├── Run `cds env get requires.db.credentials`
   └── Or parse .cdsrc-private.json

2. Workspace file detection (existing hana-cli fallback)
   ├── default-env.json (workspace root or parent)
   ├── .env with VCAP_SERVICES
   └── default-env-admin.json

3. VSCode-managed connections (fallback)
   ├── Stored in VSCode SecretStorage
   ├── Managed via "HANA: Add Connection" command
   └── Displayed in status bar
```

### UX

- **Status bar:** `$(database) HANA: HXE @ localhost:39015` or `$(warning) HANA: Not Connected`
- **Click status bar:** Quick pick → switch, add, edit, test connection
- **Multi-connection:** Per-workspace-folder resolution, active connection shown in status bar

## Webview Integration

### Environment Adapter Pattern

```typescript
// app/vue/src/adapters/environment.ts
export interface EnvironmentAdapter {
  getApiBaseUrl(): string
  getWebSocketUrl(): string
  notifyDirtyState(dirty: boolean): void
  requestSave(): void
  getTheme(): 'light' | 'dark'
}

// Implementations:
// - BrowserAdapter (standalone web, uses window.location.origin)
// - VSCodeAdapter (postMessage bridge, port from extension)
```

### Dual-Target Vite Build

```
app/vue/
├── vite.config.ts              # Standalone: base '/ui/', dev server proxy
├── vite.config.vscode.ts       # Webview: base '', inline assets, no proxy
```

Webview build differences:
- `base: ''` (relative paths)
- Assets referenced via placeholder tokens → replaced with `webviewUri`s by `htmlProvider.ts`
- Entry includes `acquireVsCodeApi()` initialization
- API base URL injected via postMessage from extension

### Message Bridge Protocol

| Direction | Message | Purpose |
|-----------|---------|---------|
| ext → webview | `{ type: 'serverReady', port }` | Webview discovers API endpoint |
| ext → webview | `{ type: 'themeChanged', theme }` | Theme synchronization |
| ext → webview | `{ type: 'fileContent', xml }` | Custom editor file data |
| ext → webview | `{ type: 'requestSave' }` | Trigger serialization |
| ext → webview | `{ type: 'openArtifact', kind, name, schema }` | Inspector target |
| webview → ext | `{ type: 'dirty', value }` | Unsaved changes indicator |
| webview → ext | `{ type: 'save', xml }` | Serialized content for save |
| webview → ext | `{ type: 'showMessage', level, text }` | Native VSCode notifications |
| webview → ext | `{ type: 'openFile', path }` | Request to open file in editor |

## Server Lifecycle

1. Extension activates when workspace contains `.hdbcalculationview`, `.hdbtable`, `default-env.json`, or CAP project markers
2. On first webview/editor open, extension starts Express server in-process on random available port bound to `127.0.0.1`
3. Server port communicated to webviews via `postMessage`
4. Server shuts down on extension deactivation or when last webview closes (30s grace period)
5. In remote environments, server and webview are co-located on extension host — no port forwarding needed

## Commands & Context Menus

### Command Palette

| Command | Action |
|---------|--------|
| `HANA: Open hana-cli Tools` | Full UI panel |
| `HANA: New Query Editor` | Deep-link to query view |
| `HANA: Show Tables` | Deep-link to tables view |
| `HANA: Show Views` | Deep-link to views view |
| `HANA: System Info` | Deep-link to system info |
| `HANA: Add Connection` | Connection manager |
| `HANA: Import Data` | Import wizard |

### Context Menus

- Right-click `.hdbtable` → "HANA: Inspect Table"
- Right-click `.hdbcalculationview` → "HANA: Open in Calc View Editor"
- Right-click `.csv` → "HANA: Import to Table"

## Build Pipeline & Distribution

### Build Chain

```
npm run build:vscode
  ├─ 1. Build Vue app for webview (vite.config.vscode.ts → app/vue/dist-vscode/)
  ├─ 2. Compile extension TypeScript (tsc → vscode-extension/out/)
  ├─ 3. Bundle with esbuild (out/ + deps → vscode-extension/dist/extension.js)
  └─ 4. Package with vsce (dist/ + dist-vscode/ → hana-cli-x.x.x.vsix)
```

### Bundle Contents (.vsix)

- `dist/extension.js` — esbuild-bundled extension (includes Express, routes, utils, hdb driver)
- `dist-vscode/` — Vue app built for webview
- `_i18n/` — Localization bundles
- `package.json` — Extension manifest

### Distribution Channels

1. **VSCode Marketplace** — Public, searchable, auto-updates (stable releases)
2. **GitHub Releases** — `.vsix` attached to releases (pre-release + stable)
3. **CLI installer** — `hana-cli vscode install` command

### CLI Installer Command

```bash
hana-cli vscode install     # Install extension via `code --install-extension`
hana-cli vscode uninstall   # Remove extension
hana-cli vscode status      # Check installed version
```

Behavior:
- Detects `code` / `codium` CLI in PATH
- Downloads latest `.vsix` from GitHub Releases (or uses bundled copy if running from npm install)
- Supports `--insiders` flag for VSCode Insiders
- Provides manual instructions if `code` CLI unavailable

### CI/CD

GitHub Actions workflow on tag push:
- Build `.vsix` on Windows/macOS/Linux
- Run extension tests with `@vscode/test-electron`
- Publish to Marketplace (stable tags)
- Attach `.vsix` to GitHub Release

## Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Extension unit | `@vscode/test-electron` + Mocha | Activation, server lifecycle, connection resolver, commands |
| Webview (Vue) | Existing Vitest suite | Components, adapter layer, message bridge (mocked) |
| End-to-end | `@vscode/test-electron` | Open artifact → verify webview renders → simulate save |
| Server (unchanged) | Existing `npm test` | All REST APIs, CLI commands |

## Extension Manifest Highlights

```jsonc
{
  "name": "hana-cli",
  "displayName": "hana-cli Tools for SAP HANA",
  "publisher": "SAP-samples",
  "engines": { "vscode": "^1.85.0" },
  "extensionKind": ["workspace"],
  "activationEvents": [
    "workspaceContains:**/*.hdbcalculationview",
    "workspaceContains:**/*.hdbtable",
    "workspaceContains:**/default-env.json",
    "workspaceContains:**/.cdsrc-private.json"
  ],
  "capabilities": {
    "untrustedWorkspaces": { "supported": false }
  }
}
```

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `.vsix` bundle size (Express + all deps) | Large download, slow install | esbuild tree-shaking, exclude dev-only code |
| Port conflicts in shared environments | Server fails to start | Random port + retry with backoff |
| hdb driver platform compatibility | Extension fails on some OS | hdb is pure JS — no native modules |
| Webview memory (30+ views retained) | High memory usage | Lazy-load routes, dispose idle webviews |
| CSP restrictions for fetch to localhost | API calls blocked | Webview CSP includes `connect-src http://localhost:*` |
| Theme mismatch (UI5 vs VSCode) | Visual inconsistency | Map VSCode CSS variables to UI5 theme params |

## Future Considerations

- **Tree view for schema browsing** — Native VSCode tree view as lightweight alternative to full panel
- **Notebook integration** — HANA SQL notebooks using VSCode's notebook API
- **Code lens** — Show record counts, last-modified on `.hdbtable` files inline
- **Diagnostics** — Lint `.hdbcalculationview` XML for common errors
- **MCP bridge** — Connect the extension's server to the MCP protocol for AI tool integration within VSCode
