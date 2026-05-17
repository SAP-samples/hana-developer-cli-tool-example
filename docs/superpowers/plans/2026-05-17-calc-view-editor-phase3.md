# Calculation View Editor Phase 3: Advanced Features

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add calculated columns with Monaco expression editor, filter expressions, input parameters/variable mappings, elkjs auto-layout, and multi-tab support to the Calculation View Editor.

**Architecture:** Each feature adds a new properties tab component + composable logic. The auto-layout composable wraps elkjs. Multi-tab state is managed via a new `useCalcViewTabs` composable that holds an array of editor instances, each with its own model and undo stack.

**Tech Stack:** Vue 3, TypeScript, @guolao/vue-monaco-editor (already installed), elkjs (already installed), @vue-flow/core, UI5 Web Components

---

## Task 1: Calculated Columns Tab with Monaco Editor

**Files:**
- Create: `app/vue/src/components/calcview/properties/CalculatedColumnsTab.vue`
- Modify: `app/vue/src/components/calcview/properties/PropertiesPanel.vue`
- Modify: `app/vue/src/composables/calcview/commands.ts`
- Modify: `app/vue/src/composables/calcview/useCalcViewModel.ts`

**Context:** Per spec (lines 206-211): Column list as selectable chips + "+ New" button, embedded Monaco editor for SQL expressions, properties grid (data type, aggregation type, label, hidden). The `CalculatedColumn` type already exists in `types.ts` with fields: `id`, `name`, `dataType`, `expression`, `aggregationType?`, `label?`. The `CalcViewNode` already has a `calculatedColumns: CalculatedColumn[]` array.

- [ ] **Step 1: Create AddCalculatedColumnCommand and RemoveCalculatedColumnCommand**

Add to `app/vue/src/composables/calcview/commands.ts`:

```typescript
export class AddCalculatedColumnCommand implements Command {
  type = 'addCalculatedColumn'
  description: string
  private model: Ref<CalcViewModel>
  private nodeId: string
  private column: CalculatedColumn

  constructor(model: Ref<CalcViewModel>, nodeId: string, column: CalculatedColumn) {
    this.model = model
    this.nodeId = nodeId
    this.column = column
    this.description = `Add calculated column ${column.id} to ${nodeId}`
  }

  execute() {
    const node = this.model.value.calculationViews.find(n => n.id === this.nodeId)
    if (node) node.calculatedColumns.push(this.column)
  }

  undo() {
    const node = this.model.value.calculationViews.find(n => n.id === this.nodeId)
    if (node) {
      const idx = node.calculatedColumns.findIndex(c => c.id === this.column.id)
      if (idx >= 0) node.calculatedColumns.splice(idx, 1)
    }
  }
}

export class RemoveCalculatedColumnCommand implements Command {
  type = 'removeCalculatedColumn'
  description: string
  private model: Ref<CalcViewModel>
  private nodeId: string
  private column: CalculatedColumn
  private removedIndex: number = -1

  constructor(model: Ref<CalcViewModel>, nodeId: string, columnId: string) {
    this.model = model
    this.nodeId = nodeId
    this.column = { id: '', name: '', dataType: '', expression: '' }
    this.description = `Remove calculated column ${columnId} from ${nodeId}`
    const node = model.value.calculationViews.find(n => n.id === nodeId)
    if (node) {
      const idx = node.calculatedColumns.findIndex(c => c.id === columnId)
      if (idx >= 0) {
        this.column = { ...node.calculatedColumns[idx] }
        this.removedIndex = idx
      }
    }
  }

  execute() {
    const node = this.model.value.calculationViews.find(n => n.id === this.nodeId)
    if (node) {
      const idx = node.calculatedColumns.findIndex(c => c.id === this.column.id)
      if (idx >= 0) node.calculatedColumns.splice(idx, 1)
    }
  }

  undo() {
    const node = this.model.value.calculationViews.find(n => n.id === this.nodeId)
    if (node) node.calculatedColumns.splice(this.removedIndex, 0, this.column)
  }
}

export class UpdateCalculatedColumnCommand implements Command {
  type = 'updateCalculatedColumn'
  description: string
  private model: Ref<CalcViewModel>
  private nodeId: string
  private columnId: string
  private updates: Partial<CalculatedColumn>
  private previous: Partial<CalculatedColumn> = {}

  constructor(model: Ref<CalcViewModel>, nodeId: string, columnId: string, updates: Partial<CalculatedColumn>) {
    this.model = model
    this.nodeId = nodeId
    this.columnId = columnId
    this.updates = updates
    this.description = `Update calculated column ${columnId}`
    const node = model.value.calculationViews.find(n => n.id === nodeId)
    if (node) {
      const col = node.calculatedColumns.find(c => c.id === columnId)
      if (col) {
        this.previous = {}
        for (const key of Object.keys(updates) as (keyof CalculatedColumn)[]) {
          (this.previous as any)[key] = col[key]
        }
      }
    }
  }

  execute() {
    const node = this.model.value.calculationViews.find(n => n.id === this.nodeId)
    if (node) {
      const col = node.calculatedColumns.find(c => c.id === this.columnId)
      if (col) Object.assign(col, this.updates)
    }
  }

  undo() {
    const node = this.model.value.calculationViews.find(n => n.id === this.nodeId)
    if (node) {
      const col = node.calculatedColumns.find(c => c.id === this.columnId)
      if (col) Object.assign(col, this.previous)
    }
  }
}
```

- [ ] **Step 2: Add composable methods for calculated columns**

In `useCalcViewModel.ts`, add:

```typescript
function addCalculatedColumn(nodeId: string, column: CalculatedColumn) {
  if (!model.value) return
  undoRedo.push(new AddCalculatedColumnCommand(model as Ref<CalcViewModel>, nodeId, column))
}

function removeCalculatedColumn(nodeId: string, columnId: string) {
  if (!model.value) return
  undoRedo.push(new RemoveCalculatedColumnCommand(model as Ref<CalcViewModel>, nodeId, columnId))
}

function updateCalculatedColumn(nodeId: string, columnId: string, updates: Partial<CalculatedColumn>) {
  if (!model.value) return
  undoRedo.push(new UpdateCalculatedColumnCommand(model as Ref<CalcViewModel>, nodeId, columnId, updates))
}
```

Return these from the composable.

- [ ] **Step 3: Create CalculatedColumnsTab.vue**

```vue
<!-- app/vue/src/components/calcview/properties/CalculatedColumnsTab.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import type { CalcViewNode, CalculatedColumn } from '../../../services/calcview/types'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import '@ui5/webcomponents/dist/CheckBox.js'

const props = defineProps<{
  node: CalcViewNode
}>()

const emit = defineEmits<{
  'add-column': [column: CalculatedColumn]
  'remove-column': [columnId: string]
  'update-column': [columnId: string, updates: Partial<CalculatedColumn>]
}>()

const selectedColumnId = ref<string | null>(null)

const selectedColumn = computed(() => {
  if (!selectedColumnId.value) return null
  return props.node.calculatedColumns.find(c => c.id === selectedColumnId.value) ?? null
})

const availableColumns = computed(() => {
  return props.node.outputColumns.map(c => c.name)
})

function addNewColumn() {
  const id = `CC_${Date.now()}`
  emit('add-column', {
    id,
    name: id,
    dataType: 'NVARCHAR',
    expression: ''
  })
  selectedColumnId.value = id
}

function removeColumn(columnId: string) {
  emit('remove-column', columnId)
  if (selectedColumnId.value === columnId) {
    selectedColumnId.value = null
  }
}

function onExpressionChange(value: string | undefined) {
  if (selectedColumnId.value && value !== undefined) {
    emit('update-column', selectedColumnId.value, { expression: value })
  }
}

function onNameChange(e: any) {
  if (selectedColumnId.value) {
    emit('update-column', selectedColumnId.value, { name: e.target.value })
  }
}

function onDataTypeChange(e: any) {
  if (selectedColumnId.value) {
    emit('update-column', selectedColumnId.value, { dataType: e.detail.selectedOption.value })
  }
}
</script>

<template>
  <div class="calculated-columns-tab">
    <!-- Column chips -->
    <div class="column-chips">
      <div
        v-for="col in node.calculatedColumns"
        :key="col.id"
        class="chip"
        :class="{ selected: selectedColumnId === col.id }"
        @click="selectedColumnId = col.id"
      >
        <span>{{ col.name }}</span>
        <ui5-button design="Transparent" icon="decline" @click.stop="removeColumn(col.id)" />
      </div>
      <ui5-button design="Transparent" @click="addNewColumn">+ New</ui5-button>
    </div>

    <!-- Expression editor -->
    <div v-if="selectedColumn" class="editor-section">
      <div class="props-row">
        <label>Name:</label>
        <ui5-input :value="selectedColumn.name" @change="onNameChange" />
      </div>
      <div class="props-row">
        <label>Type:</label>
        <ui5-select @change="onDataTypeChange">
          <ui5-option v-for="dt in ['NVARCHAR', 'INTEGER', 'BIGINT', 'DECIMAL', 'DATE', 'TIMESTAMP']" :key="dt" :value="dt" :selected="selectedColumn.dataType === dt">{{ dt }}</ui5-option>
        </ui5-select>
      </div>
      <div class="monaco-wrapper">
        <VueMonacoEditor
          :value="selectedColumn.expression"
          language="sql"
          :options="{ minimap: { enabled: false }, lineNumbers: 'off', fontSize: 12, scrollBeyondLastLine: false, wordWrap: 'on', automaticLayout: true }"
          theme="vs"
          height="120px"
          @change="onExpressionChange"
        />
      </div>
      <div class="available-cols">
        <span class="label">Available columns:</span>
        <span v-for="col in availableColumns" :key="col" class="avail-chip">{{ col }}</span>
      </div>
    </div>
    <div v-else class="no-selection">
      Select a calculated column or add a new one
    </div>
  </div>
</template>

<style scoped>
.calculated-columns-tab {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.column-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  border-radius: 16px;
  font-size: 11px;
  cursor: pointer;
  background: var(--sapButton_Lite_Background, #f5f6f7);
}

.chip.selected {
  border-color: var(--sapSelectedColor, #0854a0);
  background: var(--sapInfobar_Background, #e5f0fa);
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.props-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.props-row label {
  width: 50px;
  color: var(--sapContent_LabelColor, #666);
}

.props-row ui5-input, .props-row ui5-select {
  flex: 1;
}

.monaco-wrapper {
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  border-radius: 4px;
  overflow: hidden;
}

.available-cols {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.available-cols .label {
  font-size: 10px;
  color: var(--sapContent_LabelColor, #666);
}

.avail-chip {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--sapButton_Lite_Background, #f5f6f7);
  border-radius: 4px;
  font-family: monospace;
}

.no-selection {
  color: var(--sapContent_LabelColor, #666);
  font-size: 11px;
  padding: 8px 0;
}
</style>
```

- [ ] **Step 4: Add "Calculated Columns" tab to PropertiesPanel**

In `PropertiesPanel.vue`, import `CalculatedColumnsTab` and add a second `<ui5-tab>` for it within the `<ui5-tabcontainer>`. Wire events through PropertiesPanel to emit up to the editor.

Add emits:
```typescript
'add-calculated-column': [nodeId: string, column: CalculatedColumn]
'remove-calculated-column': [nodeId: string, columnId: string]
'update-calculated-column': [nodeId: string, columnId: string, updates: Partial<CalculatedColumn>]
```

- [ ] **Step 5: Wire events in CalcViewEditor.vue**

Add event listeners on PropertiesPanel and call composable methods:
```vue
@add-calculated-column="(nodeId, col) => addCalculatedColumn(nodeId, col)"
@remove-calculated-column="(nodeId, colId) => removeCalculatedColumn(nodeId, colId)"
@update-calculated-column="(nodeId, colId, updates) => updateCalculatedColumn(nodeId, colId, updates)"
```

- [ ] **Step 6: Run tests and commit**

```bash
cd app/vue && npx vitest run
git add app/vue/src/components/calcview/properties/CalculatedColumnsTab.vue app/vue/src/components/calcview/properties/PropertiesPanel.vue app/vue/src/composables/calcview/commands.ts app/vue/src/composables/calcview/useCalcViewModel.ts app/vue/src/views/CalcViewEditor.vue
git commit -m "feat(calcview): add calculated columns tab with Monaco expression editor"
```

---

## Task 2: Filter Expression Tab

**Files:**
- Create: `app/vue/src/components/calcview/properties/FilterTab.vue`
- Modify: `app/vue/src/components/calcview/properties/PropertiesPanel.vue`
- Modify: `app/vue/src/composables/calcview/commands.ts`
- Modify: `app/vue/src/composables/calcview/useCalcViewModel.ts`

**Context:** Per spec (lines 213-217): Monaco editor with SQL WHERE clause syntax, autocomplete from available columns. The `CalcViewNode` already has `filterExpression?: string`. We need a command to update it and a Monaco-based editor tab.

- [ ] **Step 1: Create SetFilterExpressionCommand**

Add to `commands.ts`:

```typescript
export class SetFilterExpressionCommand implements Command {
  type = 'setFilterExpression'
  description: string
  private model: Ref<CalcViewModel>
  private nodeId: string
  private newExpression: string | undefined
  private previousExpression: string | undefined

  constructor(model: Ref<CalcViewModel>, nodeId: string, expression: string | undefined) {
    this.model = model
    this.nodeId = nodeId
    this.newExpression = expression
    this.description = `Set filter on ${nodeId}`
    const node = model.value.calculationViews.find(n => n.id === nodeId)
    this.previousExpression = node?.filterExpression
  }

  execute() {
    const node = this.model.value.calculationViews.find(n => n.id === this.nodeId)
    if (node) node.filterExpression = this.newExpression
  }

  undo() {
    const node = this.model.value.calculationViews.find(n => n.id === this.nodeId)
    if (node) node.filterExpression = this.previousExpression
  }
}
```

- [ ] **Step 2: Add composable method**

In `useCalcViewModel.ts`:
```typescript
function setFilterExpression(nodeId: string, expression: string | undefined) {
  if (!model.value) return
  undoRedo.push(new SetFilterExpressionCommand(model as Ref<CalcViewModel>, nodeId, expression))
}
```

- [ ] **Step 3: Create FilterTab.vue**

```vue
<!-- app/vue/src/components/calcview/properties/FilterTab.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import type { CalcViewNode } from '../../../services/calcview/types'
import '@ui5/webcomponents/dist/Button.js'

const props = defineProps<{
  node: CalcViewNode
}>()

const emit = defineEmits<{
  'set-filter': [expression: string | undefined]
}>()

const hasFilter = computed(() => !!props.node.filterExpression)

function onExpressionChange(value: string | undefined) {
  emit('set-filter', value || undefined)
}

function clearFilter() {
  emit('set-filter', undefined)
}
</script>

<template>
  <div class="filter-tab">
    <div class="filter-header">
      <span class="label">WHERE clause filter</span>
      <ui5-button v-if="hasFilter" design="Transparent" @click="clearFilter">Clear</ui5-button>
    </div>
    <div class="monaco-wrapper">
      <VueMonacoEditor
        :value="node.filterExpression || ''"
        language="sql"
        :options="{ minimap: { enabled: false }, lineNumbers: 'off', fontSize: 12, scrollBeyondLastLine: false, wordWrap: 'on', automaticLayout: true, placeholder: 'e.g. \"AMOUNT\" > 100' }"
        theme="vs"
        height="100px"
        @change="onExpressionChange"
      />
    </div>
    <div class="available-cols">
      <span class="label">Available columns:</span>
      <span v-for="col in node.outputColumns" :key="col.id" class="avail-chip">{{ col.name }}</span>
    </div>
  </div>
</template>

<style scoped>
.filter-tab {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-header .label {
  font-size: 11px;
  font-weight: 600;
  color: var(--sapTextColor, #333);
}

.monaco-wrapper {
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  border-radius: 4px;
  overflow: hidden;
}

.available-cols {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.available-cols .label {
  font-size: 10px;
  color: var(--sapContent_LabelColor, #666);
}

.avail-chip {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--sapButton_Lite_Background, #f5f6f7);
  border-radius: 4px;
  font-family: monospace;
}
</style>
```

- [ ] **Step 4: Add "Filter" tab to PropertiesPanel and wire events**

Add a third `<ui5-tab text="Filter">` containing `FilterTab`. Add emit `'set-filter': [nodeId: string, expression: string | undefined]` to PropertiesPanel and wire in CalcViewEditor.

- [ ] **Step 5: Run tests and commit**

```bash
cd app/vue && npx vitest run
git add app/vue/src/components/calcview/properties/FilterTab.vue app/vue/src/components/calcview/properties/PropertiesPanel.vue app/vue/src/composables/calcview/commands.ts app/vue/src/composables/calcview/useCalcViewModel.ts app/vue/src/views/CalcViewEditor.vue
git commit -m "feat(calcview): add filter expression tab with Monaco editor"
```

---

## Task 3: Input Parameters & Variable Mappings Tab

**Files:**
- Create: `app/vue/src/components/calcview/properties/ParametersTab.vue`
- Modify: `app/vue/src/components/calcview/properties/PropertiesPanel.vue`
- Modify: `app/vue/src/composables/calcview/commands.ts`
- Modify: `app/vue/src/composables/calcview/useCalcViewModel.ts`
- Modify: `app/vue/src/services/calcview/xmlParser.ts`
- Modify: `app/vue/src/services/calcview/xmlSerializer.ts`

**Context:** The types `Variable` and `VariableMapping` are already defined in `types.ts`. The parser already handles `localVariables` and `variableMappings` at the view level. This tab shows view-level variables (not per-node) and allows CRUD. The PropertiesPanel shows this tab when the Semantics node is selected.

- [ ] **Step 1: Create variable management commands**

Add to `commands.ts`:

```typescript
export class AddVariableCommand implements Command {
  type = 'addVariable'
  description: string
  private model: Ref<CalcViewModel>
  private variable: Variable

  constructor(model: Ref<CalcViewModel>, variable: Variable) {
    this.model = model
    this.variable = variable
    this.description = `Add variable ${variable.id}`
  }

  execute() { this.model.value.localVariables.push(this.variable) }
  undo() {
    const idx = this.model.value.localVariables.findIndex(v => v.id === this.variable.id)
    if (idx >= 0) this.model.value.localVariables.splice(idx, 1)
  }
}

export class RemoveVariableCommand implements Command {
  type = 'removeVariable'
  description: string
  private model: Ref<CalcViewModel>
  private variable: Variable
  private removedIndex: number = -1

  constructor(model: Ref<CalcViewModel>, variableId: string) {
    this.model = model
    this.variable = { id: '', name: '', dataType: '' }
    this.description = `Remove variable ${variableId}`
    const idx = model.value.localVariables.findIndex(v => v.id === variableId)
    if (idx >= 0) {
      this.variable = { ...model.value.localVariables[idx] }
      this.removedIndex = idx
    }
  }

  execute() {
    const idx = this.model.value.localVariables.findIndex(v => v.id === this.variable.id)
    if (idx >= 0) this.model.value.localVariables.splice(idx, 1)
  }

  undo() {
    this.model.value.localVariables.splice(this.removedIndex, 0, this.variable)
  }
}

export class UpdateVariableCommand implements Command {
  type = 'updateVariable'
  description: string
  private model: Ref<CalcViewModel>
  private variableId: string
  private updates: Partial<Variable>
  private previous: Partial<Variable> = {}

  constructor(model: Ref<CalcViewModel>, variableId: string, updates: Partial<Variable>) {
    this.model = model
    this.variableId = variableId
    this.updates = updates
    this.description = `Update variable ${variableId}`
    const v = model.value.localVariables.find(x => x.id === variableId)
    if (v) {
      for (const key of Object.keys(updates) as (keyof Variable)[]) {
        (this.previous as any)[key] = v[key]
      }
    }
  }

  execute() {
    const v = this.model.value.localVariables.find(x => x.id === this.variableId)
    if (v) Object.assign(v, this.updates)
  }

  undo() {
    const v = this.model.value.localVariables.find(x => x.id === this.variableId)
    if (v) Object.assign(v, this.previous)
  }
}
```

- [ ] **Step 2: Add composable methods**

```typescript
function addVariable(variable: Variable) {
  if (!model.value) return
  undoRedo.push(new AddVariableCommand(model as Ref<CalcViewModel>, variable))
}

function removeVariable(variableId: string) {
  if (!model.value) return
  undoRedo.push(new RemoveVariableCommand(model as Ref<CalcViewModel>, variableId))
}

function updateVariable(variableId: string, updates: Partial<Variable>) {
  if (!model.value) return
  undoRedo.push(new UpdateVariableCommand(model as Ref<CalcViewModel>, variableId, updates))
}
```

- [ ] **Step 3: Create ParametersTab.vue**

```vue
<!-- app/vue/src/components/calcview/properties/ParametersTab.vue -->
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
      <div v-if="model.localVariables.length === 0" class="empty">No input parameters</div>
    </div>

    <div v-if="selectedVarId" class="var-detail">
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

.var-name { font-weight: 500; }
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
```

- [ ] **Step 4: Show ParametersTab in ViewPropertiesTab area for Semantics node**

Update `PropertiesPanel.vue` to include a "Parameters" section when the Semantics node is selected. Add the ParametersTab below (or as a tab within) the ViewPropertiesTab content when `selectedNodeId === '__semantics__'`.

- [ ] **Step 5: Wire events in CalcViewEditor and run tests**

```bash
cd app/vue && npx vitest run
git add app/vue/src/components/calcview/properties/ParametersTab.vue app/vue/src/components/calcview/properties/PropertiesPanel.vue app/vue/src/composables/calcview/commands.ts app/vue/src/composables/calcview/useCalcViewModel.ts app/vue/src/views/CalcViewEditor.vue
git commit -m "feat(calcview): add input parameters tab with CRUD and variable management"
```

---

## Task 4: Auto-Layout with elkjs

**Files:**
- Create: `app/vue/src/composables/calcview/useCalcViewLayout.ts`
- Create: `app/vue/src/components/calcview/toolbar/EditorToolbar.vue`
- Modify: `app/vue/src/views/CalcViewEditor.vue`
- Modify: `app/vue/src/composables/calcview/commands.ts`

**Context:** Per spec: auto-layout using elkjs with bottom-to-top hierarchical layout. The toolbar shows an "Auto Layout" button. elkjs is already installed. Layout mutates `LayoutInfo.shapes[n].upperLeftCorner` via a batch of `MoveNodeCommand`s so it can be undone.

- [ ] **Step 1: Create MoveNodeCommand**

Add to `commands.ts`:

```typescript
export class MoveNodeCommand implements Command {
  type = 'moveNode'
  description: string
  private model: Ref<CalcViewModel>
  private nodeId: string
  private newPosition: { x: number; y: number }
  private previousPosition: { x: number; y: number }

  constructor(model: Ref<CalcViewModel>, nodeId: string, newPosition: { x: number; y: number }) {
    this.model = model
    this.nodeId = nodeId
    this.newPosition = newPosition
    this.description = `Move ${nodeId}`
    const shape = model.value.layout.shapes.find(s => s.modelObjectName === nodeId)
      ?? model.value.layout.shapes.find(s => s.modelObjectName === 'Output' && nodeId === '__semantics__')
    this.previousPosition = shape ? { ...shape.upperLeftCorner } : { x: 0, y: 0 }
  }

  execute() {
    const shapeName = this.nodeId === '__semantics__' ? 'Output' : this.nodeId
    const shape = this.model.value.layout.shapes.find(s => s.modelObjectName === shapeName)
    if (shape) {
      shape.upperLeftCorner.x = this.newPosition.x
      shape.upperLeftCorner.y = this.newPosition.y
    }
  }

  undo() {
    const shapeName = this.nodeId === '__semantics__' ? 'Output' : this.nodeId
    const shape = this.model.value.layout.shapes.find(s => s.modelObjectName === shapeName)
    if (shape) {
      shape.upperLeftCorner.x = this.previousPosition.x
      shape.upperLeftCorner.y = this.previousPosition.y
    }
  }
}
```

- [ ] **Step 2: Create useCalcViewLayout.ts**

```typescript
// app/vue/src/composables/calcview/useCalcViewLayout.ts
import ELK from 'elkjs/lib/elk.bundled.js'
import type { Ref } from 'vue'
import type { CalcViewModel } from '../../services/calcview/types'
import { MoveNodeCommand } from './commands'
import { BatchCommand } from './commands'
import type { createUndoRedoStack } from './useCalcViewUndoRedo'

const elk = new ELK()

export async function autoLayout(
  model: Ref<CalcViewModel>,
  undoRedo: ReturnType<typeof createUndoRedoStack>
) {
  const m = model.value
  if (!m) return

  // Build elk graph
  const nodes: any[] = []
  const edges: any[] = []

  // Semantics node
  nodes.push({ id: '__semantics__', width: 200, height: 60 })

  // Calc view nodes
  for (const cvNode of m.calculationViews) {
    nodes.push({ id: cvNode.id, width: 180, height: 50 })
  }

  // Edges (child → parent direction for elk, then we flip)
  const nodeIds = m.calculationViews.map(n => n.id)
  for (const cvNode of m.calculationViews) {
    const hasParent = m.calculationViews.some(
      other => other.inputs.some(i => i.node === cvNode.id)
    )
    if (!hasParent) {
      edges.push({ id: `e-${cvNode.id}-sem`, sources: [cvNode.id], targets: ['__semantics__'] })
    }
    for (const input of cvNode.inputs) {
      if (nodeIds.includes(input.node)) {
        edges.push({ id: `e-${input.node}-${cvNode.id}`, sources: [input.node], targets: [cvNode.id] })
      }
    }
  }

  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'UP',
      'elk.spacing.nodeNode': '80',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
      'elk.padding': '[top=50,left=50,bottom=50,right=50]'
    },
    children: nodes,
    edges
  }

  const layout = await elk.layout(graph)

  // Build move commands
  const commands: MoveNodeCommand[] = []
  for (const child of layout.children || []) {
    const x = Math.round(child.x ?? 0)
    const y = Math.round(child.y ?? 0)
    commands.push(new MoveNodeCommand(model, child.id, { x, y }))
  }

  if (commands.length > 0) {
    undoRedo.push(new BatchCommand(commands, 'Auto-layout'))
  }
}
```

- [ ] **Step 3: Create EditorToolbar.vue**

```vue
<!-- app/vue/src/components/calcview/toolbar/EditorToolbar.vue -->
<script setup lang="ts">
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/ToolbarButton.js'

const props = defineProps<{
  canUndo: boolean
  canRedo: boolean
}>()

const emit = defineEmits<{
  'undo': []
  'redo': []
  'auto-layout': []
}>()
</script>

<template>
  <div class="editor-toolbar">
    <ui5-button design="Transparent" icon="undo" :disabled="!canUndo" @click="emit('undo')" tooltip="Undo (Ctrl+Z)" />
    <ui5-button design="Transparent" icon="redo" :disabled="!canRedo" @click="emit('redo')" tooltip="Redo (Ctrl+Y)" />
    <div class="separator" />
    <ui5-button design="Transparent" icon="resize" @click="emit('auto-layout')" tooltip="Auto Layout" />
  </div>
</template>

<style scoped>
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  background: var(--sapPageHeader_Background, #fff);
}

.separator {
  width: 1px;
  height: 20px;
  background: var(--sapGroup_ContentBorderColor, #d9d9d9);
  margin: 0 4px;
}
</style>
```

- [ ] **Step 4: Wire toolbar and auto-layout in CalcViewEditor.vue**

Add `EditorToolbar` above the canvas area. Import `autoLayout` from `useCalcViewLayout` and call it when the auto-layout button is clicked. Pass `undoRedo.canUndo` and `undoRedo.canRedo` as props.

- [ ] **Step 5: Run tests and commit**

```bash
cd app/vue && npx vitest run
git add app/vue/src/composables/calcview/useCalcViewLayout.ts app/vue/src/composables/calcview/commands.ts app/vue/src/components/calcview/toolbar/EditorToolbar.vue app/vue/src/views/CalcViewEditor.vue
git commit -m "feat(calcview): add elkjs auto-layout with undo support and editor toolbar"
```

---

## Task 5: Multi-Tab Support

**Files:**
- Create: `app/vue/src/composables/calcview/useCalcViewTabs.ts`
- Create: `app/vue/src/components/calcview/tabs/EditorTabBar.vue`
- Modify: `app/vue/src/views/CalcViewEditor.vue`

**Context:** Per spec (lines 257-270): Multiple Calculation Views open simultaneously in tabs. Each tab has its own model and undo stack. Tab shows file name + dirty indicator. Close tab prompts if unsaved. The `useCalcViewUndoRedo` already has `isDirty` (pointer !== savedPointer) and `markSaved()`.

- [ ] **Step 1: Create useCalcViewTabs.ts**

```typescript
// app/vue/src/composables/calcview/useCalcViewTabs.ts
import { ref, computed } from 'vue'
import { useCalcViewModel } from './useCalcViewModel'

export interface CalcViewTab {
  id: string
  title: string
  filePath?: string
  editor: ReturnType<typeof useCalcViewModel>
}

export function useCalcViewTabs() {
  const tabs = ref<CalcViewTab[]>([])
  const activeTabId = ref<string | null>(null)

  const activeTab = computed(() => {
    return tabs.value.find(t => t.id === activeTabId.value) ?? null
  })

  function openTab(title: string, filePath?: string): CalcViewTab {
    const existing = filePath ? tabs.value.find(t => t.filePath === filePath) : null
    if (existing) {
      activeTabId.value = existing.id
      return existing
    }

    const id = `tab_${Date.now()}`
    const editor = useCalcViewModel()
    const tab: CalcViewTab = { id, title, filePath, editor }
    tabs.value.push(tab)
    activeTabId.value = id
    return tab
  }

  function closeTab(tabId: string): boolean {
    const tab = tabs.value.find(t => t.id === tabId)
    if (!tab) return true
    if (tab.editor.undoRedo.isDirty.value) return false

    const idx = tabs.value.findIndex(t => t.id === tabId)
    tabs.value.splice(idx, 1)

    if (activeTabId.value === tabId) {
      activeTabId.value = tabs.value.length > 0
        ? tabs.value[Math.min(idx, tabs.value.length - 1)].id
        : null
    }
    return true
  }

  function forceCloseTab(tabId: string) {
    const idx = tabs.value.findIndex(t => t.id === tabId)
    if (idx < 0) return
    tabs.value.splice(idx, 1)
    if (activeTabId.value === tabId) {
      activeTabId.value = tabs.value.length > 0
        ? tabs.value[Math.min(idx, tabs.value.length - 1)].id
        : null
    }
  }

  return { tabs, activeTabId, activeTab, openTab, closeTab, forceCloseTab }
}
```

- [ ] **Step 2: Create EditorTabBar.vue**

```vue
<!-- app/vue/src/components/calcview/tabs/EditorTabBar.vue -->
<script setup lang="ts">
import type { CalcViewTab } from '../../../composables/calcview/useCalcViewTabs'
import '@ui5/webcomponents/dist/TabContainer.js'
import '@ui5/webcomponents/dist/Tab.js'

const props = defineProps<{
  tabs: CalcViewTab[]
  activeTabId: string | null
}>()

const emit = defineEmits<{
  'select-tab': [tabId: string]
  'close-tab': [tabId: string]
}>()

function isDirty(tab: CalcViewTab): boolean {
  return tab.editor.undoRedo.isDirty.value
}
</script>

<template>
  <div class="tab-bar" v-if="tabs.length > 0">
    <div
      v-for="tab in tabs"
      :key="tab.id"
      class="tab-item"
      :class="{ active: activeTabId === tab.id }"
      @click="emit('select-tab', tab.id)"
    >
      <span class="tab-title">{{ tab.title }}</span>
      <span v-if="isDirty(tab)" class="dirty-dot" />
      <button class="close-btn" @click.stop="emit('close-tab', tab.id)">&times;</button>
    </div>
  </div>
</template>

<style scoped>
.tab-bar {
  display: flex;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  background: var(--sapPageHeader_Background, #fff);
  overflow-x: auto;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  cursor: pointer;
  border-right: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  font-size: 12px;
  white-space: nowrap;
}

.tab-item.active {
  background: var(--sapGroup_ContentBackground, #fff);
  border-bottom: 2px solid var(--sapSelectedColor, #0854a0);
}

.tab-title {
  color: var(--sapTextColor, #333);
}

.dirty-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--sapWarningColor, #e78c07);
}

.close-btn {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--sapContent_LabelColor, #666);
  padding: 0 2px;
}

.close-btn:hover {
  color: var(--sapNegativeColor, #bb0000);
}
</style>
```

- [ ] **Step 3: Integrate tabs into CalcViewEditor.vue**

Refactor CalcViewEditor to use `useCalcViewTabs()`. The demo XML opens as the first tab. The active tab's editor provides the model, vueFlowNodes, vueFlowEdges, etc. All existing event handlers delegate to `activeTab.value.editor.*`.

- [ ] **Step 4: Run tests and commit**

```bash
cd app/vue && npx vitest run
git add app/vue/src/composables/calcview/useCalcViewTabs.ts app/vue/src/components/calcview/tabs/EditorTabBar.vue app/vue/src/views/CalcViewEditor.vue
git commit -m "feat(calcview): add multi-tab support with per-tab undo stack and dirty tracking"
```

---

## Task 6: Parser/Serializer Extensions for Calculated Columns and Filters

**Files:**
- Create: `app/vue/src/services/calcview/__tests__/fixtures/calculated.hdbcalculationview`
- Modify: `app/vue/src/services/calcview/xmlParser.ts`
- Modify: `app/vue/src/services/calcview/xmlSerializer.ts`
- Modify: `app/vue/src/services/calcview/__tests__/xmlParser.test.ts`
- Modify: `app/vue/src/services/calcview/__tests__/xmlSerializer.test.ts`

**Context:** Calculated columns in the XML appear as `<calculatedViewAttributes>` within a `<calculationView>` element. Filter expressions appear as `<filter><formula>&quot;AMOUNT&quot; &gt; 100</formula></filter>`. The parser currently ignores both.

- [ ] **Step 1: Create fixture with calculated column and filter**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Calculation:scenario xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore" id="CALC_TEST" applyPrivilegeType="NONE" dataCategory="CUBE">
  <descriptions defaultDescription="Calculated Column Test"/>
  <localVariables/>
  <variableMappings/>
  <dataSources>
    <DataSource id="SALES"><resourceUri>SALES</resourceUri></DataSource>
  </dataSources>
  <calculationViews>
    <calculationView xsi:type="Calculation:ProjectionView" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Projection_1">
      <viewAttributes>
        <viewAttribute id="AMOUNT"/>
        <viewAttribute id="PRODUCT_ID"/>
      </viewAttributes>
      <calculatedViewAttributes>
        <calculatedViewAttribute id="DOUBLE_AMOUNT" datatype="DECIMAL" expressionLanguage="SQL">
          <formula>"AMOUNT" * 2</formula>
        </calculatedViewAttribute>
      </calculatedViewAttributes>
      <input node="SALES"/>
      <filter>
        <formula>"AMOUNT" &gt; 100</formula>
      </filter>
    </calculationView>
  </calculationViews>
  <logicalModel id="Projection_1">
    <attributes>
      <attribute id="PRODUCT_ID"><descriptions defaultDescription="Product"/></attribute>
    </attributes>
    <calculatedAttributes/>
    <baseMeasures>
      <measure id="AMOUNT" aggregationType="sum"><descriptions defaultDescription="Amount"/></measure>
    </baseMeasures>
    <calculatedMeasures/>
    <restrictedMeasures/>
  </logicalModel>
  <layout>
    <shapes>
      <shape expanded="true" modelObjectName="Output" modelObjectNameSpace="MeasureGroup">
        <upperLeftCorner x="200" y="50"/>
      </shape>
      <shape expanded="true" modelObjectName="Projection_1" modelObjectNameSpace="CalculationView">
        <upperLeftCorner x="200" y="250"/>
      </shape>
    </shapes>
  </layout>
</Calculation:scenario>
```

- [ ] **Step 2: Add tests for calculated column and filter parsing**

```typescript
it('parses calculated columns and filter expression', () => {
  const xml = loadFixture('calculated.hdbcalculationview')
  const model = parseCalcView(xml)

  const node = model.calculationViews[0]
  expect(node.calculatedColumns).toHaveLength(1)
  expect(node.calculatedColumns[0].id).toBe('DOUBLE_AMOUNT')
  expect(node.calculatedColumns[0].dataType).toBe('DECIMAL')
  expect(node.calculatedColumns[0].expression).toBe('"AMOUNT" * 2')
  expect(node.filterExpression).toBe('"AMOUNT" > 100')
})
```

Add round-trip test in serializer test file.

- [ ] **Step 3: Update parser**

In `xmlParser.ts`:
- Add `'calculatedViewAttribute'` to the `isArray` callback
- In `parseCalcViewNode`, extract `calculatedViewAttributes`:

```typescript
function parseCalculatedViewAttributes(cva: any): CalculatedColumn[] {
  if (!cva || !cva.calculatedViewAttribute) return []
  const list = Array.isArray(cva.calculatedViewAttribute) ? cva.calculatedViewAttribute : [cva.calculatedViewAttribute]
  return list.map((a: any) => ({
    id: a['@_id'],
    name: a['@_id'],
    dataType: a['@_datatype'] || 'NVARCHAR',
    expression: a.formula || '',
    aggregationType: a['@_aggregationType']
  }))
}
```

For filter expression:
```typescript
const filterExpression = node.filter?.formula || undefined
```

- [ ] **Step 4: Update serializer**

In `serializeNode`, add calculated columns and filter:
```typescript
...(node.calculatedColumns.length > 0 ? {
  calculatedViewAttributes: {
    calculatedViewAttribute: node.calculatedColumns.map(c => ({
      '@_id': c.id,
      '@_datatype': c.dataType,
      '@_expressionLanguage': 'SQL',
      formula: c.expression
    }))
  }
} : { calculatedViewAttributes: '' }),
...(node.filterExpression ? {
  filter: { formula: node.filterExpression }
} : {})
```

- [ ] **Step 5: Run tests and commit**

```bash
cd app/vue && npx vitest run
git add app/vue/src/services/calcview/__tests__/fixtures/calculated.hdbcalculationview app/vue/src/services/calcview/xmlParser.ts app/vue/src/services/calcview/xmlSerializer.ts app/vue/src/services/calcview/__tests__/xmlParser.test.ts app/vue/src/services/calcview/__tests__/xmlSerializer.test.ts
git commit -m "feat(calcview): parse and serialize calculated columns and filter expressions"
```

---

## Summary

| Task | Description | Key Components |
|------|-------------|----------------|
| 1 | Calculated Columns Tab | CalculatedColumnsTab.vue + Monaco editor + 3 commands |
| 2 | Filter Expression Tab | FilterTab.vue + Monaco editor + 1 command |
| 3 | Input Parameters Tab | ParametersTab.vue + 3 commands |
| 4 | Auto-Layout with elkjs | useCalcViewLayout.ts + EditorToolbar.vue + MoveNodeCommand |
| 5 | Multi-Tab Support | useCalcViewTabs.ts + EditorTabBar.vue |
| 6 | Parser/Serializer for Calculated Columns + Filters | fixture + parser + serializer + tests |

**Estimated time:** ~30-45 minutes per task via subagent
