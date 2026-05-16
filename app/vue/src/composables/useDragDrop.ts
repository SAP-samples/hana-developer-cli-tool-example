import { ref, type Ref } from 'vue'
import type { ColumnMetadata } from './useDataSource'

// ── Types ─────────────────────────────────────────────────────────────────────

export type DropZone = 'dimensions' | 'measures' | 'source'

export interface DropResult {
  column: ColumnMetadata
  zone: DropZone
  defaultAggregation: 'SUM' | 'COUNT'
}

// ── Constants ─────────────────────────────────────────────────────────────────

const NUMERIC_TYPES = new Set([
  'INTEGER',
  'INT',
  'BIGINT',
  'SMALLINT',
  'TINYINT',
  'DECIMAL',
  'DOUBLE',
  'REAL',
  'FLOAT',
  'SMALLDECIMAL',
])

// ── Composable ────────────────────────────────────────────────────────────────

export function useDragDrop() {
  const draggedColumn: Ref<ColumnMetadata | null> = ref(null)
  const dragOverZone: Ref<DropZone | null> = ref(null)

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function isNumericType(dataType: string): boolean {
    return NUMERIC_TYPES.has(dataType.toUpperCase())
  }

  // ── Drag handlers ────────────────────────────────────────────────────────────

  function startDrag(column: ColumnMetadata, event: DragEvent): void {
    draggedColumn.value = column
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', column.column)
    }
  }

  function dragOver(zone: DropZone, event: DragEvent): void {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
    dragOverZone.value = zone
  }

  function dragLeave(): void {
    dragOverZone.value = null
  }

  function drop(zone: DropZone): DropResult | null {
    const column = draggedColumn.value
    if (!column) {
      clearState()
      return null
    }

    const defaultAggregation: 'SUM' | 'COUNT' = isNumericType(column.dataType) ? 'SUM' : 'COUNT'

    const result: DropResult = {
      column,
      zone,
      defaultAggregation,
    }

    clearState()
    return result
  }

  function endDrag(): void {
    clearState()
  }

  function clearState(): void {
    draggedColumn.value = null
    dragOverZone.value = null
  }

  return {
    draggedColumn,
    dragOverZone,
    startDrag,
    dragOver,
    dragLeave,
    drop,
    endDrag,
    isNumericType,
  }
}
