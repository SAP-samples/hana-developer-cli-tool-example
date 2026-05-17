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
})
