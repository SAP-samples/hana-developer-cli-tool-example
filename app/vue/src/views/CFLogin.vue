<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
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
import '@ui5/webcomponents/dist/Link.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'

const { fetchDirect } = useHanaApi()

const mode = ref<'sso' | 'password'>('sso')
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const success = ref('')

const status = ref<{ loggedIn: boolean; apiEndpoint?: string; org?: string; space?: string }>({ loggedIn: false })
const ssoUrl = ref('')

const apiEndpoint = ref('')
const passcode = ref('')
const username = ref('')
const password = ref('')
const org = ref('')
const space = ref('')

// Org/Space targeting
const orgs = ref<{ name: string; guid: string }[]>([])
const spaces = ref<{ name: string; guid: string }[]>([])
const selectedOrg = ref('')
const selectedSpace = ref('')
const loadingOrgs = ref(false)
const loadingSpaces = ref(false)
const settingTarget = ref(false)

const needsTarget = computed(() => status.value.loggedIn && (!status.value.org || !status.value.space))
const showTargeting = computed(() => status.value.loggedIn)
const canSetTarget = computed(() => !!selectedOrg.value && !!selectedSpace.value && !settingTarget.value)

const canSubmitSSO = computed(() => !!apiEndpoint.value && !!passcode.value && !submitting.value)
const canSubmitPassword = computed(() => !!apiEndpoint.value && !!username.value && !!password.value && !submitting.value)

async function loadStatus() {
  loading.value = true
  error.value = ''
  try {
    status.value = await fetchDirect<any>('/hana/cf-status')
    if (status.value.apiEndpoint && !apiEndpoint.value) {
      apiEndpoint.value = status.value.apiEndpoint
    }
    const ssoData = await fetchDirect<any>('/hana/cf-sso-url')
    ssoUrl.value = ssoData.ssoUrl || ''
    if (ssoData.apiEndpoint && !apiEndpoint.value) {
      apiEndpoint.value = ssoData.apiEndpoint
    }
    if (status.value.loggedIn) {
      await loadOrgs()
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function loadOrgs() {
  loadingOrgs.value = true
  try {
    orgs.value = await fetchDirect<any>('/hana/cf-orgs')
    if (orgs.value.length === 1) {
      selectedOrg.value = orgs.value[0].name
      await loadSpaces(orgs.value[0].guid)
    }
  } catch { /* ignore - orgs will be empty */ }
  finally { loadingOrgs.value = false }
}

async function loadSpaces(orgGuid?: string) {
  loadingSpaces.value = true
  try {
    const query = orgGuid ? `?orgGuid=${orgGuid}` : ''
    spaces.value = await fetchDirect<any>(`/hana/cf-spaces${query}`)
    if (spaces.value.length === 1) {
      selectedSpace.value = spaces.value[0].name
    }
  } catch { /* ignore */ }
  finally { loadingSpaces.value = false }
}

function onOrgChange(e: any) {
  const name = e.detail?.selectedOption?.value || e.detail?.selectedOption?.textContent || ''
  selectedOrg.value = name
  selectedSpace.value = ''
  const found = orgs.value.find(o => o.name === name)
  if (found) loadSpaces(found.guid)
}

function onSpaceChange(e: any) {
  selectedSpace.value = e.detail?.selectedOption?.value || e.detail?.selectedOption?.textContent || ''
}

async function setTarget() {
  settingTarget.value = true
  error.value = ''
  success.value = ''
  try {
    const res = await fetch('/hana/cf-target', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ org: selectedOrg.value, space: selectedSpace.value })
    })
    const result = await res.json()
    if (result.success) {
      status.value = result.status
      success.value = `Target set: Org: ${selectedOrg.value}, Space: ${selectedSpace.value}`
      toast.show('CF target set successfully')
    } else {
      error.value = result.message || 'Failed to set target'
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    settingTarget.value = false
  }
}

async function refreshSSOUrl() {
  if (!apiEndpoint.value) return
  try {
    const ssoData = await fetchDirect<any>(`/hana/cf-sso-url?api=${encodeURIComponent(apiEndpoint.value)}`)
    ssoUrl.value = ssoData.ssoUrl || ''
  } catch { /* ignore */ }
}

async function login() {
  submitting.value = true
  error.value = ''
  success.value = ''

  try {
    const body: any = { mode: mode.value, apiEndpoint: apiEndpoint.value }
    if (mode.value === 'sso') {
      body.passcode = passcode.value
    } else {
      body.username = username.value
      body.password = password.value
      if (org.value) body.org = org.value
      if (space.value) body.space = space.value
    }

    const res = await fetch('/hana/cf-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const result = await res.json()

    if (result.success) {
      success.value = 'Successfully logged in to Cloud Foundry'
      if (result.status) status.value = result.status
      passcode.value = ''
      password.value = ''
      toast.show('CF Login successful')
      if (status.value.loggedIn && (!status.value.org || !status.value.space)) {
        await loadOrgs()
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

function openPasscodeUrl() {
  if (ssoUrl.value) {
    window.open(ssoUrl.value, '_blank')
  }
}

async function logout() {
  submitting.value = true
  error.value = ''
  success.value = ''
  try {
    const res = await fetch('/hana/cf-logout', { method: 'POST' })
    const result = await res.json()
    if (result.success) {
      status.value = { loggedIn: false }
      orgs.value = []
      spaces.value = []
      selectedOrg.value = ''
      selectedSpace.value = ''
      success.value = 'Logged out from Cloud Foundry'
      toast.show('CF Logout successful')
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
  <div class="cf-login-view">
    <ui5-title level="H3">Cloud Foundry Login</ui5-title>

    <ui5-busy-indicator v-if="loading" active size="Medium" class="loading" />

    <template v-else>
      <!-- Status Banner -->
      <ui5-message-strip
        v-if="status.loggedIn && status.org && status.space"
        design="Positive"
        hide-close-button
      >
        Logged in to {{ status.apiEndpoint }} &mdash; Org: {{ status.org }}, Space: {{ status.space }}
      </ui5-message-strip>
      <ui5-message-strip
        v-else-if="status.loggedIn"
        design="Warning"
        hide-close-button
      >
        Logged in to {{ status.apiEndpoint }} &mdash; Org and Space not set. Please select below.
      </ui5-message-strip>
      <ui5-message-strip
        v-else
        design="Warning"
        hide-close-button
      >
        Not logged in to Cloud Foundry
      </ui5-message-strip>

      <!-- Org/Space Targeting (shown when logged in) -->
      <div v-if="showTargeting" class="form-card">
        <ui5-title level="H5">Organization &amp; Space Target</ui5-title>

        <div class="form-grid">
          <div class="form-field">
            <ui5-label required>Organization</ui5-label>
            <ui5-select @change="onOrgChange" :disabled="loadingOrgs">
              <ui5-option value="">-- Select --</ui5-option>
              <ui5-option
                v-for="o in orgs"
                :key="o.guid"
                :value="o.name"
                :selected="o.name === selectedOrg"
              >{{ o.name }}</ui5-option>
            </ui5-select>
          </div>
          <div class="form-field">
            <ui5-label required>Space</ui5-label>
            <ui5-select @change="onSpaceChange" :disabled="loadingSpaces || !selectedOrg">
              <ui5-option value="">-- Select --</ui5-option>
              <ui5-option
                v-for="s in spaces"
                :key="s.guid"
                :value="s.name"
                :selected="s.name === selectedSpace"
              >{{ s.name }}</ui5-option>
            </ui5-select>
          </div>
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
          <ui5-segmented-button-item :pressed="mode === 'sso'" @click="mode = 'sso'">SSO Passcode</ui5-segmented-button-item>
          <ui5-segmented-button-item :pressed="mode === 'password'" @click="mode = 'password'">Username / Password</ui5-segmented-button-item>
        </ui5-segmented-button>
      </div>

      <!-- SSO Mode -->
      <div v-if="mode === 'sso'" class="form-card">
        <ui5-title level="H5">SSO Passcode Login</ui5-title>

        <div class="form-field">
          <ui5-label required>API Endpoint</ui5-label>
          <ui5-input
            :value="apiEndpoint"
            @change="(e: any) => { apiEndpoint = e.target.value; refreshSSOUrl() }"
            placeholder="https://api.cf.us10.hana.ondemand.com"
          />
        </div>

        <div class="form-field">
          <ui5-label>Step 1: Get your one-time passcode</ui5-label>
          <ui5-link v-if="ssoUrl" @click="openPasscodeUrl">
            Open Passcode Page ({{ ssoUrl }})
          </ui5-link>
          <span v-else class="hint">Enter API endpoint to generate SSO URL</span>
        </div>

        <div class="form-field">
          <ui5-label required>Step 2: Paste the passcode</ui5-label>
          <ui5-input
            :value="passcode"
            @change="(e: any) => passcode = e.target.value"
            placeholder="One-time passcode from browser"
          />
        </div>

        <ui5-button
          design="Emphasized"
          icon="log"
          :disabled="!canSubmitSSO"
          @click="login"
        >Log In</ui5-button>
      </div>

      <!-- Password Mode -->
      <div v-else class="form-card">
        <ui5-title level="H5">Username / Password Login</ui5-title>

        <div class="form-grid">
          <div class="form-field full-width">
            <ui5-label required>API Endpoint</ui5-label>
            <ui5-input
              :value="apiEndpoint"
              @change="(e: any) => apiEndpoint = e.target.value"
              placeholder="https://api.cf.us10.hana.ondemand.com"
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
            <ui5-label>Organization</ui5-label>
            <ui5-input
              :value="org"
              @change="(e: any) => org = e.target.value"
              placeholder="(optional)"
            />
          </div>
          <div class="form-field">
            <ui5-label>Space</ui5-label>
            <ui5-input
              :value="space"
              @change="(e: any) => space = e.target.value"
              placeholder="(optional)"
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
.cf-login-view {
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

.full-width {
  grid-column: 1 / -1;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.hint {
  font-size: 0.8125rem;
  color: var(--sapContent_LabelColor);
  font-style: italic;
}

.action-bar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
</style>
