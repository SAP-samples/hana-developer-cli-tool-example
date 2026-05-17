import * as vscode from 'vscode'
import { execFile } from 'child_process'

const log = vscode.window.createOutputChannel('hana-cli resolver', { log: true })

export interface HanaConnection {
  host: string
  port: number
  user: string
  password: string
  useTLS: boolean
  schema: string
  instanceName?: string
  source: 'cap' | 'default-env' | 'secretStorage'
}

export type ResolveResult =
  | { status: 'connected'; connection: HanaConnection }
  | { status: 'cf-login-required'; instance: string }
  | { status: 'no-config' }

/**
 * Resolves a HANA connection from workspace files using a 3-step strategy:
 * 1. CAP: .cdsrc-private.json credentials or CF binding (if @sap/cds is a project dependency)
 * 2. Workspace: default-env.json VCAP_SERVICES
 * 3. Returns no-config (caller should fall back to SecretStorage)
 */
export async function resolveConnection(
  workspaceFolder: vscode.WorkspaceFolder
): Promise<ResolveResult> {
  log.info(`Resolving connection for workspace: ${workspaceFolder.uri.fsPath}`)

  const capResult = await resolveFromCAP(workspaceFolder)
  if (capResult.status !== 'no-config') {
    if (capResult.status === 'connected') {
      log.info(`Resolved via ${capResult.connection.source}: ${capResult.connection.user}@${capResult.connection.host}:${capResult.connection.port}`)
    }
    return capResult
  }

  const envConn = await resolveFromDefaultEnv(workspaceFolder)
  if (envConn) {
    log.info(`Resolved via default-env: ${envConn.user}@${envConn.host}:${envConn.port}`)
    return { status: 'connected', connection: envConn }
  }

  log.info('No connection resolved from workspace files')
  return { status: 'no-config' }
}

interface BindingOrCredentials {
  type: 'credentials' | 'binding'
  value: Record<string, unknown>
}

/**
 * Extracts the first available CDS binding or credentials from a parsed .cdsrc-private.json.
 * Mirrors the logic in utils/connections.js — checks [hybrid] profile first, then db, then all values.
 */
function extractCdsBindingOrCredentials(config: Record<string, unknown>): BindingOrCredentials | null {
  const requires = config?.requires as Record<string, unknown> | undefined
  if (!requires || typeof requires !== 'object') {
    return null
  }

  const candidates: unknown[] = []

  if (requires['[hybrid]']) {
    candidates.push(requires['[hybrid]'])
  }
  if (requires.db) {
    candidates.push(requires.db)
  }
  for (const value of Object.values(requires)) {
    if (value) {
      candidates.push(value)
    }
  }

  for (const candidate of candidates) {
    const cObj = candidate as Record<string, unknown>
    const dbSection = (cObj?.db || cObj) as Record<string, unknown>
    if (dbSection?.credentials) {
      return { type: 'credentials', value: dbSection.credentials as Record<string, unknown> }
    }
    if (dbSection?.binding) {
      return { type: 'binding', value: dbSection.binding as Record<string, unknown> }
    }
  }

  return null
}

function credsToConnection(creds: Record<string, unknown>, instanceName?: string): HanaConnection | null {
  if (!creds.host) return null
  return {
    host: creds.host as string,
    port: Number(creds.port) || 443,
    user: (creds.user || creds.hdi_user || '') as string,
    password: (creds.password || creds.hdi_password || '') as string,
    useTLS: creds.encrypt !== false,
    schema: (creds.schema || '') as string,
    instanceName,
    source: 'cap'
  }
}

/**
 * Unwrap credentials from various response formats.
 * `cds env` returns credentials at the top level.
 * `cf service-key` wraps them in {"credentials": {...}}.
 */
function unwrapCredentials(obj: Record<string, unknown>): Record<string, unknown> {
  if (obj.host) return obj
  if (obj.credentials && typeof obj.credentials === 'object') {
    return obj.credentials as Record<string, unknown>
  }
  return obj
}

/**
 * Resolves a CAP binding by using `cds env get requires.db.credentials --profile hybrid --resolve-bindings`.
 * This is the proper CAP-native approach — it handles all binding types (CF, K8s, etc.) internally.
 * Falls back to `cf service-key` if `cds env` is unavailable.
 */
function resolveCdsBinding(binding: Record<string, unknown>, cwd: string): Promise<Record<string, unknown> | null> {
  log.info(`Resolving binding via cds env (cwd: ${cwd})`)
  log.info(`Extension host PATH includes: ${(process.env.PATH || '').split(';').filter(p => /npm|node|cf/i.test(p)).join('; ')}`)

  return new Promise((resolve) => {
    execFile('cds', ['env', 'get', 'requires.db.credentials', '--profile', 'hybrid', '--resolve-bindings'],
      { cwd, timeout: 30000, shell: true }, (err, stdout, stderr) => {
      if (!err && stdout.trim()) {
        const jsonStart = stdout.indexOf('{')
        if (jsonStart !== -1) {
          try {
            const parsed = unwrapCredentials(JSON.parse(stdout.slice(jsonStart)))
            if (parsed && parsed.host) {
              log.info(`cds env resolved — host: ${parsed.host}`)
              resolve(parsed)
              return
            }
          } catch {
            log.info(`cds env output not parseable JSON, trying cf service-key fallback`)
          }
        }
      }
      if (err) {
        log.info(`cds env failed: ${err.message} — trying cf service-key fallback`)
      }

      // Fallback to cf service-key
      const instance = binding.instance as string | undefined
      const key = binding.key as string | undefined
      if (!instance || !key) {
        log.info('CF binding missing instance or key fields')
        resolve(null)
        return
      }

      log.info(`Resolving via: cf service-key "${instance}" "${key}"`)
      execFile('cf', ['service-key', instance, key], { cwd, timeout: 30000, shell: true }, (cfErr, cfStdout, cfStderr) => {
        if (cfErr) {
          log.error(`cf service-key failed: ${cfErr.message}`)
          if (cfStderr) log.error(`stderr: ${cfStderr}`)
          resolve(null)
          return
        }
        const jsonStart = cfStdout.indexOf('{')
        if (jsonStart === -1) {
          log.error(`cf service-key output has no JSON: ${cfStdout.slice(0, 200)}`)
          resolve(null)
          return
        }
        try {
          const parsed = unwrapCredentials(JSON.parse(cfStdout.slice(jsonStart)))
          log.info(`CF binding resolved — host: ${parsed.host}`)
          resolve(parsed)
        } catch (e) {
          log.error(`Failed to parse cf service-key JSON: ${e}`)
          resolve(null)
        }
      })
    })
  })
}

async function resolveFromCAP(
  workspaceFolder: vscode.WorkspaceFolder
): Promise<ResolveResult> {
  try {
    const packageJsonUri = vscode.Uri.joinPath(workspaceFolder.uri, 'package.json')
    const packageJsonData = await vscode.workspace.fs.readFile(packageJsonUri)
    const packageJson = JSON.parse(Buffer.from(packageJsonData).toString('utf-8'))

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
    if (!deps['@sap/cds'] && !deps['@sap/cds-dk']) {
      log.info('Not a CAP project (no @sap/cds dependency)')
      return { status: 'no-config' }
    }

    log.info('CAP project detected, looking for .cdsrc-private.json')
    const cdsrcUri = vscode.Uri.joinPath(workspaceFolder.uri, '.cdsrc-private.json')
    const cdsrcData = await vscode.workspace.fs.readFile(cdsrcUri)
    const cdsrc = JSON.parse(Buffer.from(cdsrcData).toString('utf-8'))

    const entry = extractCdsBindingOrCredentials(cdsrc)
    if (!entry) {
      log.info('No credentials or binding found in .cdsrc-private.json')
      return { status: 'no-config' }
    }

    log.info(`Found ${entry.type} in .cdsrc-private.json`)

    if (entry.type === 'credentials') {
      const conn = credsToConnection(entry.value)
      if (conn) return { status: 'connected', connection: conn }
      return { status: 'no-config' }
    }

    // Binding — resolve via cds env or cf service-key
    const instanceName = (entry.value.instance as string) || undefined
    const cwd = workspaceFolder.uri.fsPath
    const resolved = await resolveCdsBinding(entry.value, cwd)
    if (resolved) {
      const conn = credsToConnection(resolved, instanceName)
      if (conn) return { status: 'connected', connection: conn }
    }

    // We found the binding config but couldn't resolve it — CF likely not logged in
    const instance = instanceName || 'unknown'
    log.info(`CF binding found for instance "${instance}" but resolution failed — cf login likely required`)
    return { status: 'cf-login-required', instance }
  } catch (err) {
    log.error(`resolveFromCAP error: ${err}`)
    return { status: 'no-config' }
  }
}

async function resolveFromDefaultEnv(
  workspaceFolder: vscode.WorkspaceFolder
): Promise<HanaConnection | null> {
  try {
    const defaultEnvUri = vscode.Uri.joinPath(workspaceFolder.uri, 'default-env.json')
    const data = await vscode.workspace.fs.readFile(defaultEnvUri)
    const env = JSON.parse(Buffer.from(data).toString('utf-8'))

    const hanaServices = env?.VCAP_SERVICES?.hana ?? env?.VCAP_SERVICES?.['hana-cloud'] ?? []
    const creds = hanaServices[0]?.credentials
    if (!creds || !creds.host) {
      return null
    }

    return {
      host: creds.host,
      port: Number(creds.port) || 443,
      user: creds.user || creds.hdi_user || '',
      password: creds.password || creds.hdi_password || '',
      useTLS: creds.encrypt !== false,
      schema: creds.schema || '',
      source: 'default-env'
    }
  } catch {
    return null
  }
}
