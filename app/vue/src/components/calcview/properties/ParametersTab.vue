<script setup lang="ts">
import { ref } from 'vue'
import type { CalcViewModel, Variable } from '../../../services/calcview/types'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import '@ui5/webcomponents/dist/CheckBox.js'

const props = defineProps<{
  model: CalcViewModel
}>()

const emit = defineEmits<{
  'add-variable': [variable: Variable]
  'remove-variable': [variableId: string]
  'update-variable': [variableId: string, updates: Partial<Variable>]
}>()

const selectedVarId = ref<string | null>(null)

function addNew() {
  const id = `IP_${Date.now()}`
  emit('add-variable', { id, name: id, dataType: 'NVARCHAR' })
  selectedVarId.value = id
}

function remove(id: string) {
  emit('remove-variable', id)
  if (selectedVarId.value === id) selectedVarId.value = null
}

function updateField(field: keyof Variable, value: any) {
  if (selectedVarId.value) {
    emit('update-variable', selectedVarId.value, { [field]: value })
  }
}
</script>

<template>
  <div class="parameters-tab">
    <div class="var-list">
      <div class="list-header">
        <span>Input Parameters</span>
        <ui5-button design="Transparent" @click="addNew">+ Add</ui5-button>
      </div>
      <div
        v-for="v in model.localVariables"
        :key="v.id"
        class="var-item"
        :class="{ selected: selectedVarId === v.id }"
        @click="selectedVarId = v.id"
      >
        <span class="var-name">{{ v.name }}</span>
        <span class="var-type">{{ v.dataType }}</span>
        <ui5-button design="Transparent" icon="decline" @click.stop="remove(v.id)" />
      </div>
      <div v-if="model.localVariables.length === 0" class="empty">No input parameters defined</div>
    </div>

    <div v-if="selectedVarId && model.localVariables.find(v => v.id === selectedVarId)" class="var-detail">
      <div class="detail-row">
        <label>Name:</label>
        <ui5-input
          :value="model.localVariables.find(v => v.id === selectedVarId)?.name || ''"
          @change="(e: any) => updateField('name', e.target.value)"
        />
      </div>
      <div class="detail-row">
        <label>Type:</label>
        <ui5-select @change="(e: any) => updateField('dataType', e.detail.selectedOption.value)">
          <ui5-option v-for="dt in ['NVARCHAR', 'INTEGER', 'BIGINT', 'DECIMAL', 'DATE', 'TIMESTAMP']" :key="dt" :value="dt" :selected="model.localVariables.find(v => v.id === selectedVarId)?.dataType === dt">{{ dt }}</ui5-option>
        </ui5-select>
      </div>
      <div class="detail-row">
        <label>Default:</label>
        <ui5-input
          :value="model.localVariables.find(v => v.id === selectedVarId)?.defaultValue || ''"
          @change="(e: any) => updateField('defaultValue', e.target.value)"
        />
      </div>
      <div class="detail-row">
        <ui5-checkbox
          :checked="model.localVariables.find(v => v.id === selectedVarId)?.mandatory || false"
          text="Mandatory"
          @change="(e: any) => updateField('mandatory', e.target.checked)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.parameters-tab {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.var-list {
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  border-radius: 8px;
  overflow: hidden;
}

.list-header {
  padding: 8px 12px;
  background: var(--sapList_HeaderBackground, #f2f2f2);
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  font-size: 11px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.var-item {
  padding: 6px 12px;
  border-bottom: 1px solid var(--sapList_BorderColor, #e5e5e5);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  cursor: pointer;
}

.var-item.selected {
  background: var(--sapInfobar_Background, #e5f0fa);
}

.var-name { font-weight: 500; color: var(--sapTextColor, #333); }
.var-type { color: var(--sapContent_LabelColor, #666); margin-left: auto; font-size: 10px; }
.empty { padding: 12px; color: var(--sapContent_LabelColor, #666); font-size: 11px; }

.var-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.detail-row label {
  width: 60px;
  color: var(--sapContent_LabelColor, #666);
}

.detail-row ui5-input, .detail-row ui5-select {
  flex: 1;
}
</style>
