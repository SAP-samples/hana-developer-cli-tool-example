<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { useCopyToClipboard } from '../composables/useCopyToClipboard'
import { useContextMenu, type ContextMenuPayload } from '../composables/useContextMenu'
import { useColumnLayout } from '../composables/useColumnLayout'
import { useGridNavigation } from '../composables/useGridNavigation'
import CellContextMenu from './CellContextMenu.vue'
import type { SmartColumn } from '../composables/useSmartTable'

const props = withDefaults(defineProps<{
  columns: SmartColumn[]
  data: any[]
  rowHeight?: number
  contextId?: string
}>(), {
  rowHeight: 40,
  contextId: 'virtual-default'
})

const emit = defineEmits<{
  rowClick: [row: any]
  filter: [value: string]
  escape: []
}>()

function onCellContext(event: MouseEvent, row: any, col: SmartColumn, rowIndex: number) {
  const payload: ContextMenuPayload = {
    value: row[col.key],
    row,
    columnKey: col.key,
    columnLabel: col.label,
    rowIndex,
    columns: props.columns.map(c => ({ key: c.key, label: c.label }))
  }
  openMenu(event, payload)
}

const { copiedKey, copy } = useCopyToClipboard()
const { state: menuState, open: openMenu, close: closeMenu } = useContextMenu()
const parentRef = ref<HTMLElement | null>(null)

const columnLayout = computed(() => {
  const keys = props.columns.map(c => c.key)
  return useColumnLayout(props.contextId, keys)
})

const orderedColumns = computed(() => {
  const layout = columnLayout.value
  const ordered = layout.getOrderedKeys()
  const colMap = new Map(props.columns.map(c => [c.key, c]))
  return ordered.filter(k => colMap.has(k)).map(k => colMap.get(k)!)
})

const rowCount = computed(() => props.data.length)

const virtualizer = useVirtualizer({
  get count() { return rowCount.value },
  getScrollElement: () => parentRef.value,
  estimateSize: () => props.rowHeight,
  overscan: 20
})

const gridColCount = computed(() => orderedColumns.value.length)

const gridNav = useGridNavigation({
  rowCount,
  colCount: gridColCount,
  onCopy(row, col) {
    const colKey = orderedColumns.value[col]?.key
    if (colKey) copy(props.data[row]?.[colKey], `${row}-${colKey}`)
  },
  onEscape() { emit('escape') },
  scrollToRow(index) { virtualizer.value.scrollToIndex(index) }
})

function onTableKeydown(e: KeyboardEvent) {
  gridNav.handleKeydown(e)
}

function onCellClick(rowIdx: number, colIdx: number) {
  gridNav.activate(rowIdx, colIdx)
}

function getColWidth(col: SmartColumn): string {
  const w = columnLayout.value.getColumnWidth(col.key)
  return w ? `${w}px` : (col.width || `${100 / orderedColumns.value.length}%`)
}

let dragSourceKey = ''

function onHeaderDragStart(e: DragEvent, colKey: string) {
  dragSourceKey = colKey
  e.dataTransfer!.effectAllowed = 'move'
  e.dataTransfer!.setData('text/plain', colKey)
}

function onHeaderDragOver(e: DragEvent) {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'move'
}

function onHeaderDrop(e: DragEvent, targetKey: string) {
  e.preventDefault()
  if (dragSourceKey && dragSourceKey !== targetKey) {
    columnLayout.value.reorderColumn(dragSourceKey, targetKey)
  }
  dragSourceKey = ''
}

function onResizePointerDown(e: PointerEvent, colKey: string, headerEl: HTMLElement) {
  e.stopPropagation()
  const startWidth = headerEl.offsetWidth
  columnLayout.value.startResize(colKey, e.clientX, startWidth)

  const onMove = (me: PointerEvent) => {
    columnLayout.value.onResize(me.clientX)
  }
  const onUp = () => {
    columnLayout.value.endResize()
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  document.addEventListener('pointermove', onMove)
  document.addEventListener('pointerup', onUp)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}
</script>

<template>
  <div
    ref="parentRef"
    class="virtual-table-container"
    tabindex="0"
    @keydown="onTableKeydown"
    @focus="gridNav.active.value || gridNav.activate(0, 0)"
  >
    <div :style="{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }">
      <div class="virtual-table-header">
        <div
          v-for="col in orderedColumns"
          :key="col.key"
          class="virtual-header-cell"
          :style="{ width: getColWidth(col) }"
          draggable="true"
          @dragstart="onHeaderDragStart($event, col.key)"
          @dragover="onHeaderDragOver"
          @drop="onHeaderDrop($event, col.key)"
        >
          <span class="header-label">{{ col.label }}</span>
          <span
            class="resize-handle"
            @pointerdown.stop="(e: PointerEvent) => onResizePointerDown(e, col.key, (e.currentTarget as HTMLElement).parentElement as HTMLElement)"
          />
        </div>
      </div>
      <div
        v-for="vRow in virtualizer.getVirtualItems()"
        :key="vRow.index"
        class="virtual-row"
        :style="{ transform: `translateY(${vRow.start}px)`, height: `${vRow.size}px` }"
        @click="emit('rowClick', data[vRow.index])"
      >
        <span
          v-for="(col, colIdx) in orderedColumns"
          :key="col.key"
          class="virtual-cell"
          :class="{
            'cell-copied': copiedKey === `${vRow.index}-${col.key}`,
            'grid-cell-focused': gridNav.isFocused(vRow.index, colIdx)
          }"
          :style="{ width: getColWidth(col) }"
          :title="String(data[vRow.index]?.[col.key] ?? '')"
          @click.stop="() => { onCellClick(vRow.index, colIdx); copy(data[vRow.index]?.[col.key], `${vRow.index}-${col.key}`) }"
          @contextmenu="onCellContext($event, data[vRow.index], col, vRow.index)"
        >{{ data[vRow.index]?.[col.key] ?? '' }}</span>
      </div>
    </div>

    <CellContextMenu
      :state="menuState"
      @close="closeMenu"
      @filter="(v: string) => emit('filter', v)"
    />
  </div>
</template>

<style scoped>
.virtual-table-container {
  height: 100%;
  overflow: auto;
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  border-radius: 4px;
  outline: none;
}

.virtual-table-header {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--sapList_HeaderBackground, #f2f2f2);
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
}

.virtual-header-cell {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--sapList_HeaderTextColor, #32363a);
  white-space: nowrap;
  user-select: none;
  flex-shrink: 0;
}

.header-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  background: transparent;
  transition: background-color 0.15s;
}

.resize-handle:hover {
  background: var(--sapBrandColor, #0854a0);
}

.virtual-row {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--sapList_BorderColor, #e5e5e5);
  cursor: pointer;
  transition: background-color 0.1s;
}

.virtual-row:hover {
  background: var(--sapList_Hover_Background, #e5f0fa);
}

.virtual-cell {
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: copy;
  border-radius: 2px;
  transition: background-color 0.3s;
  flex-shrink: 0;
}

.cell-copied {
  background-color: var(--sapSuccessBackground, #f1fdf6);
}

.grid-cell-focused {
  outline: 2px solid var(--sapBrandColor, #0854a0);
  outline-offset: -2px;
  border-radius: 2px;
}
</style>
