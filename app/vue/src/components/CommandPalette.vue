<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { navigation } from '../model/navigation'
import { getRegisteredShortcuts } from '../composables/useKeyboardShortcuts'

import '@ui5/webcomponents/dist/Dialog.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/List.js'
import '@ui5/webcomponents/dist/ListItemStandard.js'
import '@ui5/webcomponents/dist/Icon.js'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const router = useRouter()
const searchQuery = ref('')
const selectedIndex = ref(0)
const inputRef = ref<HTMLElement | null>(null)

interface PaletteItem {
  key: string
  title: string
  icon?: string
  group: string
  route?: string
  external?: string
  shortcut?: string
}

const allItems = computed<PaletteItem[]>(() => {
  const items: PaletteItem[] = []
  for (const group of navigation) {
    for (const item of group.items) {
      items.push({
        key: item.key,
        title: item.title,
        icon: item.icon || group.icon,
        group: group.title,
        route: item.route || item.key,
        external: item.external
      })
    }
  }
  for (const s of getRegisteredShortcuts()) {
    if (s.category === 'global') continue
    const mods = [s.ctrl ? 'Ctrl' : '', s.shift ? 'Shift' : '', s.alt ? 'Alt' : ''].filter(Boolean).join('+')
    items.push({
      key: `shortcut-${s.description}`,
      title: s.description,
      icon: 'keyboard-and-mouse',
      group: 'Shortcuts',
      shortcut: mods ? `${mods}+${s.key.toUpperCase()}` : s.key.toUpperCase()
    })
  }
  return items
})

const filtered = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return allItems.value
  return allItems.value.filter(item =>
    item.title.toLowerCase().includes(q) || item.group.toLowerCase().includes(q)
  )
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    searchQuery.value = ''
    selectedIndex.value = 0
    nextTick(() => {
      const input = inputRef.value as any
      if (input) input.focus()
    })
  }
})

watch(filtered, () => { selectedIndex.value = 0 })

function selectItem(item: PaletteItem) {
  emit('close')
  if (item.external) {
    window.open(item.external, '_blank')
  } else if (item.route) {
    router.push({ name: item.route })
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, filtered.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const item = filtered.value[selectedIndex.value]
    if (item) selectItem(item)
  }
}

function onItemClick(e: Event) {
  const detail = (e as CustomEvent).detail
  const key = detail?.item?.dataset?.key
  if (key) {
    const item = filtered.value.find(i => i.key === key)
    if (item) selectItem(item)
  }
}
</script>

<template>
  <ui5-dialog
    header-text="Command Palette"
    :open="open"
    @close="emit('close')"
    class="command-palette-dialog"
  >
    <div class="palette-content" @keydown="onKeyDown">
      <ui5-input
        ref="inputRef"
        :value="searchQuery"
        placeholder="Type to search commands..."
        show-clear-icon
        class="palette-search"
        @input="(e: any) => searchQuery = e.target.value"
      />
      <ui5-list class="palette-list" @item-click="onItemClick">
        <ui5-li
          v-for="(item, i) in filtered.slice(0, 20)"
          :key="item.key"
          :icon="item.icon"
          :additional-text="item.shortcut || item.group"
          :data-key="item.key"
          :class="{ 'palette-selected': i === selectedIndex }"
        >{{ item.title }}</ui5-li>
      </ui5-list>
      <div v-if="filtered.length === 0" class="palette-empty">
        No matching commands
      </div>
    </div>
  </ui5-dialog>
</template>

<style scoped>
.palette-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
  min-width: 500px;
  max-height: 400px;
}

.palette-search {
  width: 100%;
}

.palette-list {
  max-height: 320px;
  overflow-y: auto;
}

.palette-selected {
  background: var(--sapList_Hover_Background, #e5f0fa);
}

.palette-empty {
  padding: 1.5rem;
  text-align: center;
  color: var(--sapContent_LabelColor);
}
</style>
