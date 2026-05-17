import { ref, computed } from 'vue'

export interface Command {
  type: string
  description: string
  execute(): void
  undo(): void
}

export function createUndoRedoStack() {
  const commands = ref<Command[]>([])
  const pointer = ref(-1)
  const savedPointer = ref(-1)

  const canUndo = computed(() => pointer.value >= 0)
  const canRedo = computed(() => pointer.value < commands.value.length - 1)
  const isDirty = computed(() => pointer.value !== savedPointer.value)

  function push(cmd: Command) {
    commands.value = commands.value.slice(0, pointer.value + 1)
    commands.value.push(cmd)
    pointer.value++
    cmd.execute()
  }

  function undo() {
    if (!canUndo.value) return
    commands.value[pointer.value].undo()
    pointer.value--
  }

  function redo() {
    if (!canRedo.value) return
    pointer.value++
    commands.value[pointer.value].execute()
  }

  function markSaved() {
    savedPointer.value = pointer.value
  }

  return { commands, pointer, canUndo, canRedo, isDirty, push, undo, redo, markSaved }
}

export function useCalcViewUndoRedo() {
  return createUndoRedoStack()
}
