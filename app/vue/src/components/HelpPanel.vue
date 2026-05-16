<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHelpTopics, type HelpTopic } from '../composables/useHelpTopics'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'
import { marked } from 'marked'

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
const { topics, documentation, loading, docsLoading, loadTopics } = useHelpTopics()
const searchQuery = ref('')
const expandedKey = ref<string | null>(null)
const activeTab = ref<'fields' | 'docs'>('fields')
let highlightTimer: ReturnType<typeof setTimeout> | null = null

const routeCommandName = computed(() => {
  return route.name as string || ''
})

const hasFieldHelp = computed(() => {
  return topics.value.some(t => t.key !== '_about')
})

watch(routeCommandName, (cmd) => {
  if (props.open && cmd) loadTopics(cmd)
}, { immediate: true })

watch(() => props.open, (isOpen) => {
  if (isOpen && routeCommandName.value) loadTopics(routeCommandName.value)
})

watch(topics, () => {
  if (!hasFieldHelp.value) {
    activeTab.value = 'docs'
  }
})

const aboutTopic = computed(() => {
  return topics.value.find(t => t.key === '_about') || null
})

const fieldTopics = computed(() => {
  return topics.value.filter(t => t.key !== '_about')
})

const filteredTopics = computed(() => {
  const base = fieldTopics.value
  if (!searchQuery.value) return base
  const q = searchQuery.value.toLowerCase()
  return base.filter(t =>
    t.label.toLowerCase().includes(q) || t.helpText.toLowerCase().includes(q)
  )
})

const renderedDocs = computed(() => {
  if (!documentation.value) return ''
  const md = documentation.value
    .replace(/```mermaid[\s\S]*?```/g, '')
    .replace(/style \w+ fill:#[^\n]*/g, '')
  return marked.parse(md, { async: false }) as string
})

function toggleTopic(topic: HelpTopic) {
  if (expandedKey.value === topic.key) {
    expandedKey.value = null
    clearHighlight()
    return
  }
  expandedKey.value = topic.key
  if (topic.key !== '_about') {
    highlightElement(topic.key)
  }
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

      <div class="help-tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'fields' }"
          @click="activeTab = 'fields'"
        >Field Help</button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'docs' }"
          @click="activeTab = 'docs'"
        >Documentation</button>
      </div>

      <template v-if="activeTab === 'fields'">
        <div v-if="aboutTopic" class="about-section">
          <div class="about-text">{{ aboutTopic.helpText }}</div>
        </div>

        <div v-if="hasFieldHelp" class="help-search">
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
          <div v-else-if="!hasFieldHelp" class="help-empty">
            No field-level help for this screen.<br>
            Check the <a href="#" @click.prevent="activeTab = 'docs'">Documentation</a> tab for full command reference.
          </div>
          <div v-else-if="filteredTopics.length === 0" class="help-empty">
            No matching help topics found.
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
              <span class="topic-key">{{ topic.key }}</span>
            </div>
            <div v-if="expandedKey === topic.key" class="topic-body">
              {{ topic.helpText }}
            </div>
          </div>
        </div>
      </template>

      <template v-if="activeTab === 'docs'">
        <div class="docs-content">
          <div v-if="docsLoading" class="help-loading">Loading documentation...</div>
          <div v-else-if="!documentation" class="help-empty">
            No documentation available for this command.
          </div>
          <div v-else class="markdown-body" v-html="renderedDocs" />
        </div>
      </template>
    </aside>
  </Transition>
</template>

<style scoped>
.help-panel {
  width: 360px;
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

.help-tabs {
  display: flex;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  flex-shrink: 0;
}

.tab-btn {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: none;
  background: none;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--sapContent_LabelColor);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}

.tab-btn:hover {
  background: var(--sapList_Hover_Background, #e5f0fa);
}

.tab-btn.active {
  color: var(--sapBrandColor, #0854a0);
  border-bottom-color: var(--sapBrandColor, #0854a0);
}

.help-search {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  flex-shrink: 0;
}

.about-section {
  padding: 0.625rem 1rem;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  flex-shrink: 0;
}

.about-text {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--sapTextColor);
  font-style: italic;
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

.docs-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 1rem;
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

<style scoped>
.markdown-body {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--sapTextColor);
}

.markdown-body :deep(h1) {
  font-size: 1.125rem;
  margin: 0 0 0.5rem;
  padding-bottom: 0.375rem;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
}

.markdown-body :deep(h2) {
  font-size: 0.9375rem;
  margin: 1rem 0 0.375rem;
  color: var(--sapTitleColor);
}

.markdown-body :deep(h3) {
  font-size: 0.8125rem;
  margin: 0.75rem 0 0.25rem;
  color: var(--sapTitleColor);
}

.markdown-body :deep(p) {
  margin: 0.375rem 0;
}

.markdown-body :deep(code) {
  font-family: var(--sapFontMonospaceFamily, 'Courier New', monospace);
  font-size: 0.75rem;
  background: var(--sapField_Background, #f5f5f5);
  padding: 1px 4px;
  border-radius: 3px;
  border: 1px solid var(--sapField_BorderColor, #d9d9d9);
}

.markdown-body :deep(pre) {
  background: var(--sapShell_Background, #1a1a2e);
  color: var(--sapShell_TextColor, #fff);
  padding: 0.625rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0.5rem 0;
}

.markdown-body :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  color: inherit;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.5rem 0;
  font-size: 0.75rem;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid var(--sapList_BorderColor, #e5e5e5);
  padding: 0.375rem 0.5rem;
  text-align: left;
}

.markdown-body :deep(th) {
  background: var(--sapList_HeaderBackground, #f2f2f2);
  font-weight: 600;
}

.markdown-body :deep(blockquote) {
  margin: 0.5rem 0;
  padding: 0.375rem 0.75rem;
  border-left: 3px solid var(--sapBrandColor, #0854a0);
  background: var(--sapInformationBackground, #e5f0fa);
  font-size: 0.75rem;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 1.25rem;
  margin: 0.375rem 0;
}

.markdown-body :deep(li) {
  margin-bottom: 0.25rem;
}

.markdown-body :deep(a) {
  color: var(--sapLinkColor, #0854a0);
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
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
