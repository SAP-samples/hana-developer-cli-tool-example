import type { Ref } from 'vue'
import type { CalcViewModel, CalcViewNode, Column, JoinCondition, CalculatedColumn, Variable } from '../../services/calcview/types'
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

export class AddCalculatedColumnCommand implements Command {
  type = 'addCalculatedColumn'
  description: string

  constructor(
    private model: Ref<CalcViewModel>,
    private nodeId: string,
    private column: CalculatedColumn
  ) {
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
  private column: CalculatedColumn
  private removedIndex: number = -1

  constructor(
    private model: Ref<CalcViewModel>,
    private nodeId: string,
    columnId: string
  ) {
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
  private previous: Partial<CalculatedColumn> = {}

  constructor(
    private model: Ref<CalcViewModel>,
    private nodeId: string,
    private columnId: string,
    private updates: Partial<CalculatedColumn>
  ) {
    this.description = `Update calculated column ${columnId}`
    const node = model.value.calculationViews.find(n => n.id === nodeId)
    if (node) {
      const col = node.calculatedColumns.find(c => c.id === columnId)
      if (col) {
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

export class SetFilterExpressionCommand implements Command {
  type = 'setFilterExpression'
  description: string
  private previousExpression: string | undefined

  constructor(
    private model: Ref<CalcViewModel>,
    private nodeId: string,
    private newExpression: string | undefined
  ) {
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

export class AddVariableCommand implements Command {
  type = 'addVariable'
  description: string

  constructor(
    private model: Ref<CalcViewModel>,
    private variable: Variable
  ) {
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
  private variable: Variable
  private removedIndex: number = -1

  constructor(
    private model: Ref<CalcViewModel>,
    variableId: string
  ) {
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
  private previous: Partial<Variable> = {}

  constructor(
    private model: Ref<CalcViewModel>,
    private variableId: string,
    private updates: Partial<Variable>
  ) {
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

export class MoveNodeCommand implements Command {
  type = 'moveNode'
  description: string
  private previousPosition: { x: number; y: number }

  constructor(
    private model: Ref<CalcViewModel>,
    private nodeId: string,
    private newPosition: { x: number; y: number }
  ) {
    this.description = `Move ${nodeId}`
    const shapeName = nodeId === '__semantics__' ? 'Output' : nodeId
    const shape = model.value.layout.shapes.find(s => s.modelObjectName === shapeName)
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
