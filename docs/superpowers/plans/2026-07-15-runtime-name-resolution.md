# Runtime Name Resolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the correct runtime (deployed) HANA object name from an HDI design-time file so the VSCode extension's artifact inspectors pre-fill a name HANA can actually find.

**Architecture:** A new pure, synchronous, extension-side resolver (`resolveRuntimeName`) reads the design-time file and extracts the runtime name from its DDL/JSON content (case preserved). On any failure it falls back to a filename naming rule (strip extension → dots→underscores → optional `.hdinamespace` prefix). `artifactInspector.ts` calls it in place of the current extension-strip logic.

**Tech Stack:** TypeScript (NodeNext ESM), VSCode extension API, Mocha + node `assert`, `@vscode/test-electron`.

## Global Constraints

- Language: TypeScript, `module`/`moduleResolution` = **NodeNext** — all relative imports MUST use the `.js` extension (e.g. `import { resolveRuntimeName } from './runtimeName.js'`).
- Target: ES2022. Source lives in `vscode-extension/src/`, compiles to `out/`.
- Tests: Mocha BDD (`suite`/`test`), node `assert`, files named `*.test.ts` under `vscode-extension/test/suite/`. Test harness globs `**/*.test.js` in `out/test/`.
- The resolver MUST be pure and synchronous and MUST NOT throw — every failure path returns the fallback name.
- Names are injected **verbatim** — never upper/lowercase the result (HANA matches case-sensitively).
- Run tests from `vscode-extension/` with: `npm test` (runs `pretest` compile then the electron harness).
- Per project memory: bump the extension version before repackaging the `.vsix`, and package via `npm run package` (never `vsce package --no-dependencies`). Packaging is out of scope for this plan.

---

## File Structure

- **Create** `vscode-extension/src/editors/runtimeName.ts` — the resolver: public `resolveRuntimeName(fsPath, kind)`, per-kind parsers, identifier normalization, and the filename fallback rule. One responsibility: turn a design-time file into a runtime object name.
- **Modify** `vscode-extension/src/editors/artifactInspector.ts` — replace the extension-strip logic (lines 77–80) with a call to `resolveRuntimeName`.
- **Create** `vscode-extension/test/suite/runtimeName.test.ts` — unit tests for the resolver (parse paths, normalization, fallback).

---

## Task 1: Resolver module with parse + fallback

**Files:**
- Create: `vscode-extension/src/editors/runtimeName.ts`
- Test: `vscode-extension/test/suite/runtimeName.test.ts`

**Interfaces:**
- Consumes: node `fs`, `path` only.
- Produces: `export function resolveRuntimeName(fsPath: string, kind: string): string` — returns the runtime object name (case preserved), never throws. `kind` is one of `'table' | 'view' | 'procedure' | 'function' | 'synonym' | 'role' | 'sequence'`; any other value uses the fallback rule.

- [ ] **Step 1: Write the failing tests**

Create `vscode-extension/test/suite/runtimeName.test.ts`:

```ts
import * as assert from 'assert'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { resolveRuntimeName } from '../../src/editors/runtimeName.js'

suite('resolveRuntimeName', () => {
  let tempDir: string

  suiteSetup(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hana-cli-rtn-'))
  })

  suiteTeardown(() => {
    if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true })
  })

  // Helper: write a fixture file and resolve it
  const resolve = (filename: string, content: string, kind: string): string => {
    const p = path.join(tempDir, filename)
    fs.writeFileSync(p, content)
    return resolveRuntimeName(p, kind)
  }

  // --- Parse path, one per kind ---

  test('table: COLUMN TABLE', () => {
    const name = resolve(
      'cds.outbox.Messages.hdbtable',
      'COLUMN TABLE cds_outbox_Messages (\n  ID NVARCHAR(36) NOT NULL,\n  PRIMARY KEY(ID)\n)',
      'table'
    )
    assert.strictEqual(name, 'cds_outbox_Messages')
  })

  test('table: ROW TABLE', () => {
    const name = resolve(
      'my.Row.hdbtable',
      'ROW TABLE my_Row (ID INTEGER)',
      'table'
    )
    assert.strictEqual(name, 'my_Row')
  })

  test('view: VIEW ... AS SELECT', () => {
    const name = resolve(
      'star.wars.Order.hdbview',
      'VIEW star_wars_CloneWarsChronologicalOrder AS SELECT\n  Episode_0.ID\nFROM x',
      'view'
    )
    assert.strictEqual(name, 'star_wars_CloneWarsChronologicalOrder')
  })

  test('procedure: PROCEDURE', () => {
    const name = resolve(
      'my.Proc.hdbprocedure',
      'PROCEDURE my_Proc (IN a INTEGER) AS BEGIN END',
      'procedure'
    )
    assert.strictEqual(name, 'my_Proc')
  })

  test('function: FUNCTION', () => {
    const name = resolve(
      'my.Func.hdbfunction',
      'FUNCTION my_Func (IN a INTEGER) RETURNS INTEGER AS BEGIN END',
      'function'
    )
    assert.strictEqual(name, 'my_Func')
  })

  test('sequence: DDL SEQUENCE', () => {
    const name = resolve(
      'my.Seq.hdbsequence',
      'SEQUENCE my_Seq START WITH 1 INCREMENT BY 1',
      'sequence'
    )
    assert.strictEqual(name, 'my_Seq')
  })

  test('sequence: JSON form', () => {
    const name = resolve(
      'my.Seq.hdbsequence',
      '{ "name": "my_Seq", "start_with": 1 }',
      'sequence'
    )
    assert.strictEqual(name, 'my_Seq')
  })

  test('synonym: JSON top-level key', () => {
    const name = resolve(
      'my.Syn.hdbsynonym',
      '{ "my_Syn": { "target": { "object": "FOO", "schema": "BAR" } } }',
      'synonym'
    )
    assert.strictEqual(name, 'my_Syn')
  })

  test('role: JSON top-level key', () => {
    const name = resolve(
      'my.Role.hdbrole',
      '{ "role": { "name": "my_Role" } }',
      'role'
    )
    // top-level key is "role" -> its .name field is the object name
    assert.strictEqual(name, 'my_Role')
  })

  // --- Normalization ---

  test('quoted identifier: quotes stripped, case preserved', () => {
    const name = resolve(
      'q.hdbtable',
      'COLUMN TABLE "cds_outbox_Messages" (ID INTEGER)',
      'table'
    )
    assert.strictEqual(name, 'cds_outbox_Messages')
  })

  test('schema-qualified DDL: last dot segment', () => {
    const name = resolve(
      'q.hdbtable',
      'COLUMN TABLE "MYSCHEMA"."cds_outbox_Messages" (ID INTEGER)',
      'table'
    )
    assert.strictEqual(name, 'cds_outbox_Messages')
  })

  test('mixed case preserved', () => {
    const name = resolve(
      'q.hdbtable',
      'COLUMN TABLE MixedCase_Table (ID INTEGER)',
      'table'
    )
    assert.strictEqual(name, 'MixedCase_Table')
  })

  // --- Fallback rule ---

  test('fallback: empty file uses filename naming rule', () => {
    const name = resolve('cds.outbox.Messages.hdbtable', '', 'table')
    assert.strictEqual(name, 'cds_outbox_Messages')
  })

  test('fallback: unknown kind uses filename naming rule', () => {
    const name = resolve('a.b.C.hdbxyz', 'whatever', 'mystery')
    assert.strictEqual(name, 'a_b_C')
  })

  test('fallback: unparseable content uses filename naming rule', () => {
    const name = resolve('a.b.C.hdbtable', 'not a table definition', 'table')
    assert.strictEqual(name, 'a_b_C')
  })

  test('fallback: missing file uses filename naming rule (no throw)', () => {
    const p = path.join(tempDir, 'does.not.Exist.hdbtable')
    const name = resolveRuntimeName(p, 'table')
    assert.strictEqual(name, 'does_not_Exist')
  })

  test('fallback: .hdinamespace name is prepended', () => {
    const nsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hana-cli-ns-'))
    fs.writeFileSync(path.join(nsDir, '.hdinamespace'), '{ "name": "com.acme", "subfolder": "ignore" }')
    const p = path.join(nsDir, 'a.b.hdbtable')
    fs.writeFileSync(p, '') // empty -> fallback
    const name = resolveRuntimeName(p, 'table')
    fs.rmSync(nsDir, { recursive: true, force: true })
    assert.strictEqual(name, 'com.acme::a_b')
  })

  test('fallback: empty .hdinamespace name adds no prefix', () => {
    const nsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hana-cli-ns2-'))
    fs.writeFileSync(path.join(nsDir, '.hdinamespace'), '{ "name": "", "subfolder": "ignore" }')
    const p = path.join(nsDir, 'a.b.hdbtable')
    fs.writeFileSync(p, '')
    const name = resolveRuntimeName(p, 'table')
    fs.rmSync(nsDir, { recursive: true, force: true })
    assert.strictEqual(name, 'a_b')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd vscode-extension && npm test`
Expected: FAIL — compile/runtime error `Cannot find module '../../src/editors/runtimeName.js'` (module does not exist yet).

- [ ] **Step 3: Write the resolver implementation**

Create `vscode-extension/src/editors/runtimeName.ts`:

```ts
import * as fs from 'fs'
import * as path from 'path'

/**
 * Resolve the runtime (deployed) HANA object name for an HDI design-time file.
 *
 * Reads the file and extracts the name from its DDL/JSON content (case
 * preserved). Falls back to a filename naming rule if the content cannot be
 * parsed, the kind is unknown, or the file cannot be read. Never throws.
 *
 * @param fsPath absolute path to the design-time file
 * @param kind   artifact kind: 'table' | 'view' | 'procedure' | 'function' |
 *               'synonym' | 'role' | 'sequence'
 * @returns the runtime object name, verbatim (no case change)
 */
export function resolveRuntimeName(fsPath: string, kind: string): string {
  let content: string | undefined
  try {
    content = fs.readFileSync(fsPath, 'utf8')
  } catch {
    return fallbackName(fsPath)
  }

  const parsed = parseByKind(content, kind)
  if (parsed && parsed.trim().length > 0) {
    return parsed
  }
  return fallbackName(fsPath)
}

/** Dispatch to the parser for the given artifact kind. */
function parseByKind(content: string, kind: string): string | undefined {
  switch (kind) {
    case 'table':
      return matchDdl(content, /\b(?:COLUMN\s+|ROW\s+)?TABLE\s+([^\s(]+)/i)
    case 'view':
      return matchDdl(content, /\bVIEW\s+([^\s(]+)\s+AS\b/i)
    case 'procedure':
      return matchDdl(content, /\bPROCEDURE\s+([^\s(]+)/i)
    case 'function':
      return matchDdl(content, /\bFUNCTION\s+([^\s(]+)/i)
    case 'sequence':
      return parseSequence(content)
    case 'synonym':
    case 'role':
      return parseJsonObjectName(content)
    default:
      return undefined
  }
}

/** Extract and normalize an identifier captured by a DDL regex. */
function matchDdl(content: string, re: RegExp): string | undefined {
  const m = content.match(re)
  if (!m) return undefined
  return normalizeIdentifier(m[1])
}

/** Sequences may be JSON ({ "name": ... }) or DDL (SEQUENCE <name>). */
function parseSequence(content: string): string | undefined {
  const trimmed = content.trim()
  if (trimmed.startsWith('{')) {
    try {
      const obj = JSON.parse(trimmed)
      if (typeof obj.name === 'string') return normalizeIdentifier(obj.name)
      // Fall through to top-level key if no explicit name
      return parseJsonObjectName(trimmed)
    } catch {
      return undefined
    }
  }
  return matchDdl(content, /\bSEQUENCE\s+([^\s(]+)/i)
}

/**
 * For synonym/role JSON files: the object's own name is the single top-level
 * key. If that key's value carries an explicit `.name`, prefer it.
 */
function parseJsonObjectName(content: string): string | undefined {
  try {
    const obj = JSON.parse(content)
    const keys = Object.keys(obj)
    if (keys.length === 0) return undefined
    const topKey = keys[0]
    const val = obj[topKey]
    if (val && typeof val === 'object' && typeof val.name === 'string') {
      return normalizeIdentifier(val.name)
    }
    return normalizeIdentifier(topKey)
  } catch {
    return undefined
  }
}

/**
 * Normalize a raw identifier token: strip surrounding double-quotes, take the
 * last dot-qualified segment (object name, not schema), preserve inner case
 * and any `::` namespace separator.
 */
function normalizeIdentifier(raw: string): string {
  let id = raw.trim().replace(/;$/, '')
  // Split on unquoted dots to drop a schema qualifier; keep the last segment.
  // Handle both name and "schema"."name" forms.
  const segments = id.split('.')
  let last = segments[segments.length - 1]
  // Strip surrounding double quotes.
  last = last.replace(/^"(.*)"$/, '$1')
  return last
}

/**
 * Filename naming rule: strip the extension, replace '.' with '_', and prepend
 * the nearest ancestor .hdinamespace `name` (as `<name>::`) when non-empty.
 */
function fallbackName(fsPath: string): string {
  const base = path.basename(fsPath)
  const dot = base.lastIndexOf('.')
  const stem = dot > 0 ? base.substring(0, dot) : base
  const runtime = stem.replace(/\./g, '_')
  const ns = readNamespace(path.dirname(fsPath))
  return ns ? `${ns}::${runtime}` : runtime
}

/** Walk up from `dir` looking for a .hdinamespace with a non-empty name. */
function readNamespace(dir: string): string | undefined {
  let current = dir
  // Bound the walk to avoid infinite loops at filesystem root.
  for (let i = 0; i < 50; i++) {
    const candidate = path.join(current, '.hdinamespace')
    try {
      const raw = fs.readFileSync(candidate, 'utf8')
      const obj = JSON.parse(raw)
      if (typeof obj.name === 'string' && obj.name.length > 0) {
        return obj.name
      }
      return undefined // found the file; empty name means no prefix
    } catch {
      // not here; keep walking up
    }
    const parent = path.dirname(current)
    if (parent === current) break
    current = parent
  }
  return undefined
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd vscode-extension && npm test`
Expected: PASS — all `resolveRuntimeName` tests green.

- [ ] **Step 5: Commit**

```bash
git add vscode-extension/src/editors/runtimeName.ts vscode-extension/test/suite/runtimeName.test.ts
git commit -m "feat(vscode): add resolveRuntimeName for design-time to runtime object names"
```

---

## Task 2: Wire resolver into the artifact inspector

**Files:**
- Modify: `vscode-extension/src/editors/artifactInspector.ts:77-80`

**Interfaces:**
- Consumes: `resolveRuntimeName(fsPath: string, kind: string): string` from Task 1. Each `ArtifactConfig` already carries a `kind` field (`this._config.kind`).
- Produces: no new exports; the injected `name` in `resolveCustomEditor` now holds the runtime name.

- [ ] **Step 1: Add the import**

At the top of `vscode-extension/src/editors/artifactInspector.ts`, alongside the existing imports, add:

```ts
import { resolveRuntimeName } from './runtimeName.js'
```

- [ ] **Step 2: Replace the extension-strip logic**

In `resolveCustomEditor`, replace these lines (currently ~77–80):

```ts
    // Parse artifact name from the filename (strip extension)
    const filename = path.basename(document.uri.fsPath)
    const dotIndex = filename.lastIndexOf('.')
    const name = dotIndex > 0 ? filename.substring(0, dotIndex) : filename
```

with:

```ts
    // Resolve the runtime (deployed) object name from the design-time file.
    // The filename is the design-time name (e.g. cds.outbox.Messages.hdbtable);
    // HANA knows the runtime name (e.g. cds_outbox_Messages), matched
    // case-sensitively. resolveRuntimeName reads the file content to get it.
    const name = resolveRuntimeName(document.uri.fsPath, this._config.kind)
```

- [ ] **Step 3: Verify the `path` import is still used**

Run: `cd vscode-extension && npx tsc -p tsconfig.test.json --noEmit`
Expected: PASS — no "unused import" or "cannot find name" errors. (`path` remains imported; if the compiler flags it as unused because no other usage exists, remove the `import * as path` line. Check first with: `grep -n "path\." src/editors/artifactInspector.ts` — if only the removed block used it, drop the import.)

- [ ] **Step 4: Run the full extension test suite**

Run: `cd vscode-extension && npm test`
Expected: PASS — existing tests plus Task 1 tests all green; no regressions in `calcViewEditor.test.ts` / `extension.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add vscode-extension/src/editors/artifactInspector.ts
git commit -m "fix(vscode): inject runtime object name into artifact inspectors"
```

---

## Task 3: End-to-end verification against a real design-time file

**Files:** none (verification only).

- [ ] **Step 1: Confirm the resolver returns the runtime name for the reported case**

Run from `vscode-extension/`:

```bash
node --input-type=module -e "
import { resolveRuntimeName } from './out/editors/runtimeName.js';
const p = 'D:/projects/cloud-cap-hana-swapi/cap/gen/db/src/gen/cds.outbox.Messages.hdbtable';
console.log(resolveRuntimeName(p, 'table'));
"
```

Expected output: `cds_outbox_Messages`

(If `out/editors/runtimeName.js` does not exist, run `npm run compile` first. On non-Windows or if that path is absent, substitute any local `*.hdbtable` file whose DDL contains a `TABLE` statement and confirm the printed name matches the DDL, not the filename.)

- [ ] **Step 2: Confirm the view case**

```bash
node --input-type=module -e "
import { resolveRuntimeName } from './out/editors/runtimeName.js';
const p = 'D:/projects/cloud-cap-hana-swapi/cap/gen/db/src/gen/star.wars.CloneWarsChronologicalOrder.hdbview';
console.log(resolveRuntimeName(p, 'view'));
"
```

Expected output: `star_wars_CloneWarsChronologicalOrder`

- [ ] **Step 3: Record verification result**

No commit. Report both outputs. If either mismatches, return to Task 1 and adjust the relevant parser regex.

---

## Self-Review

**Spec coverage:**
- Parse file content per kind → Task 1 `parseByKind` + tests (table/view/procedure/function/synonym/role/sequence). ✓
- Case preserved / injected verbatim → `normalizeIdentifier` does not change case; test "mixed case preserved". ✓
- Naming-rule fallback (dots→underscores, `.hdinamespace` prefix) → `fallbackName` + `readNamespace`; fallback tests. ✓
- Namespace handled by parse path; `.hdinamespace` only for fallback → parsers return fully-qualified DDL name; `readNamespace` only called in `fallbackName`. ✓
- Never throws → try/catch around read, JSON parse, and namespace walk; test "missing file … no throw". ✓
- Integration point at `artifactInspector.ts:77-80` → Task 2. ✓
- Scope excludes calc view editor → not modified. ✓
- Schema-qualified DDL takes last segment; JSON `::` kept → `normalizeIdentifier` splits on `.` only; test "schema-qualified DDL". ✓

**Placeholder scan:** No TBD/TODO; all code steps contain full code; commands have expected output. ✓

**Type consistency:** `resolveRuntimeName(fsPath: string, kind: string): string` used identically in Task 1 (definition), Task 2 (call), Task 3 (verification). ✓
