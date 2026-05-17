import ELK from 'elkjs/lib/elk.bundled.js'
import type { Ref } from 'vue'
import type { CalcViewModel } from '../../services/calcview/types'
import { MoveNodeCommand, BatchCommand } from './commands'
import type { createUndoRedoStack } from './useCalcViewUndoRedo'

const elk = new ELK()

export async function autoLayout(
  model: Ref<CalcViewModel>,
  undoRedo: ReturnType<typeof createUndoRedoStack>
) {
  const m = model.value
  if (!m) return

  const nodes: { id: string; width: number; height: number }[] = []
  const edges: { id: string; sources: string[]; targets: string[] }[] = []

  nodes.push({ id: '__semantics__', width: 200, height: 60 })

  for (const cvNode of m.calculationViews) {
    nodes.push({ id: cvNode.id, width: 180, height: 50 })
  }

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
