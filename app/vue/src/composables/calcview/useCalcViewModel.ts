import { ref, computed } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import type { CalcViewModel } from '../../services/calcview/types'
import { NODE_TYPE_DEFINITIONS } from '../../services/calcview/nodeTypes'

export function useCalcViewModel() {
  const model = ref<CalcViewModel | null>(null)

  const vueFlowNodes = computed<Node[]>(() => {
    if (!model.value) return []

    const nodes: Node[] = []

    // Semantics node (always present at top)
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

    // Calculation view nodes
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

    // Connect calc view nodes to their parents
    // The top-most node connects to semantics
    for (const cvNode of model.value.calculationViews) {
      const hasParent = model.value.calculationViews.some(
        other => other.inputs.some(i => i.node === cvNode.id)
      )

      if (!hasParent) {
        // This is a top-level node — connect to semantics
        edges.push({
          id: `e-${cvNode.id}-semantics`,
          source: cvNode.id,
          target: '__semantics__',
          type: 'dataFlow'
        })
      }

      // Connect inputs
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

  return { model, vueFlowNodes, vueFlowEdges, loadModel }
}
