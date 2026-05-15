import { ref, computed, type Ref } from 'vue'

export interface GridNavOptions {
  rowCount: Ref<number>
  colCount: Ref<number>
  onCopy?: (row: number, col: number) => void
  onEscape?: () => void
  scrollToRow?: (index: number) => void
}

export function useGridNavigation(options: GridNavOptions) {
  const focusedRow = ref(-1)
  const focusedCol = ref(-1)
  const active = computed(() => focusedRow.value >= 0 && focusedCol.value >= 0)

  function activate(row = 0, col = 0) {
    focusedRow.value = Math.max(0, Math.min(row, options.rowCount.value - 1))
    focusedCol.value = Math.max(0, Math.min(col, options.colCount.value - 1))
  }

  function deactivate() {
    focusedRow.value = -1
    focusedCol.value = -1
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!active.value) return false

    const { rowCount, colCount } = options
    let handled = true

    switch (e.key) {
      case 'ArrowDown':
        if (focusedRow.value < rowCount.value - 1) {
          focusedRow.value++
          options.scrollToRow?.(focusedRow.value)
        }
        break
      case 'ArrowUp':
        if (focusedRow.value > 0) {
          focusedRow.value--
          options.scrollToRow?.(focusedRow.value)
        }
        break
      case 'ArrowRight':
        if (focusedCol.value < colCount.value - 1) {
          focusedCol.value++
        }
        break
      case 'ArrowLeft':
        if (focusedCol.value > 0) {
          focusedCol.value--
        }
        break
      case 'Home':
        if (e.ctrlKey) {
          focusedRow.value = 0
          options.scrollToRow?.(0)
        }
        focusedCol.value = 0
        break
      case 'End':
        if (e.ctrlKey) {
          focusedRow.value = rowCount.value - 1
          options.scrollToRow?.(focusedRow.value)
        }
        focusedCol.value = colCount.value - 1
        break
      case 'Enter':
        options.onCopy?.(focusedRow.value, focusedCol.value)
        break
      case 'Escape':
        deactivate()
        options.onEscape?.()
        break
      default:
        handled = false
    }

    if (handled) {
      e.preventDefault()
      e.stopPropagation()
    }
    return handled
  }

  function isFocused(row: number, col: number): boolean {
    return focusedRow.value === row && focusedCol.value === col
  }

  return {
    focusedRow,
    focusedCol,
    active,
    activate,
    deactivate,
    handleKeydown,
    isFocused
  }
}
