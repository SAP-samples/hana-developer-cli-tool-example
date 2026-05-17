<script setup lang="ts">
import { ref, computed } from 'vue'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import '@ui5/webcomponents/dist/Dialog.js'
import type { LogicalModel, RestrictedMeasure, RestrictionFilter } from '../../../services/calcview/types'

const props = defineProps<{
  logicalModel: LogicalModel
}>()

const emit = defineEmits<{
  'add-restricted-measure': [measure: RestrictedMeasure]
  'remove-restricted-measure': [measureId: string]
}>()

const showAddDialog = ref(false)
const newId = ref('')
const newName = ref('')
const newBaseMeasure = ref('')
const newFilters = ref<RestrictionFilter[]>([])

const availableMeasures = computed(() => props.logicalModel.baseMeasures)
const availableAttributes = computed(() => props.logicalModel.attributes)

function openAddDialog() {
  newId.value = ''
  newName.value = ''
  newBaseMeasure.value = ''
  newFilters.value = []
  showAddDialog.value = true
}

function addFilter() {
  newFilters.value.push({ attributeName: '', operator: '=', values: [''] })
}

function removeFilter(index: number) {
  newFilters.value.splice(index, 1)
}

function confirmAdd() {
  if (!newId.value.trim() || !newBaseMeasure.value) return
  const measure: RestrictedMeasure = {
    id: newId.value.trim(),
    name: newName.value.trim() || newId.value.trim(),
    baseMeasure: newBaseMeasure.value,
    restriction: newFilters.value.filter(f => f.attributeName && f.values[0]),
    label: newName.value.trim()
  }
  emit('add-restricted-measure', measure)
  showAddDialog.value = false
}
</script>

<template>
  <div class="restricted-measures-tab">
    <div class="tab-header">
      <span class="tab-title">Restricted Measures ({{ logicalModel.restrictedMeasures.length }})</span>
      <ui5-button design="Transparent" @click="openAddDialog">+ Add</ui5-button>
    </div>

    <div class="measure-list">
      <div v-for="rm in logicalModel.restrictedMeasures" :key="rm.id" class="measure-item">
        <div class="measure-header">
          <span class="measure-name">{{ rm.id }}</span>
          <span class="measure-base">Base: {{ rm.baseMeasure }}</span>
          <ui5-button design="Transparent" icon="decline" @click="emit('remove-restricted-measure', rm.id)" />
        </div>
        <div class="measure-filters">
          <span v-for="(filter, idx) in rm.restriction" :key="idx" class="filter-chip">
            {{ filter.attributeName }} {{ filter.operator }} {{ filter.values.join(', ') }}
          </span>
        </div>
      </div>
      <div v-if="logicalModel.restrictedMeasures.length === 0" class="empty">No restricted measures defined</div>
    </div>

    <ui5-dialog :open="showAddDialog" header-text="Add Restricted Measure" @close="showAddDialog = false">
      <div class="add-dialog-content">
        <div class="form-row">
          <label>ID</label>
          <ui5-input :value="newId" @input="(e: any) => newId = e.target.value" placeholder="MEASURE_ID" />
        </div>
        <div class="form-row">
          <label>Label</label>
          <ui5-input :value="newName" @input="(e: any) => newName = e.target.value" placeholder="Display name" />
        </div>
        <div class="form-row">
          <label>Base Measure</label>
          <ui5-select @change="(e: any) => { const v = e.detail?.selectedOption?.getAttribute('value'); if (v) newBaseMeasure = v }">
            <ui5-option value="">Select measure...</ui5-option>
            <ui5-option v-for="m in availableMeasures" :key="m.id" :value="m.id" :selected="newBaseMeasure === m.id">{{ m.id }}</ui5-option>
          </ui5-select>
        </div>
        <div class="filters-section">
          <div class="filters-header">
            <span>Restrictions</span>
            <ui5-button design="Transparent" @click="addFilter">+ Filter</ui5-button>
          </div>
          <div v-for="(filter, idx) in newFilters" :key="idx" class="filter-row">
            <ui5-select @change="(e: any) => { const v = e.detail?.selectedOption?.getAttribute('value'); if (v) filter.attributeName = v }">
              <ui5-option value="">Attribute...</ui5-option>
              <ui5-option v-for="attr in availableAttributes" :key="attr.id" :value="attr.id" :selected="filter.attributeName === attr.id">{{ attr.id }}</ui5-option>
            </ui5-select>
            <ui5-select @change="(e: any) => { const v = e.detail?.selectedOption?.getAttribute('value'); if (v) filter.operator = v as any }">
              <ui5-option value="=" :selected="filter.operator === '='">= (equals)</ui5-option>
              <ui5-option value="IN" :selected="filter.operator === 'IN'">IN</ui5-option>
              <ui5-option value="BETWEEN" :selected="filter.operator === 'BETWEEN'">BETWEEN</ui5-option>
            </ui5-select>
            <ui5-input :value="filter.values[0]" placeholder="Value" @input="(e: any) => filter.values = [e.target.value]" />
            <ui5-button design="Transparent" icon="decline" @click="removeFilter(idx)" />
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <ui5-button design="Emphasized" @click="confirmAdd" :disabled="!newId.trim() || !newBaseMeasure">Add</ui5-button>
        <ui5-button design="Transparent" @click="showAddDialog = false">Cancel</ui5-button>
      </div>
    </ui5-dialog>
  </div>
</template>

<style scoped>
.restricted-measures-tab { padding: 8px; }
.tab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.tab-title { font-size: 11px; font-weight: 600; color: var(--sapTextColor, #333); }
.measure-item { border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9); border-radius: 6px; padding: 8px; margin-bottom: 6px; }
.measure-header { display: flex; align-items: center; gap: 8px; }
.measure-name { font-weight: 500; font-size: 12px; }
.measure-base { color: var(--sapContent_LabelColor, #666); font-size: 10px; margin-left: auto; }
.measure-filters { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.filter-chip { font-size: 10px; background: var(--sapWarningBackground, #fff3cd); padding: 2px 6px; border-radius: 4px; }
.empty { padding: 16px; text-align: center; color: var(--sapContent_LabelColor, #666); font-size: 11px; }
.add-dialog-content { padding: 16px; min-width: 450px; display: flex; flex-direction: column; gap: 12px; }
.form-row { display: flex; flex-direction: column; gap: 4px; }
.form-row label { font-size: 11px; color: var(--sapContent_LabelColor, #666); }
.filters-section { border-top: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9); padding-top: 8px; }
.filters-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.filter-row { display: flex; gap: 6px; align-items: center; margin-bottom: 4px; }
.filter-row ui5-select { flex: 1; }
.filter-row ui5-input { flex: 1; }
.dialog-footer { display: flex; gap: 8px; justify-content: flex-end; padding: 8px 16px; }
</style>
