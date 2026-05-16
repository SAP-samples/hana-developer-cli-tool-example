import { ref, type Ref } from 'vue'

interface SuggestionCache {
  key: string
  items: string[]
}

const cache: SuggestionCache[] = []

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
      if (Object.keys(params).length > 0) {
        await fetch('/', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        })
      }
      const res = await fetch(`/hana/${endpoint}`)
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
