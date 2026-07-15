import * as fs from 'fs'
import * as path from 'path'

/**
 * HANA runtime object names consist of letters, digits, underscores, dots
 * (schema qualifier — already stripped by normalization) and the `::`
 * namespace separator. Anything else (quotes, angle brackets, semicolons,
 * whitespace) is rejected so a crafted design-time file cannot inject content
 * into the webview route/inline script that consumes the resolved name.
 */
const SAFE_IDENTIFIER = /^[A-Za-z0-9_.:]+$/

/** Remove any character outside the safe identifier grammar. */
function stripUnsafe(value: string): string {
  return value.replace(/[^A-Za-z0-9_.:]/g, '')
}

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
  // Only trust a parsed name if it is a safe HANA identifier. A malicious file
  // (e.g. `TABLE x';alert(1)//`) would otherwise flow into the webview route.
  if (parsed && SAFE_IDENTIFIER.test(parsed)) {
    return parsed
  }
  return fallbackName(fsPath)
}

/** Dispatch to the parser for the given artifact kind. */
function parseByKind(content: string, kind: string): string | undefined {
  switch (kind) {
    case 'table':
      // Anchor to a line start so the word "table" in prose can't false-match.
      // Real HDI DDL begins the statement at a line (optionally after comments).
      return matchDdl(content, /^\s*(?:COLUMN\s+|ROW\s+)?TABLE\s+([^\s(]+)/im)
    case 'view':
      return matchDdl(content, /^\s*VIEW\s+([^\s(]+)\s+AS\b/im)
    case 'procedure':
      return matchDdl(content, /^\s*PROCEDURE\s+([^\s(]+)/im)
    case 'function':
      return matchDdl(content, /^\s*FUNCTION\s+([^\s(]+)/im)
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
      if (typeof obj.name === 'string') return normalizeJsonName(obj.name)
      // Fall through to top-level key if no explicit name
      return parseJsonObjectName(trimmed)
    } catch {
      return undefined
    }
  }
  return matchDdl(content, /^\s*SEQUENCE\s+([^\s(]+)/im)
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
      return normalizeJsonName(val.name)
    }
    return normalizeJsonName(topKey)
  } catch {
    return undefined
  }
}

/**
 * Normalize a name authored in an HDI JSON config (synonym/role/sequence).
 * These are literal object names, NOT SQL DDL identifiers, so their case is
 * preserved as authored (HANA does not apply unquoted-identifier folding).
 * Only the object portion is kept if the value is dot-qualified.
 */
function normalizeJsonName(raw: string): string {
  const id = raw.trim()
  const segments = id.split('.')
  const last = segments[segments.length - 1]
  return last.replace(/^"(.*)"$/, '$1')
}

/**
 * Normalize a raw identifier token to the name HANA actually deployed.
 *
 * Takes the last dot-qualified segment (object name, not schema) and applies
 * SQL identifier folding: an UNQUOTED identifier is folded to UPPERCASE (HANA's
 * default), while a double-QUOTED identifier keeps its authored case. CAP emits
 * unquoted names, so the common case uppercases (e.g. `star_wars_eyeColors` ->
 * `STAR_WARS_EYECOLORS`). Verified against a live HDI container.
 */
function normalizeIdentifier(raw: string): string {
  const id = raw.trim().replace(/;$/, '')
  // Split on dots to drop a schema qualifier; keep the last segment.
  // Handles both `name` and `"schema"."name"` forms.
  const segments = id.split('.')
  const last = segments[segments.length - 1]
  // A quoted segment preserves case; an unquoted one folds to uppercase.
  const quoted = /^".*"$/.test(last)
  const unquoted = last.replace(/^"(.*)"$/, '$1')
  return quoted ? unquoted : unquoted.toUpperCase()
}

/**
 * Filename naming rule: strip the extension, replace '.' with '_', and prepend
 * the nearest ancestor .hdinamespace `name` (as `<name>::`) when non-empty.
 */
function fallbackName(fsPath: string): string {
  const base = path.basename(fsPath)
  const dot = base.lastIndexOf('.')
  const stem = dot > 0 ? base.substring(0, dot) : base
  // The design-time filename maps to an UNQUOTED SQL identifier: replace '.'
  // with '_' per HDI naming, strip anything outside the safe grammar, then
  // fold to uppercase to match how HANA deploys unquoted names.
  const runtime = stripUnsafe(stem.replace(/\./g, '_')).toUpperCase()
  // The namespace prefix is case-sensitive as authored (reverse-DNS style);
  // only the local object name folds. So prepend it verbatim.
  const ns = readNamespace(path.dirname(fsPath))
  return ns ? `${ns}::${runtime}` : runtime
}

/**
 * Walk up from `dir` looking for a .hdinamespace with a non-empty name.
 * The returned prefix is validated against the safe identifier grammar; an
 * unsafe namespace value is ignored (returns undefined) rather than trusted.
 */
function readNamespace(dir: string): string | undefined {
  let current = dir
  // Bound the walk to avoid infinite loops at filesystem root.
  for (let i = 0; i < 50; i++) {
    const candidate = path.join(current, '.hdinamespace')
    try {
      const raw = fs.readFileSync(candidate, 'utf8')
      const obj = JSON.parse(raw)
      if (typeof obj.name === 'string' && obj.name.length > 0) {
        return SAFE_IDENTIFIER.test(obj.name) ? obj.name : undefined
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
