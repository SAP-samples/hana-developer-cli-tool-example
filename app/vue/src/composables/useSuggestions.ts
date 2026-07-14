import { ref, type Ref } from 'vue'
import { getAdapter } from '../adapters/environment'

interface SuggestionCache {
  key: string
  items: string[]
}

const cache: SuggestionCache[] = []

/**
 * Resolve the API base URL from the active environment adapter.
 * In the browser this is window.location.origin; in the VS Code webview it is
 * the http://localhost:<port> the extension server listens on. Relative URLs
 * would resolve against the vscode-webview:// origin and never reach the
 * server, so all fetches must be absolute.
 */
function baseUrl(): string {
  try {
    return getAdapter().getApiBaseUrl()
  } catch {
    return ''
  }
}

export function useSuggestions(endpoint: string, nameField: string) {
  const items: Ref<string[]> = ref([])
  let loaded = false

  async function load(params: Record<string, any> = {}) {
    const cacheKey = `${endpoint}:${params.schema || ''}`
    const cached = cache.find(c => c.key === cacheKey)
    if (cached) {
      items.value = cached.items
      loaded = true
      return
    }

    try {
      const api = baseUrl()
      if (Object.keys(params).length > 0) {
        await fetch(`${api}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        })
      }
      const res = await fetch(`${api}/hana/${endpoint}`)
      if (!res.ok) return

      const data = await res.json()
      const names: string[] = Array.isArray(data)
        ? data.map((row: any) => row[nameField]).filter(Boolean)
        : []

      items.value = names
      cache.push({ key: cacheKey, items: names })
      loaded = true
    } catch {
      // Silently fail — suggestions are optional
    }
  }

  function ensureLoaded(params: Record<string, any> = {}) {
    if (!loaded) load(params)
  }

  function reload(params: Record<string, any> = {}) {
    loaded = false
    const cacheKey = `${endpoint}:${params.schema || ''}`
    const idx = cache.findIndex(c => c.key === cacheKey)
    if (idx >= 0) cache.splice(idx, 1)
    load(params)
  }

  return { items, load, ensureLoaded, reload }
}
