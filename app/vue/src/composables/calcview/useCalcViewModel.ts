import { ref, computed, type Ref } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import type { CalcViewModel, CalcViewNode, NodeType, Column, JoinCondition, CalculatedColumn, Variable } from '../../services/calcview/types'
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
  RemoveJoinConditionCommand,
  AddCalculatedColumnCommand,
  RemoveCalculatedColumnCommand,
  UpdateCalculatedColumnCommand,
  SetFilterExpressionCommand,
  AddVariableCommand,
  RemoveVariableCommand,
  UpdateVariableCommand
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
        ? { joinConfig: { joinType: 'inner' as const, cardinality: '1..1' as const, conditions: [] } }
        : {}),
      ...(type === 'rank'
        ? { rankConfig: { orderBy: [], thresholdType: 'top' as const, count: 10 } }
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

  function setFilterExpression(nodeId: string, expression: string | undefined) {
    if (!model.value) return
    undoRedo.push(new SetFilterExpressionCommand(model as Ref<CalcViewModel>, nodeId, expression))
  }

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
    removeJoinCondition,
    addCalculatedColumn,
    removeCalculatedColumn,
    updateCalculatedColumn,
    setFilterExpression,
    addVariable,
    removeVariable,
    updateVariable
  }
}
