import { useGlobalSettings } from './useGlobalSettings'

export function useHanaApi() {
  const { getApiParams } = useGlobalSettings()

  async function execute<T = any>(command: string, params: Record<string, any> = {}): Promise<T> {
    const merged = { ...getApiParams(), ...params }
    if (Object.keys(merged).length > 0) {
      await fetch('/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      })
    }
    const res = await fetch(`/hana/${command}`)
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`)
    }
    return res.json()
  }

  async function fetchDirect<T = any>(path: string): Promise<T> {
    const res = await fetch(path)
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`)
    }
    return res.json()
  }

  return { execute, fetchDirect }
}
