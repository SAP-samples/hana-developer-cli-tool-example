<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useHanaApi } from '../composables/useHanaApi'
import { useRouter } from 'vue-router'

import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/BusyIndicator.js'
import '@ui5/webcomponents/dist/Card.js'
import '@ui5/webcomponents/dist/CardHeader.js'
import '@ui5/webcomponents/dist/Label.js'
import '@ui5/webcomponents/dist/Link.js'

const { fetchDirect } = useHanaApi()
const router = useRouter()
const loading = ref(false)
const error = ref('')
const btpData = ref<Record<string, any>>({})

const isBtpError = computed(() => {
  const msg = error.value.toLowerCase()
  return msg.includes('unknown session') ||
    msg.includes('authorization failed') ||
    msg.includes('btp cli target') ||
    msg.includes('no btp cli') ||
    msg.includes('not logged in') ||
    msg.includes('unexpected end of json')
})

async function loadBtpInfo() {
  loading.value = true
  error.value = ''

  try {
    const result = await fetchDirect<any>('/hana/btpInfo')
    btpData.value = result || {}
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(loadBtpInfo)
</script>

<template>
  <div class="btp-info-view">
    <ui5-title level="H3">BTP Information</ui5-title>

    <ui5-busy-indicator v-if="loading" active size="Medium" class="loading" />

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <ui5-link v-if="isBtpError" @click="router.push({ name: 'btpLogin' })">Go to BTP Login</ui5-link>
    </div>

    <template v-else>
      <div class="info-cards">
        <ui5-card v-for="(value, key) in btpData" :key="key" class="info-card">
          <ui5-card-header
            slot="header"
            :title-text="String(key)"
            :subtitle-text="typeof value === 'object' ? JSON.stringify(value) : String(value)"
          />
        </ui5-card>
      </div>
    </template>
  </div>
</template>

<style scoped>
.btp-info-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.info-card {
  min-width: 250px;
  max-width: 400px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.error {
  padding: 1rem;
  color: var(--sapNegativeTextColor);
}
</style>
