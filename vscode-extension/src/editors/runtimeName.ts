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
      if (typeof obj.name === 'string') return normalizeIdentifier(obj.name)
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
  const id = raw.trim().replace(/;$/, '')
  // Split on dots to drop a schema qualifier; keep the last segment.
  // Handles both `name` and `"schema"."name"` forms.
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
