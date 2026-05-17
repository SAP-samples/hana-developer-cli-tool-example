import { createApp } from 'vue'
import { router } from './router'
import App from './App.vue'

import '@ui5/webcomponents-theming/dist/Assets.js'
import '@ui5/webcomponents/dist/Assets.js'
import '@ui5/webcomponents-fiori/dist/Assets.js'
import '@ui5/webcomponents-fiori/dist/ShellBar.js'
import '@ui5/webcomponents-fiori/dist/SideNavigation.js'
import '@ui5/webcomponents-fiori/dist/SideNavigationItem.js'
import '@ui5/webcomponents-fiori/dist/SideNavigationSubItem.js'
import '@ui5/webcomponents/dist/Icon.js'
import '@ui5/webcomponents-icons/dist/AllIcons.js'

import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme.js'

function getInitialTheme(): string {
  const saved = localStorage.getItem('hana-cli-theme')
  if (saved && saved !== 'auto') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'sap_horizon_dark'
    : 'sap_horizon'
}

setTheme(getInitialTheme())

import { setAdapter } from './adapters/environment'
import { BrowserAdapter } from './adapters/browserAdapter'
import { VSCodeAdapter } from './adapters/vscodeAdapter'

if ((window as any).__VSCODE__) {
  setAdapter(new VSCodeAdapter())
} else {
  setAdapter(new BrowserAdapter())
}

const app = createApp(App)
app.use(router)
app.mount('#app')
