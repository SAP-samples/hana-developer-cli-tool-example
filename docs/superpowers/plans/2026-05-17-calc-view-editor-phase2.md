# Calc View Editor — Phase 2 (Core Editing) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all 10 node types rendered on the canvas, interactive edge connections (add/remove), column mapping via drag & drop, a join condition builder, and a command-pattern undo/redo system.

**Architecture:** Extends Phase 1 foundation. New node Vue components share a base pattern (same `data` shape, dynamic border color from theme variable, Handle positions based on node role). The undo/redo system uses a Command pattern with `execute()/undo()` methods and a pointer-based stack. Column mapping uses a three-column drag-and-drop layout in the properties panel. All model mutations go through the command stack.

**Tech Stack:** Vue 3 + TypeScript, @vue-flow/core v1.48, Vitest, UI5 Web Components (for properties panel inputs/buttons)

**Spec:** `docs/superpowers/specs/2026-05-16-calc-view-editor-design.md` (lines 132-220 for nodes/properties, lines 600-639 for undo/redo)

---

## File Structure

### New Files
```
app/vue/src/composables/calcview/useCalcViewUndoRedo.ts     # Command stack with execute/undo/redo/dirty state
app/vue/src/composables/calcview/commands.ts                 # All Command classes (AddNode, RemoveNode, Connect, etc.)
app/vue/src/components/calcview/canvas/nodes/GenericNode.vue  # Shared node component for most types
app/vue/src/components/calcview/canvas/nodes/JoinNode.vue     # Join-specific node (two input handles)
app/vue/src/components/calcview/properties/MappingTab.vue     # Three-column DnD column mapping
app/vue/src/components/calcview/properties/JoinConditionSection.vue  # Join condition chip builder
app/vue/src/services/calcview/__tests__/undoRedo.test.ts      # Undo/redo stack tests
app/vue/src/services/calcview/__tests__/commands.test.ts      # Command execute/undo tests
app/vue/src/services/calcview/__tests__/fixtures/join.hdbcalculationview  # Join fixture for tests
```

### Modified Files
```
app/vue/src/components/calcview/canvas/CalcViewCanvas.vue     # Register new node types + edge connect/remove handlers
app/vue/src/composables/calcview/useCalcViewModel.ts          # Add mutation methods, integrate undo/redo, map all node types
app/vue/src/views/CalcViewEditor.vue                          # Wire undo/redo, pass selected node data to properties panel
app/vue/src/components/calcview/properties/PropertiesPanel.vue # Tab routing per node type, render MappingTab
app/vue/src/services/calcview/xmlParser.ts                    # Parse join conditions, union/rank config (extend existing)
app/vue/src/services/calcview/xmlSerializer.ts                # Serialize join conditions, union/rank config
app/vue/src/services/calcview/__tests__/xmlParser.test.ts     # Add join fixture parse test
app/vue/src/services/calcview/__tests__/xmlSerializer.test.ts # Add join round-trip test
```

---

## Task 1: Undo/Redo Command Stack

**Files:**
- Create: `app/vue/src/composables/calcview/useCalcViewUndoRedo.ts`
- Test: `app/vue/src/services/calcview/__tests__/undoRedo.test.ts`

- [ ] **Step 1: Write failing tests for undo/redo stack**

```typescript
// app/vue/src/services/calcview/__tests__/undoRedo.test.ts
import { describe, it, expect } from 'vitest'
import { createUndoRedoStack } from '../../../composables/calcview/useCalcViewUndoRedo'
import type { Command } from '../../../composables/calcview/useCalcViewUndoRedo'

function mockCommand(tracker: string[]): Command {
  return {
    type: 'test',
    description: 'Test command',
    execute() { tracker.push('execute') },
    undo() { tracker.push('undo') }
  }
}

describe('useCalcViewUndoRedo', () => {
  describe('createUndoRedoStack', () => {
    it('starts empty with no undo/redo', () => {
      const stack = createUndoRedoStack()
      expect(stack.canUndo.value).toBe(false)
      expect(stack.canRedo.value).toBe(false)
      expect(stack.isDirty.value).toBe(false)
    })

    it('push executes command and enables undo', () => {
      const stack = createUndoRedoStack()
      const tracker: string[] = []
      stack.push(mockCommand(tracker))
      expect(tracker).toEqual(['execute'])
      expect(stack.canUndo.value).toBe(true)
      expect(stack.canRedo.value).toBe(false)
    })

    it('undo reverses command and enables redo', () => {
      const stack = createUndoRedoStack()
      const tracker: string[] = []
      stack.push(mockCommand(tracker))
      stack.undo()
      expect(tracker).toEqual(['execute', 'undo'])
      expect(stack.canUndo.value).toBe(false)
      expect(stack.canRedo.value).toBe(true)
    })

    it('redo re-executes undone command', () => {
      const stack = createUndoRedoStack()
      const tracker: string[] = []
      stack.push(mockCommand(tracker))
      stack.undo()
      stack.redo()
      expect(tracker).toEqual(['execute', 'undo', 'execute'])
      expect(stack.canUndo.value).toBe(true)
      expect(stack.canRedo.value).toBe(false)
    })

    it('push after undo discards redo history', () => {
      const stack = createUndoRedoStack()
      const tracker1: string[] = []
      const tracker2: string[] = []
      stack.push(mockCommand(tracker1))
      stack.undo()
      stack.push(mockCommand(tracker2))
      expect(stack.canRedo.value).toBe(false)
    })

    it('dirty state tracks pointer vs savedPointer', () => {
      const stack = createUndoRedoStack()
      const tracker: string[] = []
      expect(stack.isDirty.value).toBe(false)
      stack.push(mockCommand(tracker))
      expect(stack.isDirty.value).toBe(true)
      stack.markSaved()
      expect(stack.isDirty.value).toBe(false)
      stack.push(mockCommand(tracker))
      expect(stack.isDirty.value).toBe(true)
      stack.undo()
      expect(stack.isDirty.value).toBe(false) // back to saved state
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd app/vue && npx vitest run src/services/calcview/__tests__/undoRedo.test.ts`
Expected: FAIL — cannot find module `useCalcViewUndoRedo`

- [ ] **Step 3: Implement the undo/redo stack**

```typescript
// app/vue/src/composables/calcview/useCalcViewUndoRedo.ts
import { ref, computed } from 'vue'

export interface Command {
  type: string
  description: string
  execute(): void
  undo(): void
}

export function createUndoRedoStack() {
  const commands = ref<Command[]>([])
  const pointer = ref(-1)
  const savedPointer = ref(-1)

  const canUndo = computed(() => pointer.value >= 0)
  const canRedo = computed(() => pointer.value < commands.value.length - 1)
  const isDirty = computed(() => pointer.value !== savedPointer.value)

  function push(cmd: Command) {
    commands.value = commands.value.slice(0, pointer.value + 1)
    commands.value.push(cmd)
    pointer.value++
    cmd.execute()
  }

  function undo() {
    if (!canUndo.value) return
    commands.value[pointer.value].undo()
    pointer.value--
  }

  function redo() {
    if (!canRedo.value) return
    pointer.value++
    commands.value[pointer.value].execute()
  }

  function markSaved() {
    savedPointer.value = pointer.value
  }

  return { commands, pointer, canUndo, canRedo, isDirty, push, undo, redo, markSaved }
}

export function useCalcViewUndoRedo() {
  return createUndoRedoStack()
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd app/vue && npx vitest run src/services/calcview/__tests__/undoRedo.test.ts`
Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add app/vue/src/composables/calcview/useCalcViewUndoRedo.ts app/vue/src/services/calcview/__tests__/undoRedo.test.ts
git commit -m "feat(calcview): add command-pattern undo/redo stack"
```

---

## Task 2: Command Classes

**Files:**
- Create: `app/vue/src/composables/calcview/commands.ts`
- Test: `app/vue/src/services/calcview/__tests__/commands.test.ts`

- [ ] **Step 1: Write failing tests for command classes**

```typescript
// app/vue/src/services/calcview/__tests__/commands.test.ts
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import {
  AddNodeCommand,
  RemoveNodeCommand,
  ConnectNodesCommand,
  DisconnectNodesCommand,
  MapColumnCommand,
  UnmapColumnCommand,
  ChangePropertyCommand,
  AddJoinConditionCommand,
  RemoveJoinConditionCommand,
  BatchCommand
} from '../../../composables/calcview/commands'
import type { CalcViewModel, CalcViewNode, Column, JoinCondition } from '../types'

function createMinimalModel(): CalcViewModel {
  return {
    id: 'TEST',
    description: 'Test',
    dataCategory: 'CUBE',
    applyPrivilegeType: 'NONE',
    dataSources: [],
    calculationViews: [],
    logicalModel: {
      attributes: [],
      calculatedAttributes: [],
      baseMeasures: [],
      calculatedMeasures: [],
      restrictedMeasures: [],
      hierarchies: []
    },
    localVariables: [],
    variableMappings: [],
    layout: { shapes: [] },
    _unknownElements: []
  }
}

describe('commands', () => {
  describe('AddNodeCommand', () => {
    it('adds a node on execute and removes on undo', () => {
      const model = ref(createMinimalModel())
      const node: CalcViewNode = {
        id: 'Proj_1',
        type: 'projection',
        inputs: [],
        outputColumns: [],
        calculatedColumns: []
      }
      const cmd = new AddNodeCommand(model, node, { x: 100, y: 200 })
      cmd.execute()
      expect(model.value.calculationViews).toHaveLength(1)
      expect(model.value.calculationViews[0].id).toBe('Proj_1')
      expect(model.value.layout.shapes).toHaveLength(1)
      cmd.undo()
      expect(model.value.calculationViews).toHaveLength(0)
      expect(model.value.layout.shapes).toHaveLength(0)
    })
  })

  describe('ConnectNodesCommand', () => {
    it('adds input on execute and removes on undo', () => {
      const model = ref(createMinimalModel())
      model.value.calculationViews = [
        { id: 'Proj_1', type: 'projection', inputs: [], outputColumns: [], calculatedColumns: [] },
        { id: 'Aggr_1', type: 'aggregation', inputs: [], outputColumns: [], calculatedColumns: [] }
      ]
      const cmd = new ConnectNodesCommand(model, 'Proj_1', 'Aggr_1')
      cmd.execute()
      const target = model.value.calculationViews.find(n => n.id === 'Aggr_1')!
      expect(target.inputs).toHaveLength(1)
      expect(target.inputs[0].node).toBe('Proj_1')
      cmd.undo()
      expect(target.inputs).toHaveLength(0)
    })
  })

  describe('DisconnectNodesCommand', () => {
    it('removes input on execute and restores on undo', () => {
      const model = ref(createMinimalModel())
      model.value.calculationViews = [
        { id: 'Proj_1', type: 'projection', inputs: [], outputColumns: [], calculatedColumns: [] },
        { id: 'Aggr_1', type: 'aggregation', inputs: [{ name: 'Proj_1', node: 'Proj_1' }], outputColumns: [], calculatedColumns: [] }
      ]
      const cmd = new DisconnectNodesCommand(model, 'Proj_1', 'Aggr_1')
      cmd.execute()
      const target = model.value.calculationViews.find(n => n.id === 'Aggr_1')!
      expect(target.inputs).toHaveLength(0)
      cmd.undo()
      expect(target.inputs).toHaveLength(1)
      expect(target.inputs[0].node).toBe('Proj_1')
    })
  })

  describe('MapColumnCommand', () => {
    it('adds column to output on execute, removes on undo', () => {
      const model = ref(createMinimalModel())
      model.value.calculationViews = [
        { id: 'Proj_1', type: 'projection', inputs: [], outputColumns: [], calculatedColumns: [] }
      ]
      const col: Column = { id: 'AMOUNT', name: 'AMOUNT', dataType: 'DECIMAL' }
      const cmd = new MapColumnCommand(model, 'Proj_1', col)
      cmd.execute()
      expect(model.value.calculationViews[0].outputColumns).toHaveLength(1)
      expect(model.value.calculationViews[0].outputColumns[0].id).toBe('AMOUNT')
      cmd.undo()
      expect(model.value.calculationViews[0].outputColumns).toHaveLength(0)
    })
  })

  describe('UnmapColumnCommand', () => {
    it('removes column from output on execute, restores on undo', () => {
      const model = ref(createMinimalModel())
      const col: Column = { id: 'AMOUNT', name: 'AMOUNT', dataType: 'DECIMAL' }
      model.value.calculationViews = [
        { id: 'Proj_1', type: 'projection', inputs: [], outputColumns: [col], calculatedColumns: [] }
      ]
      const cmd = new UnmapColumnCommand(model, 'Proj_1', 'AMOUNT')
      cmd.execute()
      expect(model.value.calculationViews[0].outputColumns).toHaveLength(0)
      cmd.undo()
      expect(model.value.calculationViews[0].outputColumns).toHaveLength(1)
    })
  })

  describe('ChangePropertyCommand', () => {
    it('changes a property on execute and reverts on undo', () => {
      const model = ref(createMinimalModel())
      model.value.calculationViews = [
        {
          id: 'Join_1', type: 'join', inputs: [], outputColumns: [], calculatedColumns: [],
          joinConfig: { joinType: 'inner', cardinality: '1..1', conditions: [] }
        }
      ]
      const cmd = new ChangePropertyCommand(
        model, 'Join_1', 'joinConfig.joinType', 'leftOuter', 'inner'
      )
      cmd.execute()
      expect(model.value.calculationViews[0].joinConfig!.joinType).toBe('leftOuter')
      cmd.undo()
      expect(model.value.calculationViews[0].joinConfig!.joinType).toBe('inner')
    })
  })

  describe('BatchCommand', () => {
    it('executes all commands and undoes in reverse', () => {
      const model = ref(createMinimalModel())
      const col1: Column = { id: 'A', name: 'A', dataType: 'NVARCHAR' }
      const col2: Column = { id: 'B', name: 'B', dataType: 'INTEGER' }
      model.value.calculationViews = [
        { id: 'Proj_1', type: 'projection', inputs: [], outputColumns: [], calculatedColumns: [] }
      ]
      const batch = new BatchCommand([
        new MapColumnCommand(model, 'Proj_1', col1),
        new MapColumnCommand(model, 'Proj_1', col2)
      ], 'Map all columns')
      batch.execute()
      expect(model.value.calculationViews[0].outputColumns).toHaveLength(2)
      batch.undo()
      expect(model.value.calculationViews[0].outputColumns).toHaveLength(0)
    })
  })

  describe('AddJoinConditionCommand', () => {
    it('adds a join condition on execute and removes on undo', () => {
      const model = ref(createMinimalModel())
      model.value.calculationViews = [
        {
          id: 'Join_1', type: 'join', inputs: [], outputColumns: [], calculatedColumns: [],
          joinConfig: { joinType: 'inner', cardinality: '1..1', conditions: [] }
        }
      ]
      const cond: JoinCondition = { leftColumn: 'ID', rightColumn: 'PRODUCT_ID', operator: '=' }
      const cmd = new AddJoinConditionCommand(model, 'Join_1', cond)
      cmd.execute()
      expect(model.value.calculationViews[0].joinConfig!.conditions).toHaveLength(1)
      expect(model.value.calculationViews[0].joinConfig!.conditions[0].leftColumn).toBe('ID')
      cmd.undo()
      expect(model.value.calculationViews[0].joinConfig!.conditions).toHaveLength(0)
    })
  })

  describe('RemoveJoinConditionCommand', () => {
    it('removes a join condition at index on execute and restores on undo', () => {
      const model = ref(createMinimalModel())
      const cond: JoinCondition = { leftColumn: 'ID', rightColumn: 'PRODUCT_ID', operator: '=' }
      model.value.calculationViews = [
        {
          id: 'Join_1', type: 'join', inputs: [], outputColumns: [], calculatedColumns: [],
          joinConfig: { joinType: 'inner', cardinality: '1..1', conditions: [cond] }
        }
      ]
      const cmd = new RemoveJoinConditionCommand(model, 'Join_1', 0)
      cmd.execute()
      expect(model.value.calculationViews[0].joinConfig!.conditions).toHaveLength(0)
      cmd.undo()
      expect(model.value.calculationViews[0].joinConfig!.conditions).toHaveLength(1)
      expect(model.value.calculationViews[0].joinConfig!.conditions[0].leftColumn).toBe('ID')
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd app/vue && npx vitest run src/services/calcview/__tests__/commands.test.ts`
Expected: FAIL — cannot find module `commands`

- [ ] **Step 3: Implement command classes**

```typescript
// app/vue/src/composables/calcview/commands.ts
import type { Ref } from 'vue'
import type { CalcViewModel, CalcViewNode, Column, NodeType, JoinCondition } from '../../services/calcview/types'
import type { Command } from './useCalcViewUndoRedo'

export class AddNodeCommand implements Command {
  type = 'addNode'
  description: string

  constructor(
    private model: Ref<CalcViewModel>,
    private node: CalcViewNode,
    private position: { x: number; y: number }
  ) {
    this.description = `Add ${node.id}`
  }

  execute() {
    this.model.value.calculationViews.push(this.node)
    this.model.value.layout.shapes.push({
      modelObjectName: this.node.id,
      modelObjectNameSpace: 'CalculationView',
      expanded: true,
      upperLeftCorner: { ...this.position }
    })
  }

  undo() {
    this.model.value.calculationViews = this.model.value.calculationViews.filter(
      n => n.id !== this.node.id
    )
    this.model.value.layout.shapes = this.model.value.layout.shapes.filter(
      s => s.modelObjectName !== this.node.id
    )
  }
}

export class RemoveNodeCommand implements Command {
  type = 'removeNode'
  description: string
  private removedNode: CalcViewNode | null = null
  private removedNodeIndex = -1
  private removedShape: CalcViewModel['layout']['shapes'][0] | null = null
  private removedShapeIndex = -1
  private removedInputs: { nodeId: string; input: { name: string; node: string } }[] = []

  constructor(
    private model: Ref<CalcViewModel>,
    private nodeId: string
  ) {
    this.description = `Remove ${nodeId}`
  }

  execute() {
    const idx = this.model.value.calculationViews.findIndex(n => n.id === this.nodeId)
    if (idx === -1) return
    this.removedNodeIndex = idx
    this.removedNode = this.model.value.calculationViews[idx]
    this.model.value.calculationViews.splice(idx, 1)

    const shapeIdx = this.model.value.layout.shapes.findIndex(s => s.modelObjectName === this.nodeId)
    if (shapeIdx !== -1) {
      this.removedShapeIndex = shapeIdx
      this.removedShape = this.model.value.layout.shapes[shapeIdx]
      this.model.value.layout.shapes.splice(shapeIdx, 1)
    }

    this.removedInputs = []
    for (const node of this.model.value.calculationViews) {
      const inputIdx = node.inputs.findIndex(i => i.node === this.nodeId)
      if (inputIdx !== -1) {
        this.removedInputs.push({ nodeId: node.id, input: node.inputs[inputIdx] })
        node.inputs.splice(inputIdx, 1)
      }
    }
  }

  undo() {
    if (this.removedNode) {
      this.model.value.calculationViews.splice(this.removedNodeIndex, 0, this.removedNode)
    }
    if (this.removedShape) {
      this.model.value.layout.shapes.splice(this.removedShapeIndex, 0, this.removedShape)
    }
    for (const { nodeId, input } of this.removedInputs) {
      const node = this.model.value.calculationViews.find(n => n.id === nodeId)
      if (node) node.inputs.push(input)
    }
  }
}

export class ConnectNodesCommand implements Command {
  type = 'connectNodes'
  description: string

  constructor(
    private model: Ref<CalcViewModel>,
    private sourceId: string,
    private targetId: string
  ) {
    this.description = `Connect ${sourceId} → ${targetId}`
  }

  execute() {
    const target = this.model.value.calculationViews.find(n => n.id === this.targetId)
    if (target && !target.inputs.some(i => i.node === this.sourceId)) {
      target.inputs.push({ name: this.sourceId, node: this.sourceId })
    }
  }

  undo() {
    const target = this.model.value.calculationViews.find(n => n.id === this.targetId)
    if (target) {
      target.inputs = target.inputs.filter(i => i.node !== this.sourceId)
    }
  }
}

export class DisconnectNodesCommand implements Command {
  type = 'disconnectNodes'
  description: string
  private removedInput: { name: string; node: string } | null = null

  constructor(
    private model: Ref<CalcViewModel>,
    private sourceId: string,
    private targetId: string
  ) {
    this.description = `Disconnect ${sourceId} → ${targetId}`
  }

  execute() {
    const target = this.model.value.calculationViews.find(n => n.id === this.targetId)
    if (target) {
      const idx = target.inputs.findIndex(i => i.node === this.sourceId)
      if (idx !== -1) {
        this.removedInput = target.inputs[idx]
        target.inputs.splice(idx, 1)
      }
    }
  }

  undo() {
    if (this.removedInput) {
      const target = this.model.value.calculationViews.find(n => n.id === this.targetId)
      if (target) target.inputs.push(this.removedInput)
    }
  }
}

export class MapColumnCommand implements Command {
  type = 'mapColumn'
  description: string

  constructor(
    private model: Ref<CalcViewModel>,
    private nodeId: string,
    private column: Column
  ) {
    this.description = `Map column ${column.name}`
  }

  execute() {
    const node = this.model.value.calculationViews.find(n => n.id === this.nodeId)
    if (node) node.outputColumns.push({ ...this.column })
  }

  undo() {
    const node = this.model.value.calculationViews.find(n => n.id === this.nodeId)
    if (node) {
      node.outputColumns = node.outputColumns.filter(c => c.id !== this.column.id)
    }
  }
}

export class UnmapColumnCommand implements Command {
  type = 'unmapColumn'
  description: string
  private removedColumn: Column | null = null

  constructor(
    private model: Ref<CalcViewModel>,
    private nodeId: string,
    private columnId: string
  ) {
    this.description = `Unmap column ${columnId}`
  }

  execute() {
    const node = this.model.value.calculationViews.find(n => n.id === this.nodeId)
    if (node) {
      const idx = node.outputColumns.findIndex(c => c.id === this.columnId)
      if (idx !== -1) {
        this.removedColumn = node.outputColumns[idx]
        node.outputColumns.splice(idx, 1)
      }
    }
  }

  undo() {
    if (this.removedColumn) {
      const node = this.model.value.calculationViews.find(n => n.id === this.nodeId)
      if (node) node.outputColumns.push(this.removedColumn)
    }
  }
}

export class ChangePropertyCommand implements Command {
  type = 'changeProperty'
  description: string

  constructor(
    private model: Ref<CalcViewModel>,
    private nodeId: string,
    private path: string,
    private newValue: unknown,
    private oldValue: unknown
  ) {
    this.description = `Change ${path}`
  }

  execute() {
    this.setNestedValue(this.newValue)
  }

  undo() {
    this.setNestedValue(this.oldValue)
  }

  private setNestedValue(value: unknown) {
    const node = this.model.value.calculationViews.find(n => n.id === this.nodeId) as any
    if (!node) return
    const parts = this.path.split('.')
    let target = node
    for (let i = 0; i < parts.length - 1; i++) {
      target = target[parts[i]]
      if (!target) return
    }
    target[parts[parts.length - 1]] = value
  }
}

export class BatchCommand implements Command {
  type = 'batch'
  description: string

  constructor(
    private commands: Command[],
    description?: string
  ) {
    this.description = description ?? `Batch (${commands.length} operations)`
  }

  execute() {
    for (const cmd of this.commands) cmd.execute()
  }

  undo() {
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo()
    }
  }
}

export class AddJoinConditionCommand implements Command {
  type = 'addJoinCondition'
  description: string

  constructor(
    private model: Ref<CalcViewModel>,
    private nodeId: string,
    private condition: JoinCondition
  ) {
    this.description = `Add join condition ${condition.leftColumn} ${condition.operator} ${condition.rightColumn}`
  }

  execute() {
    const node = this.model.value.calculationViews.find(n => n.id === this.nodeId)
    node?.joinConfig?.conditions.push(this.condition)
  }

  undo() {
    const node = this.model.value.calculationViews.find(n => n.id === this.nodeId)
    node?.joinConfig?.conditions.pop()
  }
}

export class RemoveJoinConditionCommand implements Command {
  type = 'removeJoinCondition'
  description: string
  private removed: JoinCondition | null = null

  constructor(
    private model: Ref<CalcViewModel>,
    private nodeId: string,
    private index: number
  ) {
    this.description = `Remove join condition at index ${index}`
  }

  execute() {
    const node = this.model.value.calculationViews.find(n => n.id === this.nodeId)
    if (node?.joinConfig) {
      this.removed = node.joinConfig.conditions.splice(this.index, 1)[0] ?? null
    }
  }

  undo() {
    if (this.removed) {
      const node = this.model.value.calculationViews.find(n => n.id === this.nodeId)
      node?.joinConfig?.conditions.splice(this.index, 0, this.removed)
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd app/vue && npx vitest run src/services/calcview/__tests__/commands.test.ts`
Expected: All 9 tests PASS

- [ ] **Step 5: Commit**

```bash
git add app/vue/src/composables/calcview/commands.ts app/vue/src/services/calcview/__tests__/commands.test.ts
git commit -m "feat(calcview): add command classes for undo/redo operations"
```

---

## Task 3: GenericNode Component (Remaining 8 Node Types)

**Files:**
- Create: `app/vue/src/components/calcview/canvas/nodes/GenericNode.vue`
- Create: `app/vue/src/components/calcview/canvas/nodes/JoinNode.vue`
- Modify: `app/vue/src/components/calcview/canvas/CalcViewCanvas.vue`

**Context:** Phase 1 already has `ProjectionNode.vue` (single-input with top+bottom handles). Most remaining node types (Aggregation, Union, Minus, Intersect, Rank, TableFunction, HierarchyFunction) share the same visual pattern — accent-colored border, icon, label, subtitle, top+bottom handles. Rather than 8 separate near-identical files, we create one `GenericNode.vue` that all types share, plus a specialized `JoinNode.vue` that has two bottom handles for the two inputs.

**Design decisions:**
- `GenericNode.vue` is used for: aggregation, union, minus, intersect, rank, tableFunction, hierarchyFunction
- `JoinNode.vue` is used for: join, nonEquiJoin (both have exactly 2 inputs, shown as left/right handles)
- `ProjectionNode.vue` (already exists) continues to handle 'projection' type
- `SemanticsNode.vue` (already exists) continues to handle 'semantics' type
- TableFunction node shows "no inputs" — has top handle (output) but no bottom handle

- [ ] **Step 1: Create GenericNode.vue**

```vue
<!-- app/vue/src/components/calcview/canvas/nodes/GenericNode.vue -->
<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{
  data: {
    label: string
    typeDef: { icon: string; themeVariable: string; label: string; maxInputs: number }
    columnCount: number
    inputCount: number
  }
}>()
</script>

<template>
  <div class="generic-node" :style="{ borderColor: `var(${data.typeDef.themeVariable})` }">
    <Handle type="source" :position="Position.Top" />
    <Handle v-if="data.typeDef.maxInputs > 0" type="target" :position="Position.Bottom" />
    <div class="node-icon" :style="{ color: `var(${data.typeDef.themeVariable})` }">
      {{ data.typeDef.icon }}
    </div>
    <div class="node-content">
      <div class="node-label">{{ data.label }}</div>
      <div class="node-subtitle">{{ data.typeDef.label }} · {{ data.columnCount }} columns</div>
    </div>
  </div>
</template>

<style scoped>
.generic-node {
  background: var(--sapTile_Background, #fff);
  border: 2px solid;
  border-radius: 8px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 160px;
}

.node-icon {
  font-size: 16px;
}

.node-content {
  display: flex;
  flex-direction: column;
}

.node-label {
  color: var(--sapTextColor, #333);
  font-weight: 600;
  font-size: 12px;
}

.node-subtitle {
  color: var(--sapContent_LabelColor, #666);
  font-size: 10px;
  margin-top: 2px;
}
</style>
```

- [ ] **Step 2: Create JoinNode.vue with two bottom handles**

```vue
<!-- app/vue/src/components/calcview/canvas/nodes/JoinNode.vue -->
<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{
  data: {
    label: string
    typeDef: { icon: string; themeVariable: string; label: string }
    columnCount: number
    inputCount: number
  }
}>()
</script>

<template>
  <div class="join-node" :style="{ borderColor: `var(${data.typeDef.themeVariable})` }">
    <Handle type="source" :position="Position.Top" />
    <Handle id="left" type="target" :position="Position.Bottom" :style="{ left: '25%' }" />
    <Handle id="right" type="target" :position="Position.Bottom" :style="{ left: '75%' }" />
    <div class="node-icon" :style="{ color: `var(${data.typeDef.themeVariable})` }">
      {{ data.typeDef.icon }}
    </div>
    <div class="node-content">
      <div class="node-label">{{ data.label }}</div>
      <div class="node-subtitle">{{ data.typeDef.label }} · {{ data.columnCount }} columns</div>
    </div>
  </div>
</template>

<style scoped>
.join-node {
  background: var(--sapTile_Background, #fff);
  border: 2px solid;
  border-radius: 8px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 180px;
}

.node-icon {
  font-size: 16px;
}

.node-content {
  display: flex;
  flex-direction: column;
}

.node-label {
  color: var(--sapTextColor, #333);
  font-weight: 600;
  font-size: 12px;
}

.node-subtitle {
  color: var(--sapContent_LabelColor, #666);
  font-size: 10px;
  margin-top: 2px;
}
</style>
```

- [ ] **Step 3: Update CalcViewCanvas.vue to register all node types**

Modify `app/vue/src/components/calcview/canvas/CalcViewCanvas.vue`:

- Import `GenericNode` and `JoinNode`
- Add template slots for all remaining node types:
  - `#node-join` and `#node-nonEquiJoin` → `JoinNode`
  - `#node-aggregation`, `#node-union`, `#node-minus`, `#node-intersect`, `#node-rank`, `#node-tableFunction`, `#node-hierarchyFunction` → `GenericNode`

```vue
<script setup lang="ts">
import { VueFlow } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/minimap/dist/style.css'
import '@vue-flow/controls/dist/style.css'

import SemanticsNode from './nodes/SemanticsNode.vue'
import ProjectionNode from './nodes/ProjectionNode.vue'
import GenericNode from './nodes/GenericNode.vue'
import JoinNode from './nodes/JoinNode.vue'
import DataFlowEdge from './edges/DataFlowEdge.vue'

import type { Node, Edge, NodeMouseEvent, EdgeMouseEvent, Connection } from '@vue-flow/core'

const props = defineProps<{
  nodes: Node[]
  edges: Edge[]
}>()

const emit = defineEmits<{
  'node-click': [node: Node]
  'connect': [connection: Connection]
  'edge-remove': [edge: Edge]
}>()

function onNodeClick(event: NodeMouseEvent) {
  emit('node-click', event.node)
}

function onConnect(connection: Connection) {
  emit('connect', connection)
}

function onEdgeDoubleClick(event: EdgeMouseEvent) {
  emit('edge-remove', event.edge)
}
</script>

<template>
  <div class="canvas-container">
    <VueFlow
      :nodes="props.nodes"
      :edges="props.edges"
      :default-viewport="{ zoom: 1, x: 0, y: 0 }"
      fit-view-on-init
      @node-click="onNodeClick"
      @connect="onConnect"
      @edge-double-click="onEdgeDoubleClick"
    >
      <template #node-semantics="nodeProps">
        <SemanticsNode v-bind="nodeProps" />
      </template>
      <template #node-projection="nodeProps">
        <ProjectionNode v-bind="nodeProps" />
      </template>
      <template #node-join="nodeProps">
        <JoinNode v-bind="nodeProps" />
      </template>
      <template #node-nonEquiJoin="nodeProps">
        <JoinNode v-bind="nodeProps" />
      </template>
      <template #node-aggregation="nodeProps">
        <GenericNode v-bind="nodeProps" />
      </template>
      <template #node-union="nodeProps">
        <GenericNode v-bind="nodeProps" />
      </template>
      <template #node-minus="nodeProps">
        <GenericNode v-bind="nodeProps" />
      </template>
      <template #node-intersect="nodeProps">
        <GenericNode v-bind="nodeProps" />
      </template>
      <template #node-rank="nodeProps">
        <GenericNode v-bind="nodeProps" />
      </template>
      <template #node-tableFunction="nodeProps">
        <GenericNode v-bind="nodeProps" />
      </template>
      <template #node-hierarchyFunction="nodeProps">
        <GenericNode v-bind="nodeProps" />
      </template>
      <template #edge-dataFlow="edgeProps">
        <DataFlowEdge v-bind="edgeProps" />
      </template>
      <MiniMap />
      <Controls />
    </VueFlow>
  </div>
</template>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  background: var(--sapBackgroundColor, #f5f6f7);
}
</style>
```

- [ ] **Step 4: Verify existing tests still pass**

Run: `cd app/vue && npx vitest run`
Expected: All existing tests PASS (no regressions)

- [ ] **Step 5: Commit**

```bash
git add app/vue/src/components/calcview/canvas/nodes/GenericNode.vue app/vue/src/components/calcview/canvas/nodes/JoinNode.vue app/vue/src/components/calcview/canvas/CalcViewCanvas.vue
git commit -m "feat(calcview): add all 10 node type components with canvas registration"
```

---

## Task 4: Edge Connection & Removal (Wire Model Mutations)

**Files:**
- Modify: `app/vue/src/composables/calcview/useCalcViewModel.ts`
- Modify: `app/vue/src/views/CalcViewEditor.vue`

**Context:** Phase 1's `useCalcViewModel` is read-only (takes a model, computes Vue Flow nodes/edges). Phase 2 adds mutation methods that go through the undo/redo stack. The editor view wires canvas events to these methods.

- [ ] **Step 1: Extend useCalcViewModel with mutation methods**

Update `app/vue/src/composables/calcview/useCalcViewModel.ts` to:
- Accept an undo/redo stack instance
- Add `addNode(type, position)`, `removeNode(id)`, `connectNodes(source, target)`, `disconnectNodes(source, target)` methods that push commands
- Generate unique node IDs: `${TypeLabel}_${nextIndex}`

```typescript
// app/vue/src/composables/calcview/useCalcViewModel.ts
import { ref, computed, type Ref } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import type { CalcViewModel, CalcViewNode, NodeType, Column, JoinCondition } from '../../services/calcview/types'
import { NODE_TYPE_DEFINITIONS } from '../../services/calcview/nodeTypes'
import { createUndoRedoStack } from './useCalcViewUndoRedo'
import {
  AddNodeCommand,
  RemoveNodeCommand,
  ConnectNodesCommand,
  DisconnectNodesCommand,
  MapColumnCommand,
  UnmapColumnCommand,
  AddJoinConditionCommand,
  RemoveJoinConditionCommand
} from './commands'

export function useCalcViewModel() {
  const model = ref<CalcViewModel | null>(null)
  const undoRedo = createUndoRedoStack()

  const vueFlowNodes = computed<Node[]>(() => {
    if (!model.value) return []

    const nodes: Node[] = []

    const semanticsShape = model.value.layout.shapes.find(
      s => s.modelObjectName === 'Output'
    )
    nodes.push({
      id: '__semantics__',
      type: 'semantics',
      position: {
        x: semanticsShape?.upperLeftCorner.x ?? 200,
        y: semanticsShape?.upperLeftCorner.y ?? 50
      },
      data: {
        label: 'Semantics',
        dataCategory: model.value.dataCategory,
        attributeCount: model.value.logicalModel.attributes.length,
        measureCount: model.value.logicalModel.baseMeasures.length
      }
    })

    for (const cvNode of model.value.calculationViews) {
      const shape = model.value.layout.shapes.find(
        s => s.modelObjectName === cvNode.id
      )
      const typeDef = NODE_TYPE_DEFINITIONS[cvNode.type]

      nodes.push({
        id: cvNode.id,
        type: cvNode.type,
        position: {
          x: shape?.upperLeftCorner.x ?? 200,
          y: shape?.upperLeftCorner.y ?? 300
        },
        data: {
          label: cvNode.id,
          nodeType: cvNode.type,
          typeDef,
          columnCount: cvNode.outputColumns.length,
          inputCount: cvNode.inputs.length
        }
      })
    }

    return nodes
  })

  const vueFlowEdges = computed<Edge[]>(() => {
    if (!model.value) return []

    const edges: Edge[] = []
    const nodeIds = model.value.calculationViews.map(n => n.id)

    for (const cvNode of model.value.calculationViews) {
      const hasParent = model.value.calculationViews.some(
        other => other.inputs.some(i => i.node === cvNode.id)
      )

      if (!hasParent) {
        edges.push({
          id: `e-${cvNode.id}-semantics`,
          source: cvNode.id,
          target: '__semantics__',
          type: 'dataFlow'
        })
      }

      for (const input of cvNode.inputs) {
        if (nodeIds.includes(input.node)) {
          edges.push({
            id: `e-${input.node}-${cvNode.id}`,
            source: input.node,
            target: cvNode.id,
            type: 'dataFlow'
          })
        }
      }
    }

    return edges
  })

  function loadModel(newModel: CalcViewModel) {
    model.value = newModel
  }

  function generateNodeId(type: NodeType): string {
    if (!model.value) return `${type}_1`
    const typeDef = NODE_TYPE_DEFINITIONS[type]
    const prefix = typeDef.label.replace(/\s/g, '_')
    const existing = model.value.calculationViews.filter(n => n.id.startsWith(prefix))
    return `${prefix}_${existing.length + 1}`
  }

  function addNode(type: NodeType, position: { x: number; y: number }) {
    if (!model.value) return
    const m = model as Ref<CalcViewModel>
    const id = generateNodeId(type)
    const node: CalcViewNode = {
      id,
      type,
      inputs: [],
      outputColumns: [],
      calculatedColumns: [],
      ...(type === 'join' || type === 'nonEquiJoin'
        ? { joinConfig: { joinType: 'inner', cardinality: '1..1', conditions: [] } }
        : {}),
      ...(type === 'rank'
        ? { rankConfig: { orderBy: [], thresholdType: 'top', count: 10 } }
        : {})
    }
    undoRedo.push(new AddNodeCommand(m, node, position))
  }

  function removeNode(nodeId: string) {
    if (!model.value) return
    undoRedo.push(new RemoveNodeCommand(model as Ref<CalcViewModel>, nodeId))
  }

  function connectNodes(sourceId: string, targetId: string) {
    if (!model.value) return
    undoRedo.push(new ConnectNodesCommand(model as Ref<CalcViewModel>, sourceId, targetId))
  }

  function disconnectNodes(sourceId: string, targetId: string) {
    if (!model.value) return
    undoRedo.push(new DisconnectNodesCommand(model as Ref<CalcViewModel>, sourceId, targetId))
  }

  function mapColumn(nodeId: string, column: Column) {
    if (!model.value) return
    undoRedo.push(new MapColumnCommand(model as Ref<CalcViewModel>, nodeId, column))
  }

  function unmapColumn(nodeId: string, columnId: string) {
    if (!model.value) return
    undoRedo.push(new UnmapColumnCommand(model as Ref<CalcViewModel>, nodeId, columnId))
  }

  function addJoinCondition(nodeId: string, condition: JoinCondition) {
    if (!model.value) return
    undoRedo.push(new AddJoinConditionCommand(model as Ref<CalcViewModel>, nodeId, condition))
  }

  function removeJoinCondition(nodeId: string, index: number) {
    if (!model.value) return
    undoRedo.push(new RemoveJoinConditionCommand(model as Ref<CalcViewModel>, nodeId, index))
  }

  return {
    model,
    undoRedo,
    vueFlowNodes,
    vueFlowEdges,
    loadModel,
    addNode,
    removeNode,
    connectNodes,
    disconnectNodes,
    mapColumn,
    unmapColumn,
    addJoinCondition,
    removeJoinCondition
  }
}
```

- [ ] **Step 2: Update CalcViewEditor.vue to wire events**

Update `app/vue/src/views/CalcViewEditor.vue`:
- Handle `@connect` event from canvas → call `connectNodes`
- Handle `@edge-remove` event from canvas → parse edge ID to get source/target, call `disconnectNodes`
- Wire `handleAddNode` to `addNode` with a default position
- Add undo/redo keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z)
- Show dirty state indicator

```vue
<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import { useCalcViewModel } from '../composables/calcview/useCalcViewModel'
import { parseCalcView } from '../services/calcview/xmlParser'
import CalcViewCanvas from '../components/calcview/canvas/CalcViewCanvas.vue'
import NodePalette from '../components/calcview/canvas/NodePalette.vue'
import PropertiesPanel from '../components/calcview/properties/PropertiesPanel.vue'
import type { NodeType, JoinCondition } from '../services/calcview/types'
import type { Node, Edge, Connection } from '@vue-flow/core'
import '@ui5/webcomponents/dist/Title.js'

const {
  model, undoRedo, vueFlowNodes, vueFlowEdges,
  loadModel, addNode, connectNodes, disconnectNodes,
  mapColumn, unmapColumn, addJoinCondition, removeJoinCondition
} = useCalcViewModel()

const selectedNodeId = ref<string | null>(null)

function handleNodeClick(node: Node) {
  selectedNodeId.value = node.id
}

function handleConnect(connection: Connection) {
  if (connection.source && connection.target) {
    connectNodes(connection.source, connection.target)
  }
}

function handleEdgeRemove(edge: Edge) {
  if (edge.target === '__semantics__') return
  disconnectNodes(edge.source, edge.target)
}

function handleAddNode(type: NodeType) {
  addNode(type, { x: 200, y: 400 })
}

function handleKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    undoRedo.undo()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
    e.preventDefault()
    undoRedo.redo()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
    e.preventDefault()
    undoRedo.redo()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)

  const demoXml = `<?xml version="1.0" encoding="UTF-8"?>
<Calculation:scenario xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore" id="DEMO" applyPrivilegeType="NONE" dataCategory="CUBE">
  <descriptions defaultDescription="Demo View"/>
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
      <input node="SALES"/>
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
</Calculation:scenario>`

  loadModel(parseCalcView(demoXml))
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="calc-view-editor">
    <div class="editor-content" v-if="model && vueFlowNodes.length > 0">
      <NodePalette @add-node="handleAddNode" />
      <CalcViewCanvas
        :nodes="vueFlowNodes"
        :edges="vueFlowEdges"
        @node-click="handleNodeClick"
        @connect="handleConnect"
        @edge-remove="handleEdgeRemove"
      />
      <PropertiesPanel
        :model="model"
        :selected-node-id="selectedNodeId"
      />
    </div>
    <div v-else class="empty-state">
      <ui5-title level="H3">No Calculation View loaded</ui5-title>
    </div>
  </div>
</template>

<style scoped>
.calc-view-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-content {
  display: flex;
  height: 100%;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
```

- [ ] **Step 3: Run all tests**

Run: `cd app/vue && npx vitest run`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add app/vue/src/composables/calcview/useCalcViewModel.ts app/vue/src/views/CalcViewEditor.vue
git commit -m "feat(calcview): wire edge connect/disconnect and undo/redo to editor"
```

---

## Task 5: Join Fixture + Parser/Serializer Extension

**Files:**
- Create: `app/vue/src/services/calcview/__tests__/fixtures/join.hdbcalculationview`
- Modify: `app/vue/src/services/calcview/xmlParser.ts`
- Modify: `app/vue/src/services/calcview/xmlSerializer.ts`
- Modify: `app/vue/src/services/calcview/__tests__/xmlParser.test.ts`
- Modify: `app/vue/src/services/calcview/__tests__/xmlSerializer.test.ts`

**Context:** Phase 1 parser handles Projection nodes. Phase 2 needs to parse/serialize Join nodes with their `joinAttribute` conditions and cardinality/joinType metadata. The existing parser's `inferNodeType` already handles `JoinView` vs `NonEquiJoinView`, but doesn't extract `joinAttribute` elements.

- [ ] **Step 1: Create join.hdbcalculationview fixture**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Calculation:scenario xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore" id="JOIN_TEST" applyPrivilegeType="NONE" dataCategory="CUBE">
  <descriptions defaultDescription="Join Test View"/>
  <localVariables/>
  <variableMappings/>
  <dataSources>
    <DataSource id="SALES"><resourceUri>SALES</resourceUri></DataSource>
    <DataSource id="PRODUCTS"><resourceUri>PRODUCTS</resourceUri></DataSource>
  </dataSources>
  <calculationViews>
    <calculationView xsi:type="Calculation:JoinView" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Join_1" cardinality="C1_1" joinType="inner">
      <viewAttributes>
        <viewAttribute id="PRODUCT_ID"/>
        <viewAttribute id="AMOUNT"/>
        <viewAttribute id="PRODUCT_NAME"/>
      </viewAttributes>
      <calculatedViewAttributes/>
      <input node="SALES">
        <mapping xsi:type="Calculation:AttributeMapping" target="PRODUCT_ID" source="PRODUCT_ID"/>
        <mapping xsi:type="Calculation:AttributeMapping" target="AMOUNT" source="AMOUNT"/>
      </input>
      <input node="PRODUCTS">
        <mapping xsi:type="Calculation:AttributeMapping" target="PRODUCT_NAME" source="PRODUCT_NAME"/>
      </input>
      <joinAttribute name="PRODUCT_ID"/>
    </calculationView>
  </calculationViews>
  <logicalModel id="Join_1">
    <attributes>
      <attribute id="PRODUCT_ID"><descriptions defaultDescription="Product ID"/></attribute>
      <attribute id="PRODUCT_NAME"><descriptions defaultDescription="Product Name"/></attribute>
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
      <shape expanded="true" modelObjectName="Join_1" modelObjectNameSpace="CalculationView">
        <upperLeftCorner x="200" y="250"/>
      </shape>
    </shapes>
  </layout>
</Calculation:scenario>
```

- [ ] **Step 2: Add failing tests for join parsing**

Add to `app/vue/src/services/calcview/__tests__/xmlParser.test.ts`:

```typescript
it('parses join node with config and conditions', () => {
  const xml = loadFixture('join.hdbcalculationview')
  const model = parseCalcView(xml)

  expect(model.calculationViews).toHaveLength(1)
  const node = model.calculationViews[0]
  expect(node.id).toBe('Join_1')
  expect(node.type).toBe('join')
  expect(node.inputs).toHaveLength(2)
  expect(node.inputs[0].node).toBe('SALES')
  expect(node.inputs[1].node).toBe('PRODUCTS')
  expect(node.joinConfig).toBeDefined()
  expect(node.joinConfig!.joinType).toBe('inner')
  expect(node.joinConfig!.cardinality).toBe('1..1')
  expect(node.joinConfig!.conditions).toHaveLength(1)
  expect(node.joinConfig!.conditions[0].leftColumn).toBe('PRODUCT_ID')
  expect(node.joinConfig!.conditions[0].operator).toBe('=')
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd app/vue && npx vitest run src/services/calcview/__tests__/xmlParser.test.ts`
Expected: FAIL — joinConfig is undefined or conditions empty

- [ ] **Step 4: Update xmlParser.ts to extract joinConfig**

In `xmlParser.ts`, extend the `parseCalculationView` function to:
- Read `@_joinType` and `@_cardinality` attributes from join/nonEquiJoin views
- Parse `joinAttribute` elements into conditions array
- Map cardinality codes: `C1_1` → `1..1`, `C1_N` → `1..N`, `CN_1` → `N..1`, `CN_M` → `N..M`

The key additions:

```typescript
// Inside the function that parses each calculationView element:
if (nodeType === 'join' || nodeType === 'nonEquiJoin') {
  const joinType = cv['@_joinType'] || 'inner'
  const rawCardinality = cv['@_cardinality'] || 'C1_1'
  const cardinality = parseCardinality(rawCardinality)
  const joinAttributes = ensureArray(cv['joinAttribute'] || [])
  const conditions = joinAttributes.map((ja: any) => ({
    leftColumn: ja['@_name'] || ja,
    rightColumn: ja['@_name'] || ja,
    operator: '=' as const
  }))
  node.joinConfig = { joinType, cardinality, conditions }
}

function parseCardinality(raw: string): '1..1' | '1..N' | 'N..1' | 'N..M' {
  const map: Record<string, '1..1' | '1..N' | 'N..1' | 'N..M'> = {
    'C1_1': '1..1', 'C1_N': '1..N', 'CN_1': 'N..1', 'CN_M': 'N..M'
  }
  return map[raw] || '1..1'
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd app/vue && npx vitest run src/services/calcview/__tests__/xmlParser.test.ts`
Expected: All tests PASS including new join test

- [ ] **Step 6: Add round-trip serializer test for join**

Add to `app/vue/src/services/calcview/__tests__/xmlSerializer.test.ts`:

```typescript
it('round-trips join calculation view with config', () => {
  const xml = loadFixture('join.hdbcalculationview')
  const model = parseCalcView(xml)
  const output = serializeCalcView(model)
  const reparsed = parseCalcView(output)

  expect(reparsed.calculationViews[0].type).toBe('join')
  expect(reparsed.calculationViews[0].joinConfig!.joinType).toBe('inner')
  expect(reparsed.calculationViews[0].joinConfig!.cardinality).toBe('1..1')
  expect(reparsed.calculationViews[0].joinConfig!.conditions).toHaveLength(1)
})
```

- [ ] **Step 7: Update xmlSerializer.ts to serialize joinConfig**

In `xmlSerializer.ts`, extend the calculation view serialization to:
- Write `@_joinType` and `@_cardinality` attributes for join nodes
- Write `joinAttribute` elements from conditions array
- Map cardinality back: `1..1` → `C1_1`, etc.

```typescript
// Inside serialization of each calculationView:
if (node.joinConfig) {
  cvObj['@_joinType'] = node.joinConfig.joinType
  cvObj['@_cardinality'] = serializeCardinality(node.joinConfig.cardinality)
  if (node.joinConfig.conditions.length > 0) {
    cvObj['joinAttribute'] = node.joinConfig.conditions.map(c => ({
      '@_name': c.leftColumn
    }))
  }
}

function serializeCardinality(card: string): string {
  const map: Record<string, string> = {
    '1..1': 'C1_1', '1..N': 'C1_N', 'N..1': 'CN_1', 'N..M': 'CN_M'
  }
  return map[card] || 'C1_1'
}
```

- [ ] **Step 8: Run all tests to verify round-trip passes**

Run: `cd app/vue && npx vitest run`
Expected: All tests PASS

- [ ] **Step 9: Commit**

```bash
git add app/vue/src/services/calcview/__tests__/fixtures/join.hdbcalculationview app/vue/src/services/calcview/xmlParser.ts app/vue/src/services/calcview/xmlSerializer.ts app/vue/src/services/calcview/__tests__/xmlParser.test.ts app/vue/src/services/calcview/__tests__/xmlSerializer.test.ts
git commit -m "feat(calcview): parse and serialize join nodes with conditions and cardinality"
```

---

## Task 6: Column Mapping Tab (Drag & Drop)

**Files:**
- Create: `app/vue/src/components/calcview/properties/MappingTab.vue`
- Modify: `app/vue/src/components/calcview/properties/PropertiesPanel.vue`

**Context:** The mapping tab is the core editing experience. It shows three columns: input data source columns (left), output columns (right), with drag from left to right to map. For joins, there are two input columns (left + middle). Uses HTML5 Drag and Drop API (no external library needed for this).

**Design per spec (lines 184-197):**
- Drag column from data source → drop onto Output Columns area
- Already-mapped columns show strikethrough + "mapped" indicator
- Double-click data source header = "Map All" shortcut

- [ ] **Step 1: Create MappingTab.vue**

```vue
<!-- app/vue/src/components/calcview/properties/MappingTab.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { CalcViewNode, CalcViewModel, Column } from '../../services/calcview/types'
import '@ui5/webcomponents/dist/Button.js'

const props = defineProps<{
  node: CalcViewNode
  model: CalcViewModel
}>()

const emit = defineEmits<{
  'map-column': [column: Column]
  'unmap-column': [columnId: string]
  'map-all': []
}>()

interface InputColumn {
  id: string
  name: string
  dataType: string
  sourceName: string
  isMapped: boolean
}

const inputColumns = computed<InputColumn[]>(() => {
  const columns: InputColumn[] = []
  const mappedIds = new Set(props.node.outputColumns.map(c => c.id))

  for (const input of props.node.inputs) {
    const ds = props.model.dataSources.find(d => d.id === input.node)
    if (ds) {
      for (const col of ds.columns) {
        columns.push({
          id: col.name,
          name: col.name,
          dataType: col.dataType,
          sourceName: input.node,
          isMapped: mappedIds.has(col.name)
        })
      }
    }
    const cvNode = props.model.calculationViews.find(n => n.id === input.node)
    if (cvNode) {
      for (const col of cvNode.outputColumns) {
        columns.push({
          id: col.id,
          name: col.name,
          dataType: col.dataType,
          sourceName: input.node,
          isMapped: mappedIds.has(col.id)
        })
      }
    }
  }
  return columns
})

function onDragStart(e: DragEvent, col: InputColumn) {
  e.dataTransfer?.setData('text/plain', JSON.stringify(col))
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  const data = e.dataTransfer?.getData('text/plain')
  if (!data) return
  const col: InputColumn = JSON.parse(data)
  emit('map-column', {
    id: col.id,
    name: col.name,
    dataType: col.dataType
  })
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
}

function handleUnmap(columnId: string) {
  emit('unmap-column', columnId)
}

function handleMapAll() {
  emit('map-all')
}
</script>

<template>
  <div class="mapping-tab">
    <div class="mapping-columns">
      <!-- Input columns (left) -->
      <div class="column-list input-columns">
        <div class="column-header">
          <span>Input Columns</span>
          <ui5-button design="Transparent" @click="handleMapAll">Map All</ui5-button>
        </div>
        <div
          v-for="col in inputColumns"
          :key="col.id"
          class="column-item"
          :class="{ mapped: col.isMapped }"
          :draggable="!col.isMapped"
          @dragstart="onDragStart($event, col)"
        >
          <span class="col-name">{{ col.name }}</span>
          <span class="col-meta">{{ col.dataType }} · {{ col.sourceName }}</span>
        </div>
      </div>

      <!-- Output columns (right) -->
      <div
        class="column-list output-columns"
        @drop="onDrop"
        @dragover="onDragOver"
      >
        <div class="column-header">
          <span>Output Columns ({{ node.outputColumns.length }})</span>
        </div>
        <div
          v-for="col in node.outputColumns"
          :key="col.id"
          class="column-item output-item"
        >
          <span class="col-name">{{ col.name }}</span>
          <span class="col-meta">{{ col.dataType }}</span>
          <ui5-button
            design="Transparent"
            icon="decline"
            class="remove-btn"
            @click="handleUnmap(col.id)"
          />
        </div>
        <div v-if="node.outputColumns.length === 0" class="drop-zone">
          Drag columns here to map
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mapping-tab {
  padding: 12px;
  height: 100%;
  overflow: hidden;
}

.mapping-columns {
  display: flex;
  gap: 12px;
  height: 100%;
}

.column-list {
  flex: 1;
  border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  border-radius: 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.column-header {
  padding: 8px 12px;
  background: var(--sapList_HeaderBackground, #f2f2f2);
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  font-size: 11px;
  font-weight: 600;
  color: var(--sapTextColor, #333);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.column-item {
  padding: 6px 12px;
  border-bottom: 1px solid var(--sapList_BorderColor, #e5e5e5);
  cursor: grab;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.column-item.mapped {
  opacity: 0.5;
  text-decoration: line-through;
  cursor: default;
}

.output-item {
  cursor: default;
}

.col-name {
  color: var(--sapTextColor, #333);
  font-weight: 500;
}

.col-meta {
  color: var(--sapContent_LabelColor, #666);
  font-size: 10px;
  margin-left: auto;
}

.remove-btn {
  margin-left: 4px;
}

.drop-zone {
  padding: 24px;
  text-align: center;
  color: var(--sapContent_LabelColor, #666);
  font-size: 11px;
  border: 2px dashed var(--sapGroup_ContentBorderColor, #d9d9d9);
  border-radius: 6px;
  margin: 8px;
}
</style>
```

- [ ] **Step 2: Update PropertiesPanel.vue to show MappingTab for calc view nodes**

Modify `app/vue/src/components/calcview/properties/PropertiesPanel.vue`:
- When a calculation view node is selected (not semantics), show tabs
- First tab: "Mapping" → renders `MappingTab`
- Pass map/unmap events up to the editor

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { CalcViewModel } from '../../services/calcview/types'
import ViewPropertiesTab from './ViewPropertiesTab.vue'
import MappingTab from './MappingTab.vue'
import '@ui5/webcomponents/dist/TabContainer.js'
import '@ui5/webcomponents/dist/Tab.js'

const props = defineProps<{
  model: CalcViewModel
  selectedNodeId: string | null
}>()

const emit = defineEmits<{
  'map-column': [nodeId: string, column: any]
  'unmap-column': [nodeId: string, columnId: string]
  'map-all': [nodeId: string]
}>()

const selectedNode = computed(() => {
  if (!props.selectedNodeId) return null
  if (props.selectedNodeId === '__semantics__') return null
  return props.model.calculationViews.find(n => n.id === props.selectedNodeId) ?? null
})

const isSemantics = computed(() => props.selectedNodeId === '__semantics__')
</script>

<template>
  <div class="properties-panel">
    <div v-if="!selectedNodeId" class="no-selection">
      Select a node to view properties
    </div>
    <div v-else-if="isSemantics" class="panel-content">
      <ViewPropertiesTab :model="model" />
    </div>
    <div v-else-if="selectedNode" class="panel-content">
      <div class="panel-header">{{ selectedNode.id }}</div>
      <ui5-tabcontainer>
        <ui5-tab text="Mapping">
          <MappingTab
            :node="selectedNode"
            :model="model"
            @map-column="(col) => emit('map-column', selectedNode!.id, col)"
            @unmap-column="(colId) => emit('unmap-column', selectedNode!.id, colId)"
            @map-all="() => emit('map-all', selectedNode!.id)"
          />
        </ui5-tab>
      </ui5-tabcontainer>
    </div>
  </div>
</template>

<style scoped>
.properties-panel {
  width: 300px;
  min-width: 300px;
  border-left: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  overflow-y: auto;
  background: var(--sapGroup_ContentBackground, #fff);
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--sapContent_LabelColor, #666);
  font-size: 12px;
}

.panel-content {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  color: var(--sapTextColor, #333);
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
}
</style>
```

- [ ] **Step 3: Wire PropertiesPanel events in CalcViewEditor.vue**

Add event handlers to `CalcViewEditor.vue`:

```vue
<!-- In template, update PropertiesPanel usage: -->
<PropertiesPanel
  :model="model"
  :selected-node-id="selectedNodeId"
  @map-column="(nodeId, col) => mapColumn(nodeId, col)"
  @unmap-column="(nodeId, colId) => unmapColumn(nodeId, colId)"
  @map-all="handleMapAll"
/>
```

Add `handleMapAll` function that maps all unmapped input columns at once using a `BatchCommand`.

- [ ] **Step 4: Run all tests**

Run: `cd app/vue && npx vitest run`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add app/vue/src/components/calcview/properties/MappingTab.vue app/vue/src/components/calcview/properties/PropertiesPanel.vue app/vue/src/views/CalcViewEditor.vue
git commit -m "feat(calcview): add column mapping tab with drag-and-drop"
```

---

## Task 7: Join Condition Builder

**Files:**
- Create: `app/vue/src/components/calcview/properties/JoinConditionSection.vue`
- Modify: `app/vue/src/components/calcview/properties/PropertiesPanel.vue`

**Context:** Per spec (lines 199-204): chip-based display `[LEFT.COL] = [RIGHT.COL]`, add condition via "+ Add Condition" button with dropdowns, delete with × button. Only shown for join/nonEquiJoin nodes.

- [ ] **Step 1: Create JoinConditionSection.vue**

```vue
<!-- app/vue/src/components/calcview/properties/JoinConditionSection.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CalcViewNode, CalcViewModel, JoinCondition } from '../../services/calcview/types'
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

    <!-- Existing conditions as chips -->
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

    <!-- Add condition form -->
    <div v-if="showAddForm" class="add-form">
      <ui5-select @change="(e: any) => newLeftCol = e.detail.selectedOption.value">
        <ui5-option value="">Left column...</ui5-option>
        <ui5-option v-for="col in leftInputColumns" :key="col" :value="col">{{ col }}</ui5-option>
      </ui5-select>
      <ui5-select @change="(e: any) => newOperator = e.detail.selectedOption.value">
        <ui5-option value="=">=</ui5-option>
        <ui5-option value="<">&lt;</ui5-option>
        <ui5-option value=">">&gt;</ui5-option>
        <ui5-option value="<=">&lt;=</ui5-option>
        <ui5-option value=">=">&gt;=</ui5-option>
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
```

- [ ] **Step 2: Add JoinConditionSection to PropertiesPanel for join nodes**

In `PropertiesPanel.vue`, conditionally render `JoinConditionSection` above the mapping tab when the selected node is a join or nonEquiJoin:

```vue
<!-- Add inside the ui5-tabcontainer for join/nonEquiJoin nodes: -->
<JoinConditionSection
  v-if="selectedNode.type === 'join' || selectedNode.type === 'nonEquiJoin'"
  :node="selectedNode"
  :model="model"
  @add-condition="(cond) => emit('add-join-condition', selectedNode!.id, cond)"
  @remove-condition="(idx) => emit('remove-join-condition', selectedNode!.id, idx)"
/>
```

Add corresponding emits and handle them in CalcViewEditor via `ChangePropertyCommand`.

- [ ] **Step 3: Run all tests**

Run: `cd app/vue && npx vitest run`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add app/vue/src/components/calcview/properties/JoinConditionSection.vue app/vue/src/components/calcview/properties/PropertiesPanel.vue app/vue/src/views/CalcViewEditor.vue
git commit -m "feat(calcview): add join condition builder with chip-based UI"
```

---

## Task 8: Integration — Demo with Multiple Node Types

**Files:**
- Modify: `app/vue/src/views/CalcViewEditor.vue`

**Context:** Update the demo XML to showcase a join between two projections, demonstrating all Phase 2 features working together: multiple node types rendered, edges connecting them, column mapping visible in properties, and join conditions displayed.

- [ ] **Step 1: Update demo XML in CalcViewEditor.vue**

Replace the demo XML with a more complex model that includes:
- Two data sources (SALES, PRODUCTS)
- Two Projection nodes (Proj_Sales, Proj_Products)
- One Join node (Join_1) connecting both projections
- Join condition on PRODUCT_ID
- Output columns mapped through join
- Layout positions that showcase the bottom-to-top flow

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Calculation:scenario xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore" id="SALES_ANALYSIS" applyPrivilegeType="NONE" dataCategory="CUBE">
  <descriptions defaultDescription="Sales Analysis with Products"/>
  <localVariables/>
  <variableMappings/>
  <dataSources>
    <DataSource id="SALES"><resourceUri>SALES</resourceUri></DataSource>
    <DataSource id="PRODUCTS"><resourceUri>PRODUCTS</resourceUri></DataSource>
  </dataSources>
  <calculationViews>
    <calculationView xsi:type="Calculation:ProjectionView" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Projection_1">
      <viewAttributes>
        <viewAttribute id="AMOUNT"/>
        <viewAttribute id="PRODUCT_ID"/>
        <viewAttribute id="SALES_DATE"/>
      </viewAttributes>
      <input node="SALES"/>
    </calculationView>
    <calculationView xsi:type="Calculation:ProjectionView" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Projection_2">
      <viewAttributes>
        <viewAttribute id="PRODUCT_NAME"/>
        <viewAttribute id="CATEGORY"/>
        <viewAttribute id="PRODUCT_ID"/>
      </viewAttributes>
      <input node="PRODUCTS"/>
    </calculationView>
    <calculationView xsi:type="Calculation:JoinView" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Join_1" cardinality="C1_N" joinType="inner">
      <viewAttributes>
        <viewAttribute id="PRODUCT_ID"/>
        <viewAttribute id="AMOUNT"/>
        <viewAttribute id="PRODUCT_NAME"/>
      </viewAttributes>
      <calculatedViewAttributes/>
      <input node="Projection_1"/>
      <input node="Projection_2"/>
      <joinAttribute name="PRODUCT_ID"/>
    </calculationView>
  </calculationViews>
  <logicalModel id="Join_1">
    <attributes>
      <attribute id="PRODUCT_ID"><descriptions defaultDescription="Product ID"/></attribute>
      <attribute id="PRODUCT_NAME"><descriptions defaultDescription="Product Name"/></attribute>
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
        <upperLeftCorner x="250" y="50"/>
      </shape>
      <shape expanded="true" modelObjectName="Join_1" modelObjectNameSpace="CalculationView">
        <upperLeftCorner x="250" y="200"/>
      </shape>
      <shape expanded="true" modelObjectName="Projection_1" modelObjectNameSpace="CalculationView">
        <upperLeftCorner x="100" y="400"/>
      </shape>
      <shape expanded="true" modelObjectName="Projection_2" modelObjectNameSpace="CalculationView">
        <upperLeftCorner x="400" y="400"/>
      </shape>
    </shapes>
  </layout>
</Calculation:scenario>
```

- [ ] **Step 2: Verify in browser**

Run: `cd app/vue && npm run dev`
- Open http://localhost:5173/calc-view-editor
- Verify: 4 nodes visible (Semantics, Join_1, Projection_1, Projection_2)
- Verify: Edges connect Projection → Join → Semantics
- Verify: Click Join_1 → Properties panel shows join condition chip `PRODUCT_ID = PRODUCT_ID`
- Verify: Mapping tab shows input columns from both projections
- Verify: Ctrl+Z / Ctrl+Shift+Z work after adding a node from palette
- Verify: Double-click an edge removes it (with undo support)
- Verify: Drag from palette adds a new node

- [ ] **Step 3: Run all tests**

Run: `cd app/vue && npx vitest run`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add app/vue/src/views/CalcViewEditor.vue
git commit -m "feat(calcview): update demo to multi-node join model showcasing Phase 2"
```

---

## Summary

| Task | Description | Tests Added |
|------|-------------|-------------|
| 1 | Undo/Redo command stack | 6 tests |
| 2 | Command classes (Add/Remove/Connect/Disconnect/Map/Unmap/Change/JoinCond/Batch) | 9 tests |
| 3 | GenericNode + JoinNode + canvas registration | 0 new (visual) |
| 4 | Edge connection/removal wired to model mutations | 0 new (integration) |
| 5 | Join fixture + parser/serializer extension | 2 tests |
| 6 | Column mapping tab (drag & drop) | 0 new (UI) |
| 7 | Join condition builder | 0 new (UI) |
| 8 | Integration demo with multi-node model | 0 new (manual) |

**Total new tests:** 17
**Estimated time:** ~45-60 minutes of implementation per task via subagent
