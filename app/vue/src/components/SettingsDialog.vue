<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGlobalSettings } from '../composables/useGlobalSettings'

import '@ui5/webcomponents/dist/Dialog.js'
import '@ui5/webcomponents/dist/Label.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/CheckBox.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/Bar.js'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { settings, update } = useGlobalSettings()

const localAdmin = ref(settings.admin)
const localConn = ref(settings.conn)
const localDisableVerbose = ref(settings.disableVerbose)
const localDebug = ref(settings.debug)

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    localAdmin.value = settings.admin
    localConn.value = settings.conn
    localDisableVerbose.value = settings.disableVerbose
    localDebug.value = settings.debug
  }
})

function onSave() {
  update({
    admin: localAdmin.value,
    conn: localConn.value,
    disableVerbose: localDisableVerbose.value,
    debug: localDebug.value
  })
  emit('close')
}

function onCancel() {
  emit('close')
}
</script>

<template>
  <ui5-dialog
    :open="open"
    header-text="Settings"
    @close="onCancel"
  >
    <div class="settings-content">
      <section class="settings-section">
        <ui5-title level="H5">Connection Parameters</ui5-title>
        <div class="settings-field">
          <ui5-checkbox
            :checked="localAdmin"
            text="Admin Connection"
            @change="(e: any) => localAdmin = e.target.checked"
          />
        </div>
        <div class="settings-field">
          <ui5-label for="connFilename">Connection Filename:</ui5-label>
          <ui5-input
            id="connFilename"
            :value="localConn"
            placeholder="default-env.json"
            @change="(e: any) => localConn = e.target.value"
          />
        </div>
      </section>

      <section class="settings-section">
        <ui5-title level="H5">Troubleshooting</ui5-title>
        <div class="settings-field">
          <ui5-checkbox
            :checked="localDisableVerbose"
            text="Disable verbose output"
            @change="(e: any) => localDisableVerbose = e.target.checked"
          />
        </div>
        <div class="settings-field">
          <ui5-checkbox
            :checked="localDebug"
            text="Debug hana-cli"
            @change="(e: any) => localDebug = e.target.checked"
          />
        </div>
      </section>
    </div>

    <div slot="footer" class="settings-footer">
      <ui5-button design="Emphasized" @click="onSave">Save</ui5-button>
      <ui5-button design="Transparent" @click="onCancel">Cancel</ui5-button>
    </div>
  </ui5-dialog>
</template>

<style scoped>
.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  min-width: 400px;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.settings-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.settings-field ui5-input {
  width: 100%;
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  width: 100%;
  padding: 0.25rem 0;
}
</style>
