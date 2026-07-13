# ESM Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace CommonJS-interop legacy patterns (`createRequire` static requires, `fileURLToPath` `__dirname`/`__filename` shims) with Node 22+ built-ins, and delete the two esbuild workarounds added during the extension-activation fix.

**Architecture:** Purely mechanical, per-file substitutions grouped by category and directory. Each task ends with `npm test` + `npm run lint` green and a commit. The extension bundle is the critical verification: it must load from a `node_modules`-free directory with `activate` exported.

**Tech Stack:** Node.js ≥22 (ESM), esbuild, Mocha, ESLint flat config, TypeScript (mcp-server).

## Global Constraints

- Node baseline: `>=22.0.0` (per `package.json` engines). `import.meta.dirname`/`import.meta.filename` (Node 20.11+) and JSON import attributes `with { type: 'json' }` (stable Node 22) are both safe.
- Pure ESM project (`"type": "module"`).
- Do NOT modify the exported `base.require()` / `baseLite.require()` or their backing `createRequire`/`standardRequire` — they are intentionally dynamic (path-based JSON, `uuid`/`express`, `@sap/cds-dk` global-npm fallback).
- Do NOT hand-edit `mcp-server/build/` — regenerate from `src/`.
- Do NOT touch the sqlite/tar/generic-pool/@cap-js/@sap-cloud-sdk esbuild externals.
- All user-facing strings use `base.bundle.getText(...)` — no new hardcoded strings introduced.
- Work on branch `esm-modernization` (already created). Commit per task.

---

### Task 1: Baseline verification

**Files:** none (verification only)

- [ ] **Step 1: Confirm branch and clean tree**

Run: `git status && git branch --show-current`
Expected: on `esm-modernization`, only the committed spec present.

- [ ] **Step 2: Establish green baseline**

Run: `npm test`
Expected: PASS (record the passing count for comparison).

- [ ] **Step 3: Establish lint baseline**

Run: `npm run lint`
Expected: PASS (0 errors).

---

### Task 2: Convert `@sap/textbundle` to static import in base-lite.js

**Files:**
- Modify: `utils/base-lite.js` (lines ~8, ~86)

**Interfaces:**
- Produces: unchanged public exports (`bundle`, `require`, etc.). `TextBundle` is now imported statically.

- [ ] **Step 1: Add the static import and replace the require**

In `utils/base-lite.js`, replace line 86:
```js
const TextBundle = require('@sap/textbundle').TextBundle
```
with a top-of-file static import. Add near the other imports (after line 5's `import`s):
```js
import { TextBundle } from '@sap/textbundle'
```
and delete the old line 86 entirely.

Note: `export const require = createRequire(import.meta.url)` (line ~10) and its `createRequire` import STAY — they remain the public dynamic-require API.

- [ ] **Step 2: Run tests**

Run: `npm run test:utils`
Expected: PASS (base-lite is exercised by utility tests).

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add utils/base-lite.js
git commit -m "refactor: static import @sap/textbundle in base-lite"
```

---

### Task 3: Convert `@sap/textbundle` to static import in base.js

**Files:**
- Modify: `utils/base.js` (line ~125)

**Interfaces:**
- Produces: unchanged exports. `standardRequire` and exported `require()` retained.

- [ ] **Step 1: Replace the require with a static import**

In `utils/base.js`, replace line ~125:
```js
const TextBundle = require('@sap/textbundle').TextBundle
```
with a static import added alongside the other top imports:
```js
import { TextBundle } from '@sap/textbundle'
```
and delete the old line ~125.

Keep `import { createRequire } from 'module'` and `const standardRequire = createRequire(import.meta.url)` — they back the exported `require()`.

- [ ] **Step 2: Run tests**

Run: `npm run test:utils`
Expected: PASS.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add utils/base.js
git commit -m "refactor: static import @sap/textbundle in base"
```

---

### Task 4: Convert terminal-kit to lazy Proxy in base.js

**Files:**
- Modify: `utils/base.js` (remove line ~300 `import terminalKit`, rework lines ~282–340)

**Interfaces:**
- Produces: `export const terminal` — a synchronous object exposing `.table(...)` and `.progressBar(...)`. Consumed synchronously by `utils/massConvert.js`, `utils/massExport.js`, `utils/massDelete.js`, `utils/massGrant.js` (all inside `async` functions) and internally by `base.js` table rendering.

- [ ] **Step 1: Write a failing test for lazy terminal access**

Create `tests/utils/terminalLazy.Test.js`:
```js
// @ts-check
import { assert } from '../../utils/base.js'
import * as base from '../../utils/base.js'

describe('terminal lazy access', () => {
  it('exposes a synchronous terminal object with table and progressBar', () => {
    assert.strictEqual(typeof base.terminal, 'object')
    assert.strictEqual(typeof base.terminal.table, 'function')
    assert.strictEqual(typeof base.terminal.progressBar, 'function')
  })

  it('progressBar returns a controller with startItem/itemDone/stop', () => {
    const bar = base.terminal.progressBar({ title: 'test', percent: false })
    assert.strictEqual(typeof bar.startItem, 'function')
    assert.strictEqual(typeof bar.itemDone, 'function')
    assert.strictEqual(typeof bar.stop, 'function')
    bar.stop()
  })
})
```

- [ ] **Step 2: Run it to confirm current behavior**

Run: `npx mocha tests/utils/terminalLazy.Test.js`
Expected: PASS today (eager import already provides this) — this test locks in the contract we must preserve after refactor.

- [ ] **Step 3: Remove the eager import and implement the lazy Proxy**

In `utils/base.js`:
1. Delete line ~300: `import terminalKit from 'terminal-kit'`.
2. Replace the terminal init block (lines ~302–340, the `let _terminal` / try-catch / `export const terminal`) with a lazy Proxy. Keep the existing `getTerminalKit()` lazy loader (lines ~282–290) as the underlying loader. New block:

```js
// Console-based fallback used in test mode and before/if terminal-kit loads.
const consoleTerminalStub = {
    table: (data) => {
        if (data && Array.isArray(data) && data.length > 0) {
            console.table(data)
        }
    },
    progressBar: () => ({
        startItem: () => {},
        itemDone: () => {},
        stop: () => {}
    })
}

// Cached real terminal-kit terminal (loaded lazily on first use).
let _realTerminal = null
let _terminalKitLoadFailed = false

function loadRealTerminalSync() {
    if (_realTerminal || _terminalKitLoadFailed) return _realTerminal
    if (process.env.NODE_ENV === 'test') return null
    try {
        // standardRequire is CJS-synchronous and works in the CLI (has
        // node_modules). In the bundled extension terminal-kit is never
        // reached because the extension does not render terminal output;
        // the Proxy falls back to the console stub.
        _realTerminal = standardRequire('terminal-kit').terminal
    } catch (error) {
        _terminalKitLoadFailed = true
        console.warn(bundle.getText("warning.terminalKitInitFail", [error.message]))
    }
    return _realTerminal
}

// Synchronous facade: forwards to real terminal-kit when available,
// otherwise to the console stub. No eager terminal-kit load at module init.
export const terminal = new Proxy({}, {
    get(_target, prop) {
        const real = loadRealTerminalSync()
        const impl = real || consoleTerminalStub
        const value = impl[prop]
        return typeof value === 'function' ? value.bind(impl) : value
    }
})
```

Note: this uses `standardRequire('terminal-kit')` (the existing CJS require) so `base.terminal` stays synchronous with zero call-site changes. In the extension bundle, `standardRequire` is `createRequire`-based and terminal-kit is simply never accessed (no terminal rendering), so it never loads. This keeps the source free of a static/top-level terminal-kit import — which is what lets esbuild avoid pulling it into the load-time graph.

- [ ] **Step 4: Run the lazy test + full utils suite**

Run: `npx mocha tests/utils/terminalLazy.Test.js && npm run test:utils`
Expected: PASS.

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: PASS (no unused `terminalKit` binding remains).

- [ ] **Step 6: Commit**

```bash
git add utils/base.js tests/utils/terminalLazy.Test.js
git commit -m "refactor: lazy terminal-kit access via Proxy, drop eager import"
```

---

### Task 5: Modernize versionCheck.js (require → import + JSON attribute)

**Files:**
- Modify: `utils/versionCheck.js`

**Interfaces:**
- Consumes: `check-node-version` default export; `../package.json` via import attribute.
- Produces: unchanged `checkVersion()` export.

- [ ] **Step 1: Rewrite the imports and JSON load**

Replace the top of `utils/versionCheck.js`:
```js
// @ts-check
import * as base from './base.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const check = require('check-node-version')
import chalk from 'chalk'
```
with:
```js
// @ts-check
import * as base from './base.js'
import check from 'check-node-version'
import chalk from 'chalk'
import pkg from '../package.json' with { type: 'json' }
```

Then replace the JSON read inside `checkVersion()`:
```js
const version = require("../package.json").engines.node
```
with:
```js
const version = pkg.engines.node
```

- [ ] **Step 2: Run tests**

Run: `npm run test:utils`
Expected: PASS.

- [ ] **Step 3: Smoke-check the version gate**

Run: `node bin/cli.js version`
Expected: prints version info without a MODULE_NOT_FOUND or import-attribute error.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add utils/versionCheck.js
git commit -m "refactor: static import check-node-version + JSON import attribute"
```

---

### Task 6: `__dirname`/`__filename` sweep — utils/

**Files:**
- Modify: `utils/base.js:8`, `utils/base-lite.js:8`, `utils/config-loader.js:11`

**Transformation rules (apply per site):**
- Variant A: `const __dirname = fileURLToPath(new URL('.', import.meta.url))` → `const __dirname = import.meta.dirname`
- After replacing, remove now-unused imports (`import { fileURLToPath } from 'url'`, `import { URL } from 'url'`) **only if** `fileURLToPath`/`URL` are not used elsewhere in that file.

- [ ] **Step 1: base.js**

In `utils/base.js`, replace line 8:
```js
const __dirname = fileURLToPath(new URL('.', import.meta.url))
```
with:
```js
const __dirname = import.meta.dirname
```
Then remove lines 6–7 (`import { fileURLToPath } from 'url'` and `import { URL } from 'url'`) — verify with `grep -n "fileURLToPath\|\bURL\b" utils/base.js` that neither is used elsewhere first; if `URL` IS used elsewhere, keep only that import.

- [ ] **Step 2: base-lite.js**

In `utils/base-lite.js`, replace line 8 the same way, then remove the now-unused `fileURLToPath`/`URL` imports (verify usage first with grep).

- [ ] **Step 3: config-loader.js**

In `utils/config-loader.js`, replace line 11 the same way; remove unused `fileURLToPath`/`URL` imports (verify first).

- [ ] **Step 4: Run tests + lint**

Run: `npm run test:utils && npm run lint`
Expected: PASS (lint catches any leftover unused import).

- [ ] **Step 5: Commit**

```bash
git add utils/base.js utils/base-lite.js utils/config-loader.js
git commit -m "refactor: import.meta.dirname in utils/"
```

---

### Task 7: `__dirname`/`__filename` sweep — routes/

**Files:**
- Modify: `routes/docs.js:9`, `routes/static.js:9`, `routes/swagger.js:9-10`

**Transformation rules:**
- Variant A (docs.js, static.js): `const __dirname = fileURLToPath(new URL('.', import.meta.url))` → `const __dirname = import.meta.dirname`
- Variant B (swagger.js): `const __filename = fileURLToPath(import.meta.url)` + `const __dirname = dirname(__filename)` → `const __dirname = import.meta.dirname` (drop the `__filename` line; keep `join` import, drop `dirname`/`fileURLToPath` if unused).

- [ ] **Step 1: docs.js and static.js**

Replace line 9 in each with `const __dirname = import.meta.dirname`; remove unused `fileURLToPath`/`URL` imports (verify with grep per file).

- [ ] **Step 2: swagger.js**

In `routes/swagger.js`, replace lines 9–10:
```js
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
```
with:
```js
const __dirname = import.meta.dirname
```
Then update imports: `import { dirname, join } from 'path'` → `import { join } from 'path'`, and remove `import { fileURLToPath } from 'url'` (verify `fileURLToPath`/`dirname` unused elsewhere first). `__dirname` is still used at line ~13 (`readFileSync(join(__dirname, '../package.json'))`) — keep `join`.

- [ ] **Step 3: Run tests + lint**

Run: `npm run test:routes && npm run lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add routes/docs.js routes/static.js routes/swagger.js
git commit -m "refactor: import.meta.dirname in routes/"
```

---

### Task 8: `__dirname`/`__filename` sweep — bin/

**Files:**
- Modify: `bin/changeLog.js:7`, `bin/examples.js:8`, `bin/interactive.js:10`, `bin/kb.js:8`, `bin/readMe.js:20`, `bin/version.js:73`, `bin/viewDocs.js:10`, `bin/mcpServerInstall.js:9-10`, `bin/mcpServerStatus.js:9-10`, `bin/vscode.js:9-10`

**Transformation rules:**
- Variant A: `const __dirname = fileURLToPath(new URL('.', import.meta.url))` → `const __dirname = import.meta.dirname`
- Variant C: `const __dirname = dirname(fileURLToPath(import.meta.url))` → `const __dirname = import.meta.dirname`
- Variant B: `const __filename = fileURLToPath(import.meta.url)` + `const __dirname = dirname(__filename)` → `const __dirname = import.meta.dirname`
- Per file: after replacing, drop `fileURLToPath` and (if now unused) `dirname` from imports; KEEP `join`/`resolve` where still used. Verify each with grep before removing.

- [ ] **Step 1: Variant A files (changeLog.js:7, readMe.js:20, version.js:73)**

Replace each site with `const __dirname = import.meta.dirname`. Note `readMe.js` and `version.js` have the shim inside a function body (indented) — preserve indentation. Remove unused `fileURLToPath`/`URL` imports (verify per file).

- [ ] **Step 2: Variant C files (examples.js:8, interactive.js:10, kb.js:8, viewDocs.js:10)**

Replace each `const __dirname = dirname(fileURLToPath(import.meta.url))` with `const __dirname = import.meta.dirname`. Update the `path` import to drop `dirname` if unused (e.g. `import { dirname, join } from 'path'` → `import { join } from 'path'`); remove `fileURLToPath` import if unused. Verify per file with `grep -n "dirname\|fileURLToPath" bin/<file>.js`.

- [ ] **Step 3: Variant B files (mcpServerInstall.js:9-10, mcpServerStatus.js:9-10, vscode.js:9-10)**

In each, replace:
```js
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
```
with:
```js
const __dirname = import.meta.dirname
```
Update imports: drop `fileURLToPath` from `'url'` import; drop `dirname` from the `'path'` import but keep `join`/`resolve` (both used in these files). Verify `__filename` is not referenced elsewhere (grep confirmed it is only used to derive `__dirname` in these three).

- [ ] **Step 4: Run tests + lint**

Run: `npm run test:cli && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add bin/changeLog.js bin/examples.js bin/interactive.js bin/kb.js bin/readMe.js bin/version.js bin/viewDocs.js bin/mcpServerInstall.js bin/mcpServerStatus.js bin/vscode.js
git commit -m "refactor: import.meta.dirname in bin/"
```

---

### Task 9: `__dirname`/`__filename` sweep — scripts/ and tests/

**Files:**
- Modify (scripts, Variant A/C/D): `scripts/add-epilogue-final.js:12`, `scripts/enhance-command-docs.js:11`, `scripts/generate-command-docs.js:11`, `scripts/generate-sidebar-config.js:10`, `scripts/generate-sidebar-config-fixed.js:11`, `scripts/populate-command-docs.js:11`, `scripts/test-context-implementation.js:11`, `scripts/update-epilogues.js:12`, `scripts/validate-i18n.js:24` (pattern `path.dirname(fileURLToPath(import.meta.url))`)
- Modify (scripts, `__filename`): `scripts/build-docs-index.js:18`, `scripts/extract-release-notes.js:7`, `scripts/generate-agent-instructions.js:27`, `scripts/install-agent-instructions.js:21`, `scripts/postinstall.js:8-9`, `scripts/prepare-release.js:8-9`, `scripts/run-test-output.js:8`
- Modify (tests): `tests/appFactory.js:13`, `tests/platformSupport.Test.js:8`, `tests/routes/docs.Test.js:13`, `tests/utils/profileIntegration.Test.js:15`

**Transformation rules:**
- `const __dirname = path.dirname(fileURLToPath(import.meta.url))` → `const __dirname = import.meta.dirname` (keep `import path from 'path'` if `path` used elsewhere; drop `fileURLToPath` if unused).
- `const __dirname = fileURLToPath(new URL('.', import.meta.url))` → `const __dirname = import.meta.dirname`.
- `const __filename = fileURLToPath(import.meta.url)` standalone → `const __filename = import.meta.filename` (only if `__filename` is actually used; if it derives `__dirname` on the next line, collapse to `const __dirname = import.meta.dirname`).
- IMPORTANT exceptions in `tests/platformSupport.Test.js`: line 8 is Variant A (`__dirname`) — convert. Line 238 `const currentFile = fileURLToPath(import.meta.url)` is a **separate** use assigned to `currentFile` — convert to `const currentFile = import.meta.filename`. Do NOT remove the `fileURLToPath` import unless BOTH are gone.

- [ ] **Step 1: scripts/ `path.dirname(...)` variant**

For each of the 9 listed scripts, replace the shim line with `const __dirname = import.meta.dirname`. Keep `import path from 'path'` where `path.*` is used elsewhere; remove `fileURLToPath` import if unused (verify per file with `grep -n "fileURLToPath\|path\." scripts/<file>.js`).

- [ ] **Step 2: scripts/ `__filename` variant**

For `build-docs-index.js`, `extract-release-notes.js`, `generate-agent-instructions.js`, `install-agent-instructions.js`, `run-test-output.js`: if `__filename` derives `__dirname`, collapse to `const __dirname = import.meta.dirname`; if `__filename` is used standalone (e.g. `import.meta.url === ...` main-guard), use `const __filename = import.meta.filename`. For `postinstall.js:8-9` and `prepare-release.js:8-9` (Variant B), collapse both lines to `const __dirname = import.meta.dirname`, keep `join`, drop `dirname`/`fileURLToPath` if unused. Verify each with grep.

- [ ] **Step 3: tests/ files**

`tests/appFactory.js:13`, `tests/routes/docs.Test.js:13`: Variant A → `import.meta.dirname`. `tests/utils/profileIntegration.Test.js:15`: `__filename` → `import.meta.filename` (or collapse if it derives `__dirname`). `tests/platformSupport.Test.js`: line 8 → `import.meta.dirname`, line 238 `currentFile` → `import.meta.filename`; remove `fileURLToPath` import only if both uses are gone.

- [ ] **Step 4: Run full test suite + lint**

Run: `npm test && npm run lint`
Expected: PASS (scripts aren't unit-tested but must not break import resolution; lint validates them).

- [ ] **Step 5: Sanity-run one script**

Run: `npm run validate:i18n`
Expected: runs (validates i18n) without a `__dirname`/import error.

- [ ] **Step 6: Commit**

```bash
git add scripts/ tests/
git commit -m "refactor: import.meta.dirname/filename in scripts/ and tests/"
```

---

### Task 10: Modernize mcp-server/src/*.ts and regenerate build/

**Files:**
- Modify: `mcp-server/src/command-metadata.ts:6,10`, `mcp-server/src/docs-search.ts:12-13`, `mcp-server/src/executor.ts:9-10`, `mcp-server/src/index.ts:38-39`, `mcp-server/src/readme-knowledge-base.ts:12-13`, `mcp-server/src/resources.ts:15-16`
- Regenerate: `mcp-server/build/*` (via build script)

**Interfaces:**
- `command-metadata.ts`: the `require = createRequire(import.meta.url)` — inspect what it loads. If it loads a static local module/JSON, convert to static `import`; if dynamic, retain (same rule as base.js). Verify before changing.

- [ ] **Step 1: Inspect command-metadata.ts require usage**

Run: `grep -n "require(" mcp-server/src/command-metadata.ts`
Decision: if it requires a static path (e.g. `../commandMetadata.js` or a JSON), convert to `import` / import-attribute. If it requires a dynamic/computed path, KEEP `createRequire` (document why in a comment). Apply accordingly.

- [ ] **Step 2: Convert `__filename`/`__dirname` shims in the 5 TS files**

In `docs-search.ts`, `executor.ts`, `index.ts`, `readme-knowledge-base.ts`, `resources.ts`, replace:
```ts
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```
with:
```ts
const __dirname = import.meta.dirname;
```
Update imports: drop `fileURLToPath` from `'node:url'`/`'url'`; drop `dirname` from `'node:path'`/`'path'` if unused, keep `join`/`readFileSync` etc. Verify each with grep. `__dirname` remains used by `join(__dirname, ...)` calls in all five.

- [ ] **Step 3: Find and run the mcp-server build**

Run: `cat mcp-server/package.json | grep -A20 '"scripts"'` to find the build command (e.g. `npm run build` in mcp-server, or a root `types`/build task). Then run it to regenerate `mcp-server/build/`.
Expected: TypeScript compiles with no errors; `build/` regenerated.

- [ ] **Step 4: Verify build output modernized**

Run: `grep -rn "createRequire\|fileURLToPath(import.meta.url)" mcp-server/build/ | grep -v "retained"`
Expected: only intentionally-retained dynamic `createRequire` (if any from Step 1) remains.

- [ ] **Step 5: MCP smoke test**

Run: `node mcp-server/build/index.js --help 2>&1 | head` (or the project's MCP smoke command)
Expected: starts / prints usage without a module-resolution error.

- [ ] **Step 6: Commit**

```bash
git add mcp-server/src/ mcp-server/build/
git commit -m "refactor: import.meta.dirname in mcp-server, regenerate build"
```

---

### Task 11: Delete esbuild workarounds

**Files:**
- Modify: `vscode-extension/esbuild.config.mjs` (remove `bundleTextBundlePlugin`, `stubTerminalKitPlugin`, the `'terminal-kit'` external entry, and the two plugin references in the `plugins` array)

- [ ] **Step 1: Remove the two plugin definitions**

In `vscode-extension/esbuild.config.mjs`, delete the entire `bundleTextBundlePlugin` block and the entire `stubTerminalKitPlugin` block (including their leading comment blocks).

- [ ] **Step 2: Remove terminal-kit from externals**

In the `external: [...]` array, remove the `'terminal-kit'` entry (and its comment if present). Leave `sqlite3`, `better-sqlite3`, `generic-pool`, `@cap-js/cds-test`, `@sap-cloud-sdk/*`, `tar` untouched.

- [ ] **Step 3: Remove the plugin references**

Change:
```js
plugins: [resolveRoutesPlugin, stripCLIBootstrapPlugin, dynamicImportPlugin, bundleTextBundlePlugin, stubTerminalKitPlugin],
```
to:
```js
plugins: [resolveRoutesPlugin, stripCLIBootstrapPlugin, dynamicImportPlugin],
```

- [ ] **Step 4: Rebuild the bundle**

Run: `cd vscode-extension && npm run bundle 2>&1 | tail -20`
Expected: build succeeds. Watch for a `terminal-kit` parse error (the original reason it was external). **If it errors on terminal-kit's README/parse:** re-add `'terminal-kit'` to `external` ONLY (keep both plugins deleted) and rebuild — the lazy Proxy's console fallback keeps the extension working. Document this outcome in the commit message.

- [ ] **Step 5: Verify no textbundle/terminal-kit runtime require leaked in**

Run (from `vscode-extension/`): `grep -oE '[A-Za-z_$][A-Za-z0-9_$]*\("@sap/textbundle"\)' dist/extension.js | sort -u`
Expected: empty (bundled, not a runtime require).

- [ ] **Step 6: Commit**

```bash
git add vscode-extension/esbuild.config.mjs vscode-extension/dist/
git commit -m "build: remove esbuild textbundle/terminal-kit workarounds"
```

---

### Task 12: End-to-end extension verification (critical)

**Files:** none (verification + repackage)

- [ ] **Step 1: In-place load probe from a clean dir**

Run:
```bash
cd vscode-extension
TMP=$(mktemp -d)
cp dist/extension.js "$TMP/extension.js"
mkdir -p "$TMP/_i18n" && cp ../_i18n/messages.properties "$TMP/_i18n/" 2>/dev/null || true
cat > "$TMP/probe.cjs" <<'EOF'
const Module = require('module')
const stub = new Proxy({}, { get: () => new Proxy(function(){}, { get: ()=>()=>{}, apply: ()=>({ appendLine(){}, show(){}, dispose(){}, createOutputChannel(){return{appendLine(){},show(){},dispose(){}}} }) }) })
const o = Module._load
Module._load = function(r){ if(r==='vscode') return stub; return o.apply(this, arguments) }
const ext = require('./extension.js')
console.error('activate exported?', typeof ext.activate === 'function')
EOF
cd "$TMP" && node probe.cjs; echo "EXIT: $?"; rm -rf "$TMP"
```
Expected: `activate exported? true`, EXIT 0. (The `_i18n` copy mirrors the .vsix layout; if the probe still logs an i18n ENOENT it is a probe-fixture issue, not a load failure — the require chain completing is what matters.)

- [ ] **Step 2: Repackage the .vsix**

Run: `cd vscode-extension && npx vsce package 2>&1 | tail -3`
Expected: `Packaged: ...hana-cli-0.1.0.vsix`.

- [ ] **Step 3: Reinstall**

Run: `node bin/cli.js vscode uninstall; node bin/cli.js vscode install`
Expected: uninstalled then installed successfully.

- [ ] **Step 4: Manual reload confirmation**

Reload the VS Code window (Command Palette → Developer: Reload Window). Confirm:
- Developer: Show Running Extensions → hana-cli **Activated** (not "Activating…").
- View → Output → "hana-cli" channel exists with "activated successfully".
- A `hana-cli.*` command (e.g. HANA: Open hana-cli Tools) runs.

- [ ] **Step 5: Commit any repackage artifacts**

```bash
git add vscode-extension/hana-cli-0.1.0.vsix
git commit -m "build: repackage extension .vsix after ESM modernization"
```

---

### Task 13: Update .github/instructions docs

**Files:**
- Modify: `.github/instructions/automation-script-development.instructions.md`, `.github/instructions/scripts-directory-development.instructions.md` (and any other instruction files whose examples show `fileURLToPath(import.meta.url)` / `createRequire`)

- [ ] **Step 1: Find all instruction examples using the legacy patterns**

Run: `grep -rn "fileURLToPath(import.meta.url)\|fileURLToPath(new URL\|createRequire" .github/instructions/`
Expected: a list of doc code-block sites.

- [ ] **Step 2: Update each example to the modern pattern**

Replace `const __filename = fileURLToPath(import.meta.url)` / `const __dirname = path.dirname(fileURLToPath(import.meta.url))` with `const __dirname = import.meta.dirname` (and `import.meta.filename` where a filename is shown). Add a one-line note where helpful: `// Node 20.11+: import.meta.dirname / import.meta.filename`. For any `createRequire` example that demonstrates loading a static package, show a static `import` instead; keep `createRequire` only where the example is specifically about dynamic resolution.

- [ ] **Step 3: Verify no stale legacy examples remain**

Run: `grep -rn "fileURLToPath" .github/instructions/`
Expected: empty (or only intentional references discussing the old pattern historically).

- [ ] **Step 4: Commit**

```bash
git add .github/instructions/
git commit -m "docs: modernize import.meta.dirname examples in instructions"
```

---

### Task 14: Final full verification

**Files:** none

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: PASS, count ≥ Task 1 baseline.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: PASS, 0 errors.

- [ ] **Step 3: Confirm no unintended createRequire/shims remain in scoped code**

Run:
```bash
grep -rn "fileURLToPath" bin/ routes/ utils/ scripts/ tests/ | grep -v node_modules
grep -rn "createRequire" utils/ | grep -vE "base\.js|base-lite\.js"
```
Expected: first returns only intentionally-kept `fileURLToPath` (if any documented); second returns nothing (only base.js/base-lite.js retain `createRequire` for the exported dynamic `require()`).

- [ ] **Step 4: CLI smoke across the touched surfaces**

Run:
```bash
node bin/cli.js version
node bin/cli.js vscode status
```
Expected: both run without module/import errors.

- [ ] **Step 5: Update stale Node baseline in CLAUDE.md (housekeeping)**

In project `CLAUDE.md`, the overview says "Node.js ≥20.19.0" — update to "Node.js ≥22" to match `package.json` engines.

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: correct Node baseline to >=22 in CLAUDE.md"
```

---

## Self-Review Notes

- **Spec coverage:** Category 1 → Tasks 2,3,5. Category 2 (terminal-kit) → Task 4. Category 3 (shims) → Tasks 6–9. MCP → Task 10. esbuild cleanup → Task 11. Extension verify → Task 12. Docs → Task 13. Final → Task 14. All spec sections covered.
- **Retained-by-design:** exported `base.require()`/`baseLite.require()` and their `createRequire`/`standardRequire` are explicitly kept (Tasks 3, 6 notes; Task 14 Step 3 asserts this).
- **terminal-kit contingency:** Task 11 Step 4 documents the fallback (re-add to `external`) if the README-parse issue resurfaces.
- **Type/name consistency:** `terminal` export contract locked by the Task 4 test; `import.meta.dirname`/`import.meta.filename` names used consistently.
