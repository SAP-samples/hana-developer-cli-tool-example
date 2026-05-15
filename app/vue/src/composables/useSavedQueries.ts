import { ref } from 'vue'

export interface SavedQuery {
  id: string
  name: string
  sql: string
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'hana-cli-saved-queries'

function loadFromStorage(): SavedQuery[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

const queries = ref<SavedQuery[]>(loadFromStorage())

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queries.value))
}

export function useSavedQueries() {
  function save(name: string, sql: string): SavedQuery {
    const entry: SavedQuery = {
      id: crypto.randomUUID(),
      name,
      sql,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    queries.value.unshift(entry)
    persist()
    return entry
  }

  function update(id: string, changes: Partial<Pick<SavedQuery, 'name' | 'sql'>>) {
    const q = queries.value.find(item => item.id === id)
    if (q) {
      if (changes.name !== undefined) q.name = changes.name
      if (changes.sql !== undefined) q.sql = changes.sql
      q.updatedAt = Date.now()
      persist()
    }
  }

  function remove(id: string) {
    queries.value = queries.value.filter(q => q.id !== id)
    persist()
  }

  return { queries, save, update, remove }
}
