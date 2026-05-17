<script setup lang="ts">
import { ref } from 'vue'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import '@ui5/webcomponents/dist/Dialog.js'
import type { LogicalModel, Hierarchy, HierarchyLevel } from '../../../services/calcview/types'

const props = defineProps<{
  logicalModel: LogicalModel
}>()

const emit = defineEmits<{
  'add-hierarchy': [hierarchy: Hierarchy]
  'remove-hierarchy': [hierarchyId: string]
}>()

const showAddDialog = ref(false)
const newId = ref('')
const newName = ref('')
const newType = ref<'leveled' | 'parentChild'>('leveled')
const newParentColumn = ref('')
const newChildColumn = ref('')
const newLevels = ref<HierarchyLevel[]>([])

function openAddDialog() {
  newId.value = ''
  newName.value = ''
  newType.value = 'leveled'
  newParentColumn.value = ''
  newChildColumn.value = ''
  newLevels.value = []
  showAddDialog.value = true
}

function addLevel() {
  newLevels.value.push({ name: '', column: '', ordinal: newLevels.value.length + 1 })
}

function removeLevel(index: number) {
  newLevels.value.splice(index, 1)
  newLevels.value.forEach((l, i) => l.ordinal = i + 1)
}

function confirmAdd() {
  if (!newId.value.trim()) return
  const hierarchy: Hierarchy = {
    id: newId.value.trim(),
    name: newName.value.trim() || newId.value.trim(),
    type: newType.value,
    ...(newType.value === 'leveled' ? { levels: [...newLevels.value] } : {}),
    ...(newType.value === 'parentChild' ? { parentColumn: newParentColumn.value, childColumn: newChildColumn.value } : {})
  }
  emit('add-hierarchy', hierarchy)
  showAddDialog.value = false
}

function handleRemove(id: string) {
  emit('remove-hierarchy', id)
}
</script>

<template>
  <div class="hierarchies-tab">
    <div class="tab-header">
      <span class="tab-title">Hierarchies ({{ logicalModel.hierarchies.length }})</span>
      <ui5-button design="Transparent" @click="openAddDialog">+ Add</ui5-button>
    </div>

    <div class="hierarchy-list">
      <div v-for="h in logicalModel.hierarchies" :key="h.id" class="hierarchy-item">
        <div class="hierarchy-header">
          <span class="hierarchy-name">{{ h.id }}</span>
          <span class="hierarchy-type">{{ h.type }}</span>
          <ui5-button design="Transparent" icon="decline" @click="handleRemove(h.id)" />
        </div>
        <div v-if="h.type === 'leveled' && h.levels" class="hierarchy-levels">
          <span v-for="level in h.levels" :key="level.name" class="level-chip">
            {{ level.name }} ({{ level.column }})
          </span>
        </div>
        <div v-if="h.type === 'parentChild'" class="hierarchy-pc">
          Parent: {{ h.parentColumn }} → Child: {{ h.childColumn }}
        </div>
      </div>
      <div v-if="logicalModel.hierarchies.length === 0" class="empty">No hierarchies defined</div>
    </div>

    <ui5-dialog :open="showAddDialog" header-text="Add Hierarchy" @close="showAddDialog = false">
      <div class="add-dialog-content">
        <div class="form-row">
          <label>ID</label>
          <ui5-input :value="newId" @input="(e: any) => newId = e.target.value" placeholder="HIERARCHY_ID" />
        </div>
        <div class="form-row">
          <label>Name</label>
          <ui5-input :value="newName" @input="(e: any) => newName = e.target.value" placeholder="Display Name" />
        </div>
        <div class="form-row">
          <label>Type</label>
          <ui5-select @change="(e: any) => { const v = e.detail?.selectedOption?.getAttribute('value'); if (v) newType = v }">
            <ui5-option value="leveled" :selected="newType === 'leveled'">Leveled</ui5-option>
            <ui5-option value="parentChild" :selected="newType === 'parentChild'">Parent-Child</ui5-option>
          </ui5-select>
        </div>

        <template v-if="newType === 'leveled'">
          <div class="levels-section">
            <div class="levels-header">
              <span>Levels</span>
              <ui5-button design="Transparent" @click="addLevel">+ Level</ui5-button>
            </div>
            <div v-for="(level, idx) in newLevels" :key="idx" class="level-row">
              <ui5-input :value="level.name" placeholder="Level name" @input="(e: any) => level.name = e.target.value" />
              <ui5-select @change="(e: any) => { const v = e.detail?.selectedOption?.getAttribute('value'); if (v) level.column = v }">
                <ui5-option value="">Select column...</ui5-option>
                <ui5-option v-for="attr in logicalModel.attributes" :key="attr.id" :value="attr.id" :selected="level.column === attr.id">{{ attr.id }}</ui5-option>
              </ui5-select>
              <ui5-button design="Transparent" icon="decline" @click="removeLevel(idx)" />
            </div>
          </div>
        </template>

        <template v-if="newType === 'parentChild'">
          <div class="form-row">
            <label>Parent Column</label>
            <ui5-select @change="(e: any) => { const v = e.detail?.selectedOption?.getAttribute('value'); if (v) newParentColumn = v }">
              <ui5-option value="">Select...</ui5-option>
              <ui5-option v-for="attr in logicalModel.attributes" :key="attr.id" :value="attr.id" :selected="newParentColumn === attr.id">{{ attr.id }}</ui5-option>
            </ui5-select>
          </div>
          <div class="form-row">
            <label>Child Column</label>
            <ui5-select @change="(e: any) => { const v = e.detail?.selectedOption?.getAttribute('value'); if (v) newChildColumn = v }">
              <ui5-option value="">Select...</ui5-option>
              <ui5-option v-for="attr in logicalModel.attributes" :key="attr.id" :value="attr.id" :selected="newChildColumn === attr.id">{{ attr.id }}</ui5-option>
            </ui5-select>
          </div>
        </template>
      </div>
      <div slot="footer" class="dialog-footer">
        <ui5-button design="Emphasized" @click="confirmAdd" :disabled="!newId.trim()">Add</ui5-button>
        <ui5-button design="Transparent" @click="showAddDialog = false">Cancel</ui5-button>
      </div>
    </ui5-dialog>
  </div>
</template>

<style scoped>
.hierarchies-tab { padding: 8px; }
.tab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.tab-title { font-size: 11px; font-weight: 600; color: var(--sapTextColor, #333); }
.hierarchy-item { border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9); border-radius: 6px; padding: 8px; margin-bottom: 6px; }
.hierarchy-header { display: flex; align-items: center; gap: 8px; }
.hierarchy-name { font-weight: 500; font-size: 12px; }
.hierarchy-type { color: var(--sapContent_LabelColor, #666); font-size: 10px; background: var(--sapList_HeaderBackground, #f2f2f2); padding: 2px 6px; border-radius: 4px; }
.hierarchy-levels { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.level-chip { font-size: 10px; background: var(--sapButton_Lite_Background, #f0f0f0); padding: 2px 6px; border-radius: 4px; }
.hierarchy-pc { font-size: 10px; color: var(--sapContent_LabelColor, #666); margin-top: 4px; }
.empty { padding: 16px; text-align: center; color: var(--sapContent_LabelColor, #666); font-size: 11px; }
.add-dialog-content { padding: 16px; min-width: 400px; display: flex; flex-direction: column; gap: 12px; }
.form-row { display: flex; flex-direction: column; gap: 4px; }
.form-row label { font-size: 11px; color: var(--sapContent_LabelColor, #666); }
.levels-section { border-top: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9); padding-top: 8px; }
.levels-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.level-row { display: flex; gap: 8px; align-items: center; margin-bottom: 4px; }
.level-row ui5-input { flex: 1; }
.level-row ui5-select { flex: 1; }
.dialog-footer { display: flex; gap: 8px; justify-content: flex-end; padding: 8px 16px; }
</style>
