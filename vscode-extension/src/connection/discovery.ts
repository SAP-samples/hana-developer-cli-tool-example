import * as fs from 'fs'
import * as path from 'path'

export type ConfigKind = 'cap' | 'cdsrc-private' | 'default-env' | 'default-env-admin'

export interface ConfigCandidate {
  /** Absolute path to the directory containing connection config. */
  dir: string
  /** Which config markers were found in this directory. */
  kinds: ConfigKind[]
  /** Directory depth relative to the scan root (root = 0). */
  depth: number
}

const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'out', 'gen', '.vscode'])

/**
 * Determine which connection-config markers exist directly inside `dir`.
 * A folder is a CAP project when it has a package.json that depends on
 * @sap/cds (or @sap/cds-dk). Credentials markers are .cdsrc-private.json,
 * default-env.json and default-env-admin.json.
 */
function classifyDir(dir: string): ConfigKind[] {
  const kinds: ConfigKind[] = []

  const pkgPath = path.join(dir, 'package.json')
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      const deps = { ...pkg.dependencies, ...pkg.devDependencies }
      if (deps['@sap/cds'] || deps['@sap/cds-dk']) {
        kinds.push('cap')
      }
    } catch {
      // Unparseable package.json — ignore, not a usable CAP marker
    }
  }

  if (fs.existsSync(path.join(dir, '.cdsrc-private.json'))) {
    kinds.push('cdsrc-private')
  }
  if (fs.existsSync(path.join(dir, 'default-env.json'))) {
    kinds.push('default-env')
  }
  if (fs.existsSync(path.join(dir, 'default-env-admin.json'))) {
    kinds.push('default-env-admin')
  }

  return kinds
}

/**
 * Recursively scan `rootDir` (bounded by `maxDepth`) for directories that
 * contain HANA connection configuration. Skips node_modules/.git/build output.
 * Results are sorted shallowest-first so the caller can prefer the closest
 * project to the workspace root.
 *
 * @param rootDir absolute path of the workspace folder to scan
 * @param maxDepth maximum directory depth to descend (root = 0)
 */
export function discoverConfigDirs(rootDir: string, maxDepth = 3): ConfigCandidate[] {
  const results: ConfigCandidate[] = []

  const walk = (dir: string, depth: number): void => {
    if (depth > maxDepth) return

    const kinds = classifyDir(dir)
    if (kinds.length > 0) {
      results.push({ dir, kinds, depth })
    }

    if (depth === maxDepth) return

    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (IGNORED_DIRS.has(entry.name)) continue
      if (entry.name.startsWith('.')) continue
      walk(path.join(dir, entry.name), depth + 1)
    }
  }

  walk(rootDir, 0)

  // Shallowest first; stable tiebreak by path for determinism.
  results.sort((a, b) => a.depth - b.depth || a.dir.localeCompare(b.dir))
  return results
}
