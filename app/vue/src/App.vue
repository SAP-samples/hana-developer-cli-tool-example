<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { navigation } from './model/navigation'
import { toast } from './composables/useToast'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'
import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme.js'
import { checkVersion } from './composables/useVersionCheck'
import CommandPalette from './components/CommandPalette.vue'
import NotificationCenter from './components/NotificationCenter.vue'
import WhatsNew from './components/WhatsNew.vue'
import HelpPanel from './components/HelpPanel.vue'
import SettingsDialog from './components/SettingsDialog.vue'

import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Popover.js'
import '@ui5/webcomponents/dist/Toast.js'
import '@ui5/webcomponents/dist/List.js'
import '@ui5/webcomponents/dist/ListItemStandard.js'
import '@ui5/webcomponents-fiori/dist/ShellBar.js'
import '@ui5/webcomponents-fiori/dist/SideNavigation.js'
import '@ui5/webcomponents-fiori/dist/SideNavigationItem.js'
import '@ui5/webcomponents-fiori/dist/SideNavigationSubItem.js'

const router = useRouter()
const route = useRoute()

const sideCollapsed = ref(localStorage.getItem('hana-cli-side-collapsed') === 'true')
const currentTheme = ref(localStorage.getItem('hana-cli-theme') || 'auto')

const expandedState = ref<Record<string, boolean>>((() => {
  try {
    const saved = localStorage.getItem('hana-cli-nav-expanded')
    if (saved) return JSON.parse(saved)
  } catch { /* fall through */ }
  return Object.fromEntries(navigation.map(g => [g.key, g.expanded ?? false]))
})())
const themePopoverOpen = ref(false)
const themePopoverRef = ref<HTMLElement | null>(null)
const toastRef = ref<HTMLElement | null>(null)
const commandPaletteOpen = ref(false)
const helpOpen = ref(false)
const settingsOpen = ref(false)

useKeyboardShortcuts([
  { key: 'k', ctrl: true, handler: () => { commandPaletteOpen.value = true }, description: 'Command Palette', category: 'global' },
  { key: 'F1', handler: () => { helpOpen.value = !helpOpen.value }, description: 'Toggle Help Panel', category: 'global' }
])

const darkMatcher = window.matchMedia('(prefers-color-scheme: dark)')

function resolveTheme(pref: string): string {
  if (pref === 'auto') {
    return darkMatcher.matches ? 'sap_horizon_dark' : 'sap_horizon'
  }
  return pref
}

function onOsThemeChange() {
  if (currentTheme.value === 'auto') {
    setTheme(resolveTheme('auto'))
  }
}

onMounted(() => {
  darkMatcher.addEventListener('change', onOsThemeChange)
  if (toastRef.value) toast.registerElement(toastRef.value)
  checkVersion()
  nextTick(setupNavObserver)
})
onUnmounted(() => {
  darkMatcher.removeEventListener('change', onOsThemeChange)
  navObserver?.disconnect()
})

function onMenuClick() {
  sideCollapsed.value = !sideCollapsed.value
  localStorage.setItem('hana-cli-side-collapsed', String(sideCollapsed.value))
}

let navObserver: MutationObserver | null = null

function setupNavObserver() {
  const items = document.querySelectorAll('ui5-side-navigation-item')
  if (!items.length) return
  navObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName === 'expanded') {
        const el = m.target as HTMLElement
        const text = el.getAttribute('text')
        const group = navigation.find(g => g.title === text)
        if (group) {
          expandedState.value[group.key] = el.hasAttribute('expanded')
          localStorage.setItem('hana-cli-nav-expanded', JSON.stringify(expandedState.value))
        }
      }
    }
  })
  items.forEach(item => navObserver!.observe(item, { attributes: true, attributeFilter: ['expanded'] }))
}

function onNavSelect(e: Event) {
  const detail = (e as CustomEvent).detail
  const item = detail.item
  const key = item.dataset.key

  const external = item.dataset.external
  if (external) {
    window.open(external, '_blank')
    return
  }

  if (key) {
    const matchedRoute = router.getRoutes().find(r => r.name === key)
    if (matchedRoute) {
      router.push({ name: key })
    }
  }
}

function onThemeButtonClick(e: Event) {
  const btn = (e as CustomEvent).detail?.targetRef || (e.target as HTMLElement)
  if (themePopoverRef.value) {
    ;(themePopoverRef.value as any).opener = btn
    themePopoverOpen.value = !themePopoverOpen.value
  }
}

function switchTheme(theme: string) {
  currentTheme.value = theme
  setTheme(resolveTheme(theme))
  localStorage.setItem('hana-cli-theme', theme)
  themePopoverOpen.value = false
}

function isItemSelected(itemKey: string): boolean {
  return route.name === itemKey
}
</script>

<template>
  <ui5-shellbar
    primary-title="HANA CLI"
    secondary-title="Database Developer Tools"
  >
    <ui5-button
      slot="startButton"
      icon="menu2"
      tooltip="Toggle Navigation"
      @click="onMenuClick"
    />
    <NotificationCenter slot="startButton" />
    <WhatsNew slot="startButton" />
    <ui5-button
      slot="startButton"
      icon="sys-help"
      tooltip="Help Topics (F1)"
      @click="helpOpen = !helpOpen"
    />
    <ui5-button
      slot="startButton"
      icon="palette"
      tooltip="Switch Theme"
      id="themeBtn"
      @click="onThemeButtonClick"
    />
    <ui5-button
      slot="startButton"
      icon="action-settings"
      tooltip="Settings"
      @click="settingsOpen = true"
    />
  </ui5-shellbar>

  <ui5-popover
    ref="themePopoverRef"
    opener="themeBtn"
    :open="themePopoverOpen"
    placement="Bottom"
    @close="themePopoverOpen = false"
  >
    <ui5-list header-text="Theme" mode="SingleSelectBegin">
      <ui5-li
        icon="synchronize"
        :selected="currentTheme === 'auto'"
        @click="switchTheme('auto')"
      >Auto (System)</ui5-li>
      <ui5-li
        icon="light-mode"
        :selected="currentTheme === 'sap_horizon'"
        @click="switchTheme('sap_horizon')"
      >Light</ui5-li>
      <ui5-li
        icon="dark-mode"
        :selected="currentTheme === 'sap_horizon_dark'"
        @click="switchTheme('sap_horizon_dark')"
      >Dark</ui5-li>
      <ui5-li
        icon="high-contrast-theme"
        :selected="currentTheme === 'sap_horizon_hcb'"
        @click="switchTheme('sap_horizon_hcb')"
      >High Contrast</ui5-li>
    </ui5-list>
  </ui5-popover>

  <div class="shell-layout">
    <ui5-side-navigation
      :collapsed="sideCollapsed"
      @selection-change="onNavSelect"
    >
      <ui5-side-navigation-item
        v-for="group in navigation"
        :key="group.key"
        :text="group.title"
        :icon="group.icon"
        :expanded="expandedState[group.key] ?? false"
      >
        <ui5-side-navigation-sub-item
          v-for="item in group.items"
          :key="item.key"
          :text="item.title"
          :icon="item.icon"
          :selected="isItemSelected(item.key)"
          :data-key="item.route || item.key"
          :data-external="item.external || undefined"
        />
      </ui5-side-navigation-item>
    </ui5-side-navigation>

    <main class="content-area">
      <router-view />
    </main>

    <HelpPanel :open="helpOpen" @close="helpOpen = false" />
  </div>

  <CommandPalette :open="commandPaletteOpen" @close="commandPaletteOpen = false" />
  <SettingsDialog :open="settingsOpen" @close="settingsOpen = false" />
  <ui5-toast ref="toastRef" />
</template>

<style>
.shell-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

ui5-side-navigation {
  width: 240px;
  transition: width 0.2s ease;
}

ui5-side-navigation[collapsed] {
  width: auto;
}

.content-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 1rem 1.5rem;
  background: var(--sapBackgroundColor);
}

.content-area > * {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
</style>
