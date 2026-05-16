import { ref, computed } from 'vue'

export interface QueryTab {
  id: string
  name: string
  sql: string
  results: any[]
  error: string
  loading: boolean
  outputMode: 'table' | 'json' | 'plan' | 'diff'
}

const STORAGE_KEY = 'hana-cli-query-tabs'
const ACTIVE_KEY = 'hana-cli-active-tab'

function createTab(name?: string): QueryTab {
  return {
    id: crypto.randomUUID(),
    name: name || `Query ${Math.floor(Math.random() * 900) + 100}`,
    sql: 'SELECT TOP 100 * FROM M_SYSTEM_OVERVIEW',
    results: [],
    error: '',
    loading: false,
    outputMode: 'table'
  }
}

function loadTabs(): QueryTab[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return stored.map((t: any) => ({ ...t, loading: false }))
  } catch { return [] }
}

const tabs = ref<QueryTab[]>(loadTabs())
const activeTabId = ref(localStorage.getItem(ACTIVE_KEY) || '')

if (tabs.value.length === 0) {
  const initial = createTab('Query 1')
  tabs.value = [initial]
  activeTabId.value = initial.id
} else if (!tabs.value.find(t => t.id === activeTabId.value)) {
  activeTabId.value = tabs.value[0].id
}

function persist() {
  const serializable = tabs.value.map(t => ({
    ...t,
    loading: false,
    results: t.results.length > 1000 ? [] : t.results
  }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
  localStorage.setItem(ACTIVE_KEY, activeTabId.value)
}

export function useQueryTabs() {
  const activeTab = computed(() =>
    tabs.value.find(t => t.id === activeTabId.value) || tabs.value[0]
  )

  function addTab(name?: string): QueryTab {
    const tab = createTab(name)
    tabs.value.push(tab)
    activeTabId.value = tab.id
    persist()
    return tab
  }

  function closeTab(id: string) {
    if (tabs.value.length <= 1) return
    const idx = tabs.value.findIndex(t => t.id === id)
    tabs.value = tabs.value.filter(t => t.id !== id)
    if (activeTabId.value === id) {
      activeTabId.value = tabs.value[Math.max(0, idx - 1)].id
    }
    persist()
  }

  function selectTab(id: string) {
    activeTabId.value = id
    persist()
  }

  function renameTab(id: string, name: string) {
    const tab = tabs.value.find(t => t.id === id)
    if (tab) { tab.name = name; persist() }
  }

  function updateTab(id: string, changes: Partial<QueryTab>) {
    const tab = tabs.value.find(t => t.id === id)
    if (tab) { Object.assign(tab, changes); persist() }
  }

  return { tabs, activeTabId, activeTab, addTab, closeTab, selectTab, renameTab, updateTab, persist }
}
