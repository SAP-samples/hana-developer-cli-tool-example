<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useHanaApi } from '../composables/useHanaApi'
import { toast } from '../composables/useToast'

import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Label.js'
import '@ui5/webcomponents/dist/MessageStrip.js'
import '@ui5/webcomponents/dist/BusyIndicator.js'
import '@ui5/webcomponents/dist/SegmentedButton.js'
import '@ui5/webcomponents/dist/SegmentedButtonItem.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'

const { fetchDirect } = useHanaApi()

const mode = ref<'sso' | 'password'>('sso')
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const success = ref('')

const status = ref<{
  loggedIn: boolean
  user?: string
  serverUrl?: string
  globalAccount?: string
  globalAccountId?: string
  subAccount?: string
  subAccountId?: string
}>({ loggedIn: false })

const url = ref('https://cli.btp.cloud.sap')
const subdomain = ref('')
const username = ref('')
const password = ref('')
const idp = ref('')

// Subaccount targeting
const subaccounts = ref<{ displayName: string; guid: string; region: string; state: string }[]>([])
const selectedSubaccount = ref('')
const loadingSubaccounts = ref(false)
const settingTarget = ref(false)

const showTargeting = computed(() => status.value.loggedIn)
const canSetTarget = computed(() => !!selectedSubaccount.value && !settingTarget.value)

const canSubmitSSO = computed(() => !submitting.value)
const canSubmitPassword = computed(() => !!username.value && !!password.value && !submitting.value)

async function loadStatus() {
  loading.value = true
  error.value = ''
  try {
    status.value = await fetchDirect<any>('/hana/btp-status')
    if (status.value.loggedIn) {
      await loadSubaccounts()
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function loadSubaccounts() {
  loadingSubaccounts.value = true
  try {
    subaccounts.value = await fetchDirect<any>('/hana/btp-subaccounts')
  } catch { /* ignore - subaccounts will be empty */ }
  finally { loadingSubaccounts.value = false }
}

function onSubaccountChange(e: any) {
  selectedSubaccount.value = e.detail?.selectedOption?.value || e.detail?.selectedOption?.textContent || ''
}

async function setTarget() {
  settingTarget.value = true
  error.value = ''
  success.value = ''
  try {
    const res = await fetch('/hana/btp-set-target', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subaccount: selectedSubaccount.value })
    })
    const result = await res.json()
    if (result.success) {
      status.value = result.status
      const sa = subaccounts.value.find(s => s.guid === selectedSubaccount.value)
      success.value = `Target set: ${sa?.displayName || selectedSubaccount.value}`
      toast.show('BTP target set successfully')
    } else {
      error.value = result.message || 'Failed to set target'
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    settingTarget.value = false
  }
}

async function login() {
  submitting.value = true
  error.value = ''
  success.value = ''

  try {
    const body: any = { mode: mode.value }
    if (url.value) body.url = url.value
    if (subdomain.value) body.subdomain = subdomain.value
    if (idp.value) body.idp = idp.value

    if (mode.value === 'password') {
      body.user = username.value
      body.password = password.value
    }

    const res = await fetch('/hana/btp-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const result = await res.json()

    if (result.success) {
      success.value = 'Successfully logged in to BTP'
      if (result.status) status.value = result.status
      password.value = ''
      toast.show('BTP Login successful')
      if (status.value.loggedIn) {
        await loadSubaccounts()
      }
    } else {
      error.value = result.message || 'Login failed'
    }
  } catch (e: any) {
    error.value = e.message || 'Login failed'
  } finally {
    submitting.value = false
  }
}

async function logout() {
  submitting.value = true
  error.value = ''
  success.value = ''
  try {
    const res = await fetch('/hana/btp-logout', { method: 'POST' })
    const result = await res.json()
    if (result.success) {
      status.value = { loggedIn: false }
      subaccounts.value = []
      selectedSubaccount.value = ''
      success.value = 'Logged out from BTP'
      toast.show('BTP Logout successful')
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}

onMounted(loadStatus)
</script>

<template>
  <div class="btp-login-view">
    <ui5-title level="H3">BTP Login</ui5-title>

    <ui5-busy-indicator v-if="loading" active size="Medium" class="loading" />

    <template v-else>
      <!-- Status Banner -->
      <ui5-message-strip
        v-if="status.loggedIn && status.subAccount"
        design="Positive"
        hide-close-button
      >
        Logged in as {{ status.user }} &mdash; GA: {{ status.globalAccount }}, Subaccount: {{ status.subAccount }}
      </ui5-message-strip>
      <ui5-message-strip
        v-else-if="status.loggedIn"
        design="Warning"
        hide-close-button
      >
        Logged in as {{ status.user }} &mdash; No subaccount targeted. Please select below.
      </ui5-message-strip>
      <ui5-message-strip
        v-else
        design="Warning"
        hide-close-button
      >
        Not logged in to BTP
      </ui5-message-strip>

      <!-- Subaccount Targeting (shown when logged in) -->
      <div v-if="showTargeting" class="form-card">
        <ui5-title level="H5">Subaccount Target</ui5-title>

        <div class="form-field">
          <ui5-label required>Subaccount</ui5-label>
          <ui5-select @change="onSubaccountChange" :disabled="loadingSubaccounts">
            <ui5-option value="">-- Select --</ui5-option>
            <ui5-option
              v-for="sa in subaccounts"
              :key="sa.guid"
              :value="sa.guid"
              :selected="sa.guid === selectedSubaccount || sa.guid === status.subAccountId"
            >{{ sa.displayName }} ({{ sa.region }})</ui5-option>
          </ui5-select>
        </div>

        <ui5-button
          design="Emphasized"
          icon="target-group"
          :disabled="!canSetTarget"
          @click="setTarget"
        >Set Target</ui5-button>
      </div>

      <!-- Mode Toggle -->
      <div class="mode-toggle">
        <ui5-segmented-button>
          <ui5-segmented-button-item :pressed="mode === 'sso'" @click="mode = 'sso'">SSO (Browser)</ui5-segmented-button-item>
          <ui5-segmented-button-item :pressed="mode === 'password'" @click="mode = 'password'">Username / Password</ui5-segmented-button-item>
        </ui5-segmented-button>
      </div>

      <!-- SSO Mode -->
      <div v-if="mode === 'sso'" class="form-card">
        <ui5-title level="H5">SSO Login</ui5-title>

        <ui5-message-strip design="Information" hide-close-button>
          A browser window will open for authentication. Complete the login there and return here.
        </ui5-message-strip>

        <div class="form-grid">
          <div class="form-field">
            <ui5-label>Server URL</ui5-label>
            <ui5-input
              :value="url"
              @change="(e: any) => url = e.target.value"
              placeholder="https://cli.btp.cloud.sap"
            />
          </div>
          <div class="form-field">
            <ui5-label>Global Account Subdomain</ui5-label>
            <ui5-input
              :value="subdomain"
              @change="(e: any) => subdomain = e.target.value"
              placeholder="(optional)"
            />
          </div>
          <div class="form-field">
            <ui5-label>Custom IDP</ui5-label>
            <ui5-input
              :value="idp"
              @change="(e: any) => idp = e.target.value"
              placeholder="(optional, origin key)"
            />
          </div>
        </div>

        <ui5-button
          design="Emphasized"
          icon="log"
          :disabled="!canSubmitSSO"
          @click="login"
        >Login with SSO</ui5-button>
      </div>

      <!-- Password Mode -->
      <div v-else class="form-card">
        <ui5-title level="H5">Username / Password Login</ui5-title>

        <div class="form-grid">
          <div class="form-field">
            <ui5-label>Server URL</ui5-label>
            <ui5-input
              :value="url"
              @change="(e: any) => url = e.target.value"
              placeholder="https://cli.btp.cloud.sap"
            />
          </div>
          <div class="form-field">
            <ui5-label>Global Account Subdomain</ui5-label>
            <ui5-input
              :value="subdomain"
              @change="(e: any) => subdomain = e.target.value"
              placeholder="(optional)"
            />
          </div>
          <div class="form-field">
            <ui5-label required>Username (Email)</ui5-label>
            <ui5-input
              :value="username"
              @change="(e: any) => username = e.target.value"
              placeholder="user@example.com"
            />
          </div>
          <div class="form-field">
            <ui5-label required>Password</ui5-label>
            <ui5-input
              type="Password"
              :value="password"
              @change="(e: any) => password = e.target.value"
            />
          </div>
          <div class="form-field">
            <ui5-label>Custom IDP</ui5-label>
            <ui5-input
              :value="idp"
              @change="(e: any) => idp = e.target.value"
              placeholder="(optional, origin key)"
            />
          </div>
        </div>

        <ui5-button
          design="Emphasized"
          icon="log"
          :disabled="!canSubmitPassword"
          @click="login"
        >Log In</ui5-button>
      </div>

      <!-- Results -->
      <ui5-message-strip v-if="error" design="Negative" hide-close-button>{{ error }}</ui5-message-strip>
      <ui5-message-strip v-if="success" design="Positive" hide-close-button>{{ success }}</ui5-message-strip>

      <div class="action-bar">
        <ui5-button design="Transparent" icon="refresh" @click="loadStatus">Refresh Status</ui5-button>
        <ui5-button
          v-if="status.loggedIn"
          design="Negative"
          icon="log"
          :disabled="submitting"
          @click="logout"
        >Log Out</ui5-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.btp-login-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  max-width: 700px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.mode-toggle {
  display: flex;
}

.form-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--sapGroup_ContentBackground, #fff);
  border-radius: 8px;
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.action-bar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
</style>
