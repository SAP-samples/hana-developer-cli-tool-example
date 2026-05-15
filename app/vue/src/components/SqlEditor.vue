<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import VueMonacoEditor from '@guolao/vue-monaco-editor'
import { createSqlCompletionProvider } from '../services/sqlCompletionProvider'

const props = withDefaults(defineProps<{
  modelValue: string
  theme?: 'vs' | 'vs-dark'
  language?: string
  readOnly?: boolean
}>(), {
  theme: 'vs',
  language: 'sql',
  readOnly: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  execute: []
}>()

const editorRef = shallowRef<any>(null)
let completionDisposable: any = null

const options = computed(() => ({
  minimap: { enabled: false },
  lineNumbers: 'on' as const,
  scrollBeyondLastLine: false,
  fontSize: 14,
  fontFamily: "'Courier New', monospace",
  wordWrap: 'on' as const,
  automaticLayout: true,
  readOnly: props.readOnly,
  tabSize: 2,
  renderLineHighlight: 'line' as const,
  scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
  suggest: { showKeywords: true, showSnippets: true }
}))

function onMount(editor: any, monaco: any) {
  editorRef.value = editor
  editor.addAction({
    id: 'execute-query',
    label: 'Execute Query',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
    run: () => emit('execute')
  })

  const provider = createSqlCompletionProvider(monaco)
  completionDisposable = monaco.languages.registerCompletionItemProvider('sql', provider)
}

function onValueChange(value: string | undefined) {
  emit('update:modelValue', value ?? '')
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  const text = event.dataTransfer?.getData('text/plain')
  if (!text || !editorRef.value) return

  const editor = editorRef.value
  const position = editor.getPosition()
  if (position) {
    editor.executeEdits('object-explorer', [{
      range: {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      },
      text: text + ' '
    }])
    editor.focus()
  }
}

function insertText(text: string) {
  if (!editorRef.value) return
  const editor = editorRef.value
  const position = editor.getPosition()
  if (position) {
    editor.executeEdits('insert', [{
      range: {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      },
      text: text + ' '
    }])
    editor.focus()
  }
}

defineExpose({ insertText })
</script>

<template>
  <div
    class="sql-editor-wrapper"
    @drop="onDrop"
    @dragover.prevent
  >
    <VueMonacoEditor
      :value="modelValue"
      :language="language"
      :theme="theme"
      :options="options"
      @mount="onMount"
      @change="onValueChange"
      class="sql-editor-inner"
    />
  </div>
</template>

<style scoped>
.sql-editor-wrapper {
  min-height: 150px;
  height: 100%;
  border: 1px solid var(--sapField_BorderColor, #89919a);
  border-radius: 4px;
  overflow: hidden;
}

.sql-editor-inner {
  height: 100%;
}
</style>
