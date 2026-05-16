<script setup lang="ts">
import { ref, computed } from 'vue'

import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Dialog.js'
import '@ui5/webcomponents/dist/List.js'
import '@ui5/webcomponents/dist/ListItemStandard.js'
import '@ui5/webcomponents/dist/Bar.js'
import '@ui5/webcomponents/dist/Title.js'

interface ChangelogEntry {
  date: string
  version: string
  Added?: string[]
  Fixed?: string[]
  Changed?: string[]
  Removed?: string[]
}

const STORAGE_KEY = 'hana-cli-last-seen-version'

const dialogOpen = ref(false)
const entries = ref<ChangelogEntry[]>([])
const selectedIdx = ref(0)
const loaded = ref(false)

const lastSeenVersion = ref(localStorage.getItem(STORAGE_KEY) || '')

const hasNew = computed(() => {
  if (entries.value.length === 0) return false
  return entries.value[0].version !== lastSeenVersion.value
})

const selectedEntry = computed(() => entries.value[selectedIdx.value] || null)

const categories: { key: keyof ChangelogEntry; label: string; cssClass: string }[] = [
  { key: 'Added', label: 'Added', cssClass: 'badge-added' },
  { key: 'Changed', label: 'Changed', cssClass: 'badge-changed' },
  { key: 'Fixed', label: 'Fixed', cssClass: 'badge-fixed' },
  { key: 'Removed', label: 'Removed', cssClass: 'badge-removed' }
]

async function openDialog() {
  if (!loaded.value) {
    try {
      const res = await fetch('/api/changelog')
      entries.value = await res.json()
      loaded.value = true
    } catch { entries.value = [] }
  }
  dialogOpen.value = true
  if (entries.value.length > 0) {
    lastSeenVersion.value = entries.value[0].version
    localStorage.setItem(STORAGE_KEY, entries.value[0].version)
  }
}

function closeDialog() {
  dialogOpen.value = false
}

function selectVersion(idx: number) {
  selectedIdx.value = idx
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch { return dateStr }
}
</script>

<template>
  <div class="whats-new-wrapper">
    <ui5-button
      design="Transparent"
      icon="newspaper"
      tooltip="What's New"
      @click="openDialog"
    >
      <span v-if="hasNew" class="new-badge" />
    </ui5-button>

    <ui5-dialog
      :open="dialogOpen"
      header-text="What's New"
      @close="closeDialog"
      class="whats-new-dialog"
    >
      <div class="dialog-content">
        <div class="version-list">
          <div
            v-for="(entry, idx) in entries"
            :key="entry.version + entry.date"
            class="version-item"
            :class="{ selected: idx === selectedIdx }"
            @click="selectVersion(idx)"
          >
            <span class="version-number">{{ entry.version }}</span>
            <span class="version-date">{{ formatDate(entry.date) }}</span>
          </div>
        </div>

        <div class="version-detail">
          <template v-if="selectedEntry">
            <h3 class="detail-header">{{ selectedEntry.version }}</h3>
            <p class="detail-date">{{ formatDate(selectedEntry.date) }}</p>

            <template v-for="cat in categories" :key="cat.key">
              <div v-if="(selectedEntry as any)[cat.key]?.length" class="category-section">
                <span class="category-badge" :class="cat.cssClass">{{ cat.label }}</span>
                <ul class="category-list">
                  <li v-for="(item, i) in (selectedEntry as any)[cat.key]" :key="i">{{ item }}</li>
                </ul>
              </div>
            </template>
          </template>
          <div v-else class="no-selection">Select a version to view details</div>
        </div>
      </div>

      <ui5-bar slot="footer" design="Footer">
        <ui5-button slot="endContent" design="Emphasized" @click="closeDialog">Close</ui5-button>
      </ui5-bar>
    </ui5-dialog>
  </div>
</template>

<style scoped>
.whats-new-wrapper {
  position: relative;
  display: inline-flex;
}

.new-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: var(--sapCriticalColor, #e76500);
  border-radius: 50%;
  pointer-events: none;
}

.dialog-content {
  display: flex;
  height: 450px;
  width: 700px;
  gap: 0;
}

.version-list {
  width: 200px;
  overflow-y: auto;
  border-right: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  flex-shrink: 0;
}

.version-item {
  display: flex;
  flex-direction: column;
  padding: 0.625rem 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid var(--sapList_BorderColor, #e5e5e5);
  transition: background-color 0.1s;
}

.version-item:hover {
  background: var(--sapList_Hover_Background, #e5f0fa);
}

.version-item.selected {
  background: var(--sapList_Active_Background, #0854a0);
  color: var(--sapList_Active_TextColor, #fff);
}

.version-item.selected .version-date {
  color: var(--sapList_Active_TextColor, #fff);
  opacity: 0.8;
}

.version-number {
  font-weight: 600;
  font-size: 0.875rem;
}

.version-date {
  font-size: 0.75rem;
  color: var(--sapContent_LabelColor, #6a6d70);
  margin-top: 2px;
}

.version-detail {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
}

.detail-header {
  margin: 0 0 0.25rem;
  font-size: 1.125rem;
  color: var(--sapTextColor);
}

.detail-date {
  margin: 0 0 1rem;
  font-size: 0.8125rem;
  color: var(--sapContent_LabelColor);
}

.category-section {
  margin-bottom: 1rem;
}

.category-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.375rem;
}

.badge-added { background: var(--sapSuccessBackground, #f1fdf6); color: var(--sapPositiveColor, #2b7c2b); }
.badge-changed { background: var(--sapInformationBackground, #e5f0fa); color: var(--sapInformativeColor, #0854a0); }
.badge-fixed { background: var(--sapWarningBackground, #fef7f1); color: var(--sapCriticalColor, #e76500); }
.badge-removed { background: var(--sapErrorBackground, #fff3f3); color: var(--sapNegativeColor, #bb0000); }

.category-list {
  margin: 0.25rem 0 0;
  padding-left: 1.25rem;
  list-style: disc;
}

.category-list li {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--sapTextColor);
  margin-bottom: 0.25rem;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--sapContent_LabelColor);
}
</style>
