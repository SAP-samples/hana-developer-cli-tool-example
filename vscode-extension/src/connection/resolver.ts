import * as vscode from 'vscode'

export interface HanaConnection {
  host: string
  port: number
  user: string
  password: string
  useTLS: boolean
  schema: string
  source: 'cap' | 'default-env' | 'secretStorage'
}

/**
 * Resolves a HANA connection from workspace files using a 3-step strategy:
 * 1. CAP: .cdsrc-private.json credentials (if @sap/cds is a project dependency)
 * 2. Workspace: default-env.json VCAP_SERVICES
 * 3. Returns null (caller should fall back to SecretStorage)
 */
export async function resolveConnection(
  workspaceFolder: vscode.WorkspaceFolder
): Promise<HanaConnection | null> {
  const conn = await resolveFromCAP(workspaceFolder) ?? await resolveFromDefaultEnv(workspaceFolder)
  return conn
}

async function resolveFromCAP(
  workspaceFolder: vscode.WorkspaceFolder
): Promise<HanaConnection | null> {
  try {
    // Check if this is a CAP project
    const packageJsonUri = vscode.Uri.joinPath(workspaceFolder.uri, 'package.json')
    const packageJsonData = await vscode.workspace.fs.readFile(packageJsonUri)
    const packageJson = JSON.parse(Buffer.from(packageJsonData).toString('utf-8'))

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
    if (!deps['@sap/cds'] && !deps['@sap/cds-dk']) {
      return null
    }

    // Parse .cdsrc-private.json for credentials
    const cdsrcUri = vscode.Uri.joinPath(workspaceFolder.uri, '.cdsrc-private.json')
    const cdsrcData = await vscode.workspace.fs.readFile(cdsrcUri)
    const cdsrc = JSON.parse(Buffer.from(cdsrcData).toString('utf-8'))

    const creds = cdsrc?.requires?.db?.credentials
      ?? cdsrc?.requires?.['hana']?.credentials
      ?? cdsrc?.requires?.db?.binding?.credentials
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
      source: 'cap'
    }
  } catch {
    // File not found or parse error — not a CAP project or no credentials
    return null
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
    // File not found or parse error
    return null
  }
}
