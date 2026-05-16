import { ref, onMounted, onUnmounted } from 'vue'

export interface ContextMenuPayload {
  value: any
  row: Record<string, any>
  columnKey: string
  columnLabel: string
  rowIndex: number
  columns: { key: string; label: string }[]
}

export interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  payload: ContextMenuPayload | null
}

const state = ref<ContextMenuState>({
  visible: false,
  x: 0,
  y: 0,
  payload: null
})

function open(event: MouseEvent, payload: ContextMenuPayload) {
  event.preventDefault()
  state.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    payload
  }
}

function close() {
  state.value = { visible: false, x: 0, y: 0, payload: null }
}

export function useContextMenu() {
  function onDocumentClick() {
    if (state.value.visible) close()
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && state.value.visible) close()
  }

  onMounted(() => {
    document.addEventListener('click', onDocumentClick)
    document.addEventListener('keydown', onKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('click', onDocumentClick)
    document.removeEventListener('keydown', onKeydown)
  })

  return { state, open, close }
}
