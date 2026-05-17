<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CalcViewNode, CalcViewModel, JoinCondition } from '../../../services/calcview/types'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'

const props = defineProps<{
  node: CalcViewNode
  model: CalcViewModel
}>()

const emit = defineEmits<{
  'add-condition': [condition: JoinCondition]
  'remove-condition': [index: number]
}>()

const showAddForm = ref(false)
const newLeftCol = ref('')
const newRightCol = ref('')
const newOperator = ref<'=' | '<' | '>' | '<=' | '>=' | '!='>('=')

const leftInputColumns = computed(() => {
  if (props.node.inputs.length < 1) return []
  const inputNode = props.node.inputs[0].node
  const ds = props.model.dataSources.find(d => d.id === inputNode)
  if (ds) return ds.columns.map(c => c.name)
  const cv = props.model.calculationViews.find(n => n.id === inputNode)
  if (cv) return cv.outputColumns.map(c => c.name)
  return []
})

const rightInputColumns = computed(() => {
  if (props.node.inputs.length < 2) return []
  const inputNode = props.node.inputs[1].node
  const ds = props.model.dataSources.find(d => d.id === inputNode)
  if (ds) return ds.columns.map(c => c.name)
  const cv = props.model.calculationViews.find(n => n.id === inputNode)
  if (cv) return cv.outputColumns.map(c => c.name)
  return []
})

function addCondition() {
  if (newLeftCol.value && newRightCol.value) {
    emit('add-condition', {
      leftColumn: newLeftCol.value,
      rightColumn: newRightCol.value,
      operator: newOperator.value
    })
    newLeftCol.value = ''
    newRightCol.value = ''
    showAddForm.value = false
  }
}

function removeCondition(index: number) {
  emit('remove-condition', index)
}
</script>

<template>
  <div class="join-condition-section">
    <div class="section-header">
      <span>Join Conditions</span>
      <ui5-button design="Transparent" @click="showAddForm = !showAddForm">+ Add</ui5-button>
    </div>

    <div class="conditions-list">
      <div
        v-for="(cond, idx) in node.joinConfig?.conditions ?? []"
        :key="idx"
        class="condition-chip"
      >
        <span class="chip-col left">{{ cond.leftColumn }}</span>
        <span class="chip-op">{{ cond.operator }}</span>
        <span class="chip-col right">{{ cond.rightColumn }}</span>
        <ui5-button
          design="Transparent"
          icon="decline"
          class="chip-remove"
          @click="removeCondition(idx)"
        />
      </div>
      <div v-if="!node.joinConfig?.conditions?.length" class="no-conditions">
        No join conditions defined
      </div>
    </div>

    <div v-if="showAddForm" class="add-form">
      <ui5-select @change="(e: any) => newLeftCol = e.detail.selectedOption.value">
        <ui5-option value="">Left column...</ui5-option>
        <ui5-option v-for="col in leftInputColumns" :key="col" :value="col">{{ col }}</ui5-option>
      </ui5-select>
      <ui5-select @change="(e: any) => newOperator = e.detail.selectedOption.value">
        <ui5-option value="=">=</ui5-option>
        <ui5-option value="&lt;">&lt;</ui5-option>
        <ui5-option value="&gt;">&gt;</ui5-option>
        <ui5-option value="&lt;=">&lt;=</ui5-option>
        <ui5-option value="&gt;=">&gt;=</ui5-option>
        <ui5-option value="!=">!=</ui5-option>
      </ui5-select>
      <ui5-select @change="(e: any) => newRightCol = e.detail.selectedOption.value">
        <ui5-option value="">Right column...</ui5-option>
        <ui5-option v-for="col in rightInputColumns" :key="col" :value="col">{{ col }}</ui5-option>
      </ui5-select>
      <ui5-button design="Emphasized" @click="addCondition">Add</ui5-button>
    </div>
  </div>
</template>

<style scoped>
.join-condition-section {
  padding: 12px;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--sapTextColor, #333);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.conditions-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.condition-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--sapList_Background, #fff);
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  border-radius: 6px;
  font-size: 11px;
}

.chip-col {
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--sapButton_Lite_Background, #f5f6f7);
  font-family: monospace;
}

.chip-col.left {
  color: var(--sapChart_OrderedColor_1, #5899da);
}

.chip-col.right {
  color: var(--sapChart_OrderedColor_2, #e8743b);
}

.chip-op {
  color: var(--sapContent_LabelColor, #666);
}

.chip-remove {
  margin-left: auto;
}

.no-conditions {
  color: var(--sapContent_LabelColor, #666);
  font-size: 11px;
  padding: 8px 0;
}

.add-form {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
}

.add-form ui5-select {
  flex: 1;
  min-width: 80px;
}
</style>
