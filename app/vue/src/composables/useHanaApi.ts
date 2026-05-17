import { getAdapter } from '../adapters/environment'
import { useGlobalSettings } from './useGlobalSettings'

function baseUrl(): string {
  try {
    return getAdapter().getApiBaseUrl()
  } catch {
    return ''
  }
}

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json()
    if (body.message) return body.message
  } catch {
    try {
      const text = await res.text()
      if (text) return text
    } catch { /* fall through */ }
  }
  return `${res.status} ${res.statusText}`
}

export function useHanaApi() {
  const { getApiParams } = useGlobalSettings()

  async function execute<T = any>(command: string, params: Record<string, any> = {}): Promise<T> {
    const merged = { ...getApiParams(), ...params }
    await fetch(`${baseUrl()}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged)
    })
    const res = await fetch(`${baseUrl()}/hana/${command}`)
    if (!res.ok) {
      const detail = await extractErrorMessage(res)
      throw new Error(detail)
    }
    return res.json()
  }

  async function fetchDirect<T = any>(path: string): Promise<T> {
    const res = await fetch(`${baseUrl()}${path}`)
    if (!res.ok) {
      const detail = await extractErrorMessage(res)
      throw new Error(detail)
    }
    return res.json()
  }

  return { execute, fetchDirect }
}
