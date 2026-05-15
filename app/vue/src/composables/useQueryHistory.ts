import { ref, computed } from 'vue'

export interface HistoryEntry {
  id: string
  sql: string
  timestamp: number
  duration: number
  rowCount: number
  error?: string
  tabName: string
}

const STORAGE_KEY = 'hana-cli-query-history'
const MAX_ENTRIES = 500

function load(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function persist(items: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ENTRIES)))
}

const entries = ref<HistoryEntry[]>(load())

function addEntry(sql: string, duration: number, rowCount: number, tabName: string, error?: string) {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    sql: sql.trim(),
    timestamp: Date.now(),
    duration,
    rowCount,
    error,
    tabName
  }
  entries.value.unshift(entry)
  if (entries.value.length > MAX_ENTRIES) {
    entries.value = entries.value.slice(0, MAX_ENTRIES)
  }
  persist(entries.value)
}

function search(query: string): HistoryEntry[] {
  if (!query.trim()) return entries.value
  const lower = query.toLowerCase()
  return entries.value.filter(e => e.sql.toLowerCase().includes(lower))
}

function remove(id: string) {
  entries.value = entries.value.filter(e => e.id !== id)
  persist(entries.value)
}

function clearAll() {
  entries.value = []
  persist(entries.value)
}

export function useQueryHistory() {
  return { entries, addEntry, search, remove, clearAll }
}
