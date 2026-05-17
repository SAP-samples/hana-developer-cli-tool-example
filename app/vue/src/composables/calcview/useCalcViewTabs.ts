import { ref, computed } from 'vue'
import { useCalcViewModel } from './useCalcViewModel'

export interface CalcViewTab {
  id: string
  title: string
  filePath?: string
  editor: ReturnType<typeof useCalcViewModel>
}

export function useCalcViewTabs() {
  const tabs = ref<CalcViewTab[]>([])
  const activeTabId = ref<string | null>(null)

  const activeTab = computed(() => {
    return tabs.value.find(t => t.id === activeTabId.value) ?? null
  })

  function openTab(title: string, filePath?: string): CalcViewTab {
    const existing = filePath ? tabs.value.find(t => t.filePath === filePath) : null
    if (existing) {
      activeTabId.value = existing.id
      return existing
    }

    const id = `tab_${Date.now()}`
    const editor = useCalcViewModel()
    const tab: CalcViewTab = { id, title, filePath, editor }
    tabs.value.push(tab)
    activeTabId.value = id
    return tab
  }

  function closeTab(tabId: string): boolean {
    const tab = tabs.value.find(t => t.id === tabId)
    if (!tab) return true
    if (tab.editor.undoRedo.isDirty.value) return false

    const idx = tabs.value.findIndex(t => t.id === tabId)
    tabs.value.splice(idx, 1)

    if (activeTabId.value === tabId) {
      activeTabId.value = tabs.value.length > 0
        ? tabs.value[Math.min(idx, tabs.value.length - 1)].id
        : null
    }
    return true
  }

  function forceCloseTab(tabId: string) {
    const idx = tabs.value.findIndex(t => t.id === tabId)
    if (idx < 0) return
    tabs.value.splice(idx, 1)
    if (activeTabId.value === tabId) {
      activeTabId.value = tabs.value.length > 0
        ? tabs.value[Math.min(idx, tabs.value.length - 1)].id
        : null
    }
  }

  return { tabs, activeTabId, activeTab, openTab, closeTab, forceCloseTab }
}
