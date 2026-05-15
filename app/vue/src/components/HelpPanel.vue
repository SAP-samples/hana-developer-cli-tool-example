<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHelpTopics, type HelpTopic } from '../composables/useHelpTopics'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'

import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/Button.js'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const { topics, loading, loadTopics } = useHelpTopics()
const searchQuery = ref('')
const expandedKey = ref<string | null>(null)
let highlightTimer: ReturnType<typeof setTimeout> | null = null

const commandName = computed(() => {
  const name = route.name as string || ''
  return name.toLowerCase().replace(/\s+/g, '')
})

watch(commandName, (cmd) => {
  if (props.open && cmd) loadTopics(cmd)
}, { immediate: true })

watch(() => props.open, (isOpen) => {
  if (isOpen && commandName.value) loadTopics(commandName.value)
})

const filteredTopics = computed(() => {
  if (!searchQuery.value) return topics.value
  const q = searchQuery.value.toLowerCase()
  return topics.value.filter(t =>
    t.label.toLowerCase().includes(q) || t.helpText.toLowerCase().includes(q)
  )
})

function toggleTopic(topic: HelpTopic) {
  if (expandedKey.value === topic.key) {
    expandedKey.value = null
    clearHighlight()
    return
  }
  expandedKey.value = topic.key
  highlightElement(topic.key)
}

function highlightElement(key: string) {
  clearHighlight()
  const el = document.querySelector(`[data-help-id="${key}"]`) as HTMLElement | null
  if (!el) return

  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el.classList.add('help-highlight')
  highlightTimer = setTimeout(() => {
    el.classList.remove('help-highlight')
  }, 2500)
}

function clearHighlight() {
  if (highlightTimer) {
    clearTimeout(highlightTimer)
    highlightTimer = null
  }
  document.querySelectorAll('.help-highlight').forEach(el => {
    el.classList.remove('help-highlight')
  })
}

function onSearchInput(e: Event) {
  searchQuery.value = (e.target as any).value || ''
}

useKeyboardShortcuts([
  { key: 'F1', handler: () => emit('close'), description: 'Toggle Help', category: 'general' }
])
</script>

<template>
  <Transition name="slide">
    <aside v-if="open" class="help-panel">
      <div class="help-header">
        <ui5-title level="H5">Help Topics</ui5-title>
        <ui5-button
          design="Transparent"
          icon="decline"
          tooltip="Close"
          @click="emit('close')"
        />
      </div>

      <div class="help-search">
        <ui5-input
          placeholder="Search Help Topics"
          show-clear-icon
          class="search-input"
          @input="onSearchInput"
        >
          <ui5-icon slot="icon" name="search" />
        </ui5-input>
      </div>

      <div class="help-topics-list">
        <div v-if="loading" class="help-loading">Loading...</div>
        <div v-else-if="filteredTopics.length === 0" class="help-empty">
          No help topics available for this screen.
        </div>
        <div
          v-for="topic in filteredTopics"
          :key="topic.key"
          class="help-topic"
          :class="{ expanded: expandedKey === topic.key }"
          @click="toggleTopic(topic)"
        >
          <div class="topic-header">
            <span class="topic-label">{{ topic.label }}</span>
            <span v-if="topic.key !== '_about'" class="topic-key">{{ topic.key }}</span>
          </div>
          <div v-if="expandedKey === topic.key" class="topic-body">
            {{ topic.helpText }}
          </div>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.help-panel {
  width: 320px;
  height: 100%;
  border-left: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  background: var(--sapGroup_ContentBackground, #fff);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  flex-shrink: 0;
}

.help-search {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  flex-shrink: 0;
}

.search-input {
  width: 100%;
}

.help-topics-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.help-loading,
.help-empty {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--sapContent_LabelColor);
  font-size: 0.8125rem;
}

.help-topic {
  padding: 0.625rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid var(--sapList_BorderColor, #e5e5e5);
  transition: background-color 0.1s;
}

.help-topic:hover {
  background: var(--sapList_Hover_Background, #e5f0fa);
}

.help-topic.expanded {
  background: var(--sapList_SelectionBackgroundColor, #e5f0fa);
}

.topic-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.topic-label {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--sapTextColor);
}

.topic-key {
  font-size: 0.6875rem;
  color: var(--sapContent_LabelColor);
  font-family: monospace;
}

.topic-body {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--sapTextColor);
  padding: 0.5rem;
  background: var(--sapField_Background, #fff);
  border-radius: 4px;
  border: 1px solid var(--sapField_BorderColor, #89919a);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>

<style>
@keyframes help-pulse {
  0%, 100% { box-shadow: none; }
  50% { box-shadow: 0 0 0 3px var(--sapBrandColor, #0854a0); }
}

.help-highlight {
  animation: help-pulse 0.8s ease-in-out 3;
  border-radius: 4px;
}
</style>
