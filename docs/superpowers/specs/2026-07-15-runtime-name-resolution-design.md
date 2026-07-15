# Design: Design-time → Runtime Name Resolution for Artifact Inspectors

**Date:** 2026-07-15
**Component:** VSCode extension (`vscode-extension/`)
**Status:** Approved

## Problem

When a user opens an HDI design-time file in a hana-cli custom editor (e.g.
`cds.outbox.Messages.hdbtable`), the artifact inspector injects the file's
**design-time** name into the inspect input field. HANA does not know that
name, so the lookup fails with "Invalid Input Table."

The design-time name and the runtime object name differ:

| Design-time (filename)         | Runtime (deployed object) |
| ------------------------------ | ------------------------- |
| `cds.outbox.Messages.hdbtable` | `cds_outbox_Messages`     |
| `star.wars.X.hdbview`          | `star_wars_X`             |

Today, [`artifactInspector.ts`](../../../vscode-extension/src/editors/artifactInspector.ts)
(lines 78–80) strips only the file extension:

```ts
const filename = path.basename(document.uri.fsPath)
const dotIndex = filename.lastIndexOf('.')
const name = dotIndex > 0 ? filename.substring(0, dotIndex) : filename
```

For `cds.outbox.Messages.hdbtable` this yields `cds.outbox.Messages`, which is
then injected verbatim via a route query param
(`/inspect-table?table=cds.outbox.Messages`).

### Why the lookup fails

1. **Dot → underscore transformation.** CAP/HDI replaces `.` with `_` in the
   deployed object name. The file contains the real name in its DDL, e.g.
   `COLUMN TABLE cds_outbox_Messages (...)`.
2. **Case sensitivity.** The backend matches names **exactly and
   case-sensitively** — see
   [`dbInspect.js`](../../../utils/dbInspect.js) `getTable`, which queries
   `SYS.TABLES` with `AND TABLE_NAME = ?` (not `LIKE`, not uppercased). HDI
   deploys objects with quoted, mixed-case identifiers
   (`cds_outbox_Messages`), so any casing change breaks the match.

## Goal

For every connected artifact inspector editor, inject the correct **runtime**
object name — preserving exact case — so the inspect lookup succeeds without
the user editing the field manually.

## Scope

**In scope** — the artifact kinds registered in `ARTIFACT_CONFIGS`
([`artifactInspector.ts`](../../../vscode-extension/src/editors/artifactInspector.ts)
lines 14–22):

| Kind      | File pattern(s)                    | Route              |
| --------- | ---------------------------------- | ------------------ |
| table     | `.hdbtable`, `.hdbmigrationtable`  | `/inspect-table`   |
| view      | `.hdbview`                         | `/inspect-view`    |
| procedure | `.hdbprocedure`                    | `/call-procedure`  |
| function  | `.hdbfunction`                     | `/inspect-function`|
| synonym   | `.hdbsynonym`                      | `/inspect-table`   |
| role      | `.hdbrole`                         | `/inspect-table`   |
| sequence  | `.hdbsequence`                     | `/inspect-table`   |

**Out of scope**

- `calcViewEditor.ts` — the `.hdbcalculationview` editor is a separate provider
  with its own XML handling; not touched by this change.
- Server (`routes/`), CLI, and Vue view changes — the resolution is entirely
  extension-side.

## Approach

A new extension-side resolver module reads the design-time file and extracts
the runtime name from its DDL/content. This is authoritative: it uses the exact
name the deployer wrote, preserving case and any namespace prefix. If parsing
fails, it falls back to a filename-based naming rule.

**Decisions confirmed during brainstorming:**

- **Translation source:** parse file content (not a naming rule alone, not a
  live DB lookup).
- **Fallback:** naming-rule fallback (strip extension, dots→underscores, apply
  `.hdinamespace` prefix) when parsing fails — always inject a best-effort name.
- **Namespace:** handled by the parse path automatically (DDL is already fully
  qualified); `.hdinamespace` is only read for the fallback rule.
- **Location:** extension-side resolver module (TypeScript), unit-testable in
  the extension test suite; no server round-trip.

## Component: `resolveRuntimeName`

New file: `vscode-extension/src/editors/runtimeName.ts`

```ts
/**
 * Resolve the runtime (deployed) object name for an HDI design-time file.
 * Reads the file content and extracts the name from its DDL/JSON; falls back
 * to a filename-based naming rule if parsing fails. Never throws.
 *
 * @param fsPath absolute path to the design-time file
 * @param kind   artifact kind from ArtifactConfig ('table' | 'view' | ...)
 * @returns the runtime object name, case preserved
 */
export function resolveRuntimeName(fsPath: string, kind: string): string
```

### Per-kind parsers

Matched by the `kind` value already present on each `ArtifactConfig`. All
parsers operate on the file's text content (read synchronously; these files are
small).

| Kind      | Content type | Extraction rule                                        |
| --------- | ------------ | ------------------------------------------------------ |
| table     | DDL          | first match of `(?:COLUMN\|ROW)?\s*TABLE\s+<ident>`     |
| view      | DDL          | `VIEW\s+<ident>\s+AS`                                   |
| function  | DDL          | `FUNCTION\s+<ident>`                                    |
| procedure | DDL          | `PROCEDURE\s+<ident>`                                   |
| sequence  | DDL or JSON  | detect: JSON → top-level name key; else `SEQUENCE\s+<ident>` |
| synonym   | JSON         | top-level object key (the synonym's own name)          |
| role      | JSON         | top-level object key (the role's own name)             |

Where `<ident>` is either a bare identifier (`cds_outbox_Messages`) or a
double-quoted identifier (`"cds_outbox_Messages"`), optionally schema-qualified
(`schema.name`, `"schema"."name"`).

### Identifier normalization

- Strip surrounding double-quotes but **preserve inner case**.
- For **DDL** names that are schema-qualified with a dot (`schema.name`,
  `"schema"."name"`), take the **last dot segment** (the object name); the
  schema is supplied separately by the inspector (defaults to
  `**CURRENT_SCHEMA**`).
- For **JSON** keys (synonym/role/sequence), use the key verbatim after
  quote-stripping. A `::` namespace separator is part of the runtime object
  name and is **kept** (not split), unlike a dot schema qualifier.
- Do **not** upper/lowercase the result — inject verbatim so it matches the
  quoted mixed-case identifier HDI deployed.

### Fallback rule

Triggered when: file read fails, content does not match the parser, the kind is
unknown, or the extracted name is empty.

1. Strip the file extension from the basename.
2. Replace `.` with `_`.
3. If an ancestor `.hdinamespace` file exists with a non-empty `name` field,
   prepend `<name>::`.

This mirrors HDI's own naming transformation and guarantees the field is always
populated with a reasonable guess (never worse than today's behavior).

## Integration

In [`artifactInspector.ts`](../../../vscode-extension/src/editors/artifactInspector.ts),
`resolveCustomEditor` replaces the extension-strip logic (lines 77–80) with:

```ts
const name = resolveRuntimeName(document.uri.fsPath, this._config.kind)
```

The remainder of the flow — building `routeWithName`, the webview content, the
message handlers — is unchanged. The resolved name flows through the existing
`queryKey` query param mechanism to the target Vue view.

## Error handling

- `resolveRuntimeName` never throws. All failure modes (I/O error, malformed
  content, unsupported kind) degrade to the fallback rule.
- No new user-facing error surface; the inspector continues to render, and a
  wrong guess is correctable by the user in the field as today.

## Testing

Unit tests in `vscode-extension/test/suite/` (e.g. `runtimeName.test.ts`),
using real DDL/JSON fixtures mirroring the samples observed in the
`cloud-cap-hana-swapi` project:

**Parse-path cases (one per kind):**

- table: `COLUMN TABLE cds_outbox_Messages (...)` → `cds_outbox_Messages`
- view: `VIEW star_wars_CloneWarsChronologicalOrder AS SELECT ...` →
  `star_wars_CloneWarsChronologicalOrder`
- function / procedure / sequence: analogous DDL snippets
- synonym / role: JSON with a single top-level name key

**Normalization cases:**

- quoted identifier: `TABLE "cds_outbox_Messages"` → unquoted, case preserved
- schema-qualified: `"MYSCHEMA"."cds_outbox_Messages"` → last segment
- mixed case preserved (no upper/lowercasing)

**Fallback cases:**

- empty file → naming rule
- unknown kind → naming rule
- unparseable content → naming rule
- `.hdinamespace` with non-empty `name` → `<name>::` prefix applied
- `.hdinamespace` empty / absent → no prefix

## Files changed

| File                                              | Change                          |
| ------------------------------------------------- | ------------------------------- |
| `vscode-extension/src/editors/runtimeName.ts`     | new — resolver + parsers        |
| `vscode-extension/src/editors/artifactInspector.ts` | use `resolveRuntimeName`      |
| `vscode-extension/test/suite/runtimeName.test.ts` | new — unit tests                |

Per project memory: bump the extension version before repackaging the `.vsix`,
and package via `npm run package` (not `vsce package --no-dependencies`).
