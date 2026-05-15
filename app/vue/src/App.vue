<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { navigation } from './model/navigation'
import { toast } from './composables/useToast'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'
import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme.js'
import CommandPalette from './components/CommandPalette.vue'
import NotificationCenter from './components/NotificationCenter.vue'
import WhatsNew from './components/WhatsNew.vue'
import HelpPanel from './components/HelpPanel.vue'

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
const themePopoverOpen = ref(false)
const themePopoverRef = ref<HTMLElement | null>(null)
const toastRef = ref<HTMLElement | null>(null)
const commandPaletteOpen = ref(false)
const helpOpen = ref(false)

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
})
onUnmounted(() => darkMatcher.removeEventListener('change', onOsThemeChange))

function onMenuClick() {
  sideCollapsed.value = !sideCollapsed.value
  localStorage.setItem('hana-cli-side-collapsed', String(sideCollapsed.value))
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
    show-menu-button
    @menu-button-click="onMenuClick"
  >
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
      tooltip="System Info"
      @click="router.push({ name: 'systemInfo' })"
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
        :expanded="group.expanded ?? false"
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
  <ui5-toast ref="toastRef" />
</template>

<style>
.shell-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

ui5-side-navigation {
  min-width: 240px;
}

.content-area {
  flex: 1;
  overflow: auto;
  padding: 1rem 1.5rem;
  background: var(--sapBackgroundColor);
}
</style>
