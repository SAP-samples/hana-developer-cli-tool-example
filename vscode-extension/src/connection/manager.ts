import * as vscode from 'vscode'
import type { HanaConnection } from './resolver.js'

const STORAGE_KEY = 'hana-cli.connections'

/**
 * Manages HANA connections stored in VSCode SecretStorage.
 * Provides CRUD operations for named connections.
 */
export class ConnectionManager {
  constructor(private secrets: vscode.SecretStorage) {}

  async getAll(): Promise<Record<string, HanaConnection>> {
    const raw = await this.secrets.get(STORAGE_KEY)
    if (!raw) return {}
    try {
      return JSON.parse(raw) as Record<string, HanaConnection>
    } catch {
      return {}
    }
  }

  async save(name: string, conn: HanaConnection): Promise<void> {
    const all = await this.getAll()
    all[name] = conn
    await this.secrets.store(STORAGE_KEY, JSON.stringify(all))
  }

  async remove(name: string): Promise<void> {
    const all = await this.getAll()
    delete all[name]
    await this.secrets.store(STORAGE_KEY, JSON.stringify(all))
  }
}
