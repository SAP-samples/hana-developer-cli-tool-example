<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import hljs from 'highlight.js/lib/core'
import sql from 'highlight.js/lib/languages/sql'
import 'highlight.js/styles/github.css'

import '@ui5/webcomponents/dist/Button.js'

hljs.registerLanguage('sql', sql)

const props = defineProps<{
  code: string
  language?: string
}>()

const highlighted = ref('')
const copied = ref(false)

function highlight() {
  if (!props.code) {
    highlighted.value = ''
    return
  }
  const lang = props.language || 'sql'
  try {
    highlighted.value = hljs.highlight(props.code, { language: lang }).value
  } catch {
    highlighted.value = props.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
}

async function copyToClipboard() {
  await navigator.clipboard.writeText(props.code)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

onMounted(highlight)
watch(() => props.code, highlight)
</script>

<template>
  <div class="code-block">
    <div class="code-toolbar">
      <ui5-button
        :icon="copied ? 'accept' : 'copy'"
        :tooltip="copied ? 'Copied!' : 'Copy to clipboard'"
        design="Transparent"
        @click="copyToClipboard"
      />
    </div>
    <pre class="code-content"><code v-html="highlighted" /></pre>
  </div>
</template>

<style scoped>
.code-block {
  position: relative;
  border: 1px solid var(--sapField_BorderColor, #89919a);
  border-radius: 0.5rem;
  overflow: hidden;
}

.code-toolbar {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1;
}

.code-content {
  margin: 0;
  padding: 1rem;
  overflow: auto;
  max-height: 500px;
  font-size: 0.85rem;
  line-height: 1.5;
  background: var(--sapBaseColor, #fff);
}
</style>
