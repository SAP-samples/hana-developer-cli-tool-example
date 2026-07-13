# ESM Modernization: Retire CommonJS-Interop Shims — Design

**Date:** 2026-07-13
**Status:** Approved (design)
**Baseline:** Node ≥22 (per `package.json` engines; Node 24 recommended, aligned with CAP 10 rules)

## Background

While fixing a VS Code extension activation hang, we found the root cause was
`createRequire(import.meta.url)`-based requires of `@sap/textbundle` in
`utils/base.js` and `utils/base-lite.js`. esbuild does **not** trace
`createRequire()` requires into a bundle — it emits them as runtime
`require("@sap/textbundle")` calls resolved against the bundle's own location.
The installed `.vsix` ships no `node_modules`, so the require threw
`MODULE_NOT_FOUND` at module load, before `activate()` ran → the extension was
stuck "Activating…" and every `hana-cli.*` command reported "not found".

Two esbuild workarounds were added to unblock the extension:
- `bundleTextBundlePlugin` — rewrites the `@sap/textbundle` require into a
  static import so esbuild bundles it.
- `stubTerminalKitPlugin` — stubs the CLI-only `terminal-kit` (also loaded via
  a static import in `base.js`) out of the extension bundle.

These are band-aids over source-level legacy patterns. On a Node 22+ baseline
the underlying patterns can be replaced with stable built-ins, which lets us
delete both workarounds.

## Goal

Modernize CommonJS-interop legacy patterns to Node 22+ built-ins across the
codebase, and remove the two esbuild workarounds.

## Scope

### In scope

1. **Static package requires → static `import`**
   - `@sap/textbundle` in `utils/base.js` and `utils/base-lite.js`
   - `check-node-version` in `utils/versionCheck.js`
2. **`terminal-kit` → lazy Proxy** (Approach A): no static import; `base.terminal`
   stays a synchronous object via a lazy-initializing Proxy.
3. **`__dirname` / `__filename` shims → `import.meta.dirname` / `import.meta.filename`**
   across `utils/`, `bin/`, `routes/`, `scripts/`, `tests/` (~40 sites).
4. **MCP server** — modernize `mcp-server/src/*.ts`; regenerate `mcp-server/build/`.
5. **Docs** — update `.github/instructions/*.md` examples to teach the modern pattern.
6. **esbuild cleanup** — delete `bundleTextBundlePlugin` and `stubTerminalKitPlugin`;
   remove `terminal-kit` from the `external` list.

### Out of scope (stays as-is by design)

- **Exported `base.require()` / `baseLite.require()`** — genuinely dynamic:
  path-based JSON loads, dynamic `uuid`/`express` loads, and the `@sap/cds-dk`
  deep import with a global-npm (`npm root -g`) fallback. `createRequire` is the
  correct tool here. Consumers: `bin/cds.js`, `bin/cli.js`, `bin/createContainer.js`,
  `bin/createContainerUsers.js`, `bin/inspectTable.js`, `bin/inspectView.js`,
  `bin/version.js`, `utils/connections.js`. Only clarifying comments may change.
- **Hand-editing `mcp-server/build/`** — always regenerated from `src/`.
- **sqlite/tar/generic-pool/@cap-js/@sap-cloud-sdk externals** in esbuild — absent
  from `node_modules`, behind guarded requires, must remain `external`.

## Design

### Category 1 — Static package requires → `import`

| File | Change |
|---|---|
| `utils/base.js` | `@sap/textbundle` (line ~125) → `import { TextBundle } from '@sap/textbundle'`. **Keep** `createRequire` import + `standardRequire` — they back the exported `require()` (lines ~19, ~33). |
| `utils/base-lite.js` | `@sap/textbundle` (line ~86) → static import. **Keep** `export const require` (public API, used by `bin/version.js`). |
| `utils/versionCheck.js` | `check-node-version` → `import check from 'check-node-version'`; drop `createRequire`. `require("../package.json")` → `import pkg from '../package.json' with { type: 'json' }` (stable on Node 22). |

### Category 2 — `terminal-kit` lazy Proxy (Approach A)

`base.terminal` is consumed **synchronously as an object** —
`base.terminal.progressBar(...)` in `massConvert/massExport/massDelete/massGrant`
and `terminal.table(...)` internally. All such call sites are inside `async`
functions.

- Remove `import terminalKit from 'terminal-kit'` (`base.js` ~line 300).
- `base.terminal` becomes a `Proxy` that, on first property access, resolves a
  cached terminal-kit instance (via the existing lazy loader at `base.js`
  ~lines 282–290) and forwards `.table` / `.progressBar`.
- Test-mode (`NODE_ENV === 'test'`) and load-failure paths keep the existing
  console-based stub.
- **Zero call-site changes.** terminal-kit is never in the extension's
  load-time graph → the esbuild stub is unnecessary.

### Category 3 — `__dirname` / `__filename` shims

- `const __dirname = fileURLToPath(new URL('.', import.meta.url))` and
  `const __dirname = path.dirname(fileURLToPath(import.meta.url))`
  → `const __dirname = import.meta.dirname`.
- `const __filename = fileURLToPath(import.meta.url)` → `const __filename = import.meta.filename`.
- Keep the local `__dirname` / `__filename` names to minimize diff.
- Remove now-unused `fileURLToPath` / `URL` / `dirname` imports per file.

### esbuild cleanup (`vscode-extension/esbuild.config.mjs`)

- Delete `bundleTextBundlePlugin` (static import is now traced natively).
- Delete `stubTerminalKitPlugin`; remove `'terminal-kit'` from `external`.
- Keep `stripCLIBootstrapPlugin`, `dynamicImportPlugin`, `resolveRoutesPlugin`,
  and the sqlite/tar/etc. externals unchanged.
- **Contingency:** the original reason `terminal-kit` was `external` was a
  README-without-extension that esbuild couldn't parse. Since it is now only
  reached via `await import()` (lazy), verify it bundles cleanly. If the parse
  issue resurfaces, return `terminal-kit` to `external` — the lazy Proxy's
  console fallback still yields a working extension.

### MCP server

Modernize `mcp-server/src/command-metadata.ts`, `resources.ts`,
`readme-knowledge-base.ts`, `index.ts`, `executor.ts`, `docs-search.ts`
(`createRequire`, `__filename` shims) → `import.meta.dirname` / static import,
then run the TS build to regenerate `mcp-server/build/`.

## Testing & Verification

1. **Baseline:** `npm test` green before changes.
2. **Per-category:** `npm test` + `npm run lint` (catches unused imports) after
   each category. Commit per category for bisectability.
3. **Extension (critical):** rebuild the bundle, then run the in-place load
   probe from the installed extension dir (no `node_modules`) — must load with
   `activate` exported. Reload VS Code; confirm the "hana-cli" output channel
   appears with "activated successfully" and commands run.
4. **CLI smoke:** `hana-cli version`; a `--output table` command (exercises the
   terminal-kit lazy path); `hana-cli vscode status`.
5. **MCP:** build + a basic tool-list smoke check.

## Risks & Controls

- Work on a feature branch; commit per category.
- The exported `require()` and the sqlite/etc. externals are untouched by design.
- `import.meta.dirname` (Node 20.11+) and JSON import attributes (stable Node 22)
  are both safely above the ≥22 baseline.
- terminal-kit bundling contingency documented above.

## Success Criteria

- No `createRequire`-based **static** package requires remain (exported dynamic
  `require()` intentionally retained).
- No `fileURLToPath`-based `__dirname`/`__filename` shims remain in scoped code.
- Both esbuild workarounds deleted; extension activates from a clean `.vsix`.
- `npm test`, lint, extension load probe, CLI smoke, and MCP build all pass.
