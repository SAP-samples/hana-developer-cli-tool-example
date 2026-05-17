<script setup lang="ts">
import { ref, watch } from 'vue'
import '@ui5/webcomponents/dist/Dialog.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import '@ui5/webcomponents/dist/Label.js'

const props = defineProps<{
  open: boolean
  directory?: string
}>()

const emit = defineEmits<{
  'confirm': [config: { name: string; dataCategory: string; description: string; initialNode: string; directory: string }]
  'cancel': []
}>()

const name = ref('')
const dataCategory = ref('CUBE')
const description = ref('')
const initialNode = ref('projection')
const directory = ref(props.directory || '')

watch(() => props.directory, (v) => { if (v) directory.value = v })

function onConfirm() {
  if (!name.value.trim()) return
  emit('confirm', {
    name: name.value.trim(),
    dataCategory: dataCategory.value,
    description: description.value,
    initialNode: initialNode.value,
    directory: directory.value || ''
  })
  resetForm()
}

function onCancel() {
  emit('cancel')
  resetForm()
}

function resetForm() {
  name.value = ''
  dataCategory.value = 'CUBE'
  description.value = ''
  initialNode.value = 'projection'
}
</script>

<template>
  <ui5-dialog :open="open" header-text="Create New Calculation View" @close="onCancel">
    <div class="dialog-content">
      <div class="form-row">
        <ui5-label for="cv-name" required>Name:</ui5-label>
        <ui5-input id="cv-name" :value="name" @input="(e: any) => name = e.target.value" placeholder="MY_VIEW" />
      </div>
      <div class="form-row">
        <ui5-label for="cv-category">Data Category:</ui5-label>
        <ui5-select id="cv-category" @change="(e: any) => dataCategory = e.detail.selectedOption.value">
          <ui5-option value="CUBE" selected>CUBE (measures + dimensions)</ui5-option>
          <ui5-option value="DIMENSION">DIMENSION (attributes only)</ui5-option>
        </ui5-select>
      </div>
      <div class="form-row">
        <ui5-label for="cv-desc">Description:</ui5-label>
        <ui5-input id="cv-desc" :value="description" @input="(e: any) => description = e.target.value" placeholder="Optional description" />
      </div>
      <div class="form-row">
        <ui5-label for="cv-initial">Initial Node:</ui5-label>
        <ui5-select id="cv-initial" @change="(e: any) => initialNode = e.detail.selectedOption.value">
          <ui5-option value="projection" selected>Projection</ui5-option>
          <ui5-option value="aggregation">Aggregation</ui5-option>
          <ui5-option value="join">Join</ui5-option>
          <ui5-option value="none">None (empty)</ui5-option>
        </ui5-select>
      </div>
      <div class="form-row">
        <ui5-label for="cv-dir">Save Location:</ui5-label>
        <ui5-input id="cv-dir" :value="directory" @input="(e: any) => directory = e.target.value" placeholder="Project directory path" />
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <ui5-button design="Emphasized" @click="onConfirm">Create</ui5-button>
      <ui5-button design="Transparent" @click="onCancel">Cancel</ui5-button>
    </div>
  </ui5-dialog>
</template>

<style scoped>
.dialog-content { display: flex; flex-direction: column; gap: 12px; padding: 16px; min-width: 400px; }
.form-row { display: flex; flex-direction: column; gap: 4px; }
.form-row ui5-input, .form-row ui5-select { width: 100%; }
.dialog-footer { display: flex; gap: 8px; justify-content: flex-end; padding: 8px 16px; }
</style>
