import { ref, reactive } from 'vue'

export interface ColumnLayout {
  order: string[]
  widths: Record<string, number>
}

const layouts = reactive(new Map<string, ColumnLayout>())

function storageKey(contextId: string): string {
  return `hana-cli-col-layout-${contextId}`
}

function load(contextId: string): ColumnLayout | null {
  try {
    const raw = localStorage.getItem(storageKey(contextId))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function persist(contextId: string, layout: ColumnLayout) {
  localStorage.setItem(storageKey(contextId), JSON.stringify(layout))
}

export function useColumnLayout(contextId: string, defaultColumns: string[]) {
  if (!layouts.has(contextId)) {
    const saved = load(contextId)
    layouts.set(contextId, saved || { order: [...defaultColumns], widths: {} })
  }

  const layout = layouts.get(contextId)!

  if (layout.order.length === 0 || !defaultColumns.some(k => layout.order.includes(k))) {
    layout.order = [...defaultColumns]
    layout.widths = {}
  } else {
    const missing = defaultColumns.filter(k => !layout.order.includes(k))
    if (missing.length > 0) layout.order.push(...missing)
  }

  const resizing = ref(false)
  let resizeCol = ''
  let resizeStartX = 0
  let resizeStartWidth = 0

  function startResize(colKey: string, startX: number, currentWidth: number) {
    resizing.value = true
    resizeCol = colKey
    resizeStartX = startX
    resizeStartWidth = currentWidth
  }

  function onResize(clientX: number): number {
    const delta = clientX - resizeStartX
    const newWidth = Math.max(50, resizeStartWidth + delta)
    layout.widths[resizeCol] = newWidth
    return newWidth
  }

  function endResize() {
    resizing.value = false
    persist(contextId, layout)
  }

  function reorderColumn(fromKey: string, toKey: string) {
    const fromIdx = layout.order.indexOf(fromKey)
    const toIdx = layout.order.indexOf(toKey)
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return

    layout.order.splice(fromIdx, 1)
    layout.order.splice(toIdx, 0, fromKey)
    persist(contextId, layout)
  }

  function getColumnWidth(colKey: string): number | undefined {
    return layout.widths[colKey]
  }

  function getOrderedKeys(): string[] {
    return layout.order
  }

  function resetLayout() {
    layout.order = [...defaultColumns]
    layout.widths = {}
    localStorage.removeItem(storageKey(contextId))
  }

  return {
    resizing,
    layout,
    startResize,
    onResize,
    endResize,
    reorderColumn,
    getColumnWidth,
    getOrderedKeys,
    resetLayout
  }
}
