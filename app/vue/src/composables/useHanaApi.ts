export function useHanaApi() {
  async function execute<T = any>(command: string, params: Record<string, any> = {}): Promise<T> {
    if (Object.keys(params).length > 0) {
      await fetch('/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
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
