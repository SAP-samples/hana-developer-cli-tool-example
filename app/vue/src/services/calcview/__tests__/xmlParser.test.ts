import { describe, it, expect } from 'vitest'
import { parseCalcView } from '../xmlParser'
import { readFileSync } from 'fs'
import { resolve } from 'path'

function loadFixture(name: string): string {
  return readFileSync(resolve(__dirname, 'fixtures', name), 'utf-8')
}

describe('xmlParser', () => {
  describe('parseCalcView', () => {
    it('parses a minimal calculation view', () => {
      const xml = loadFixture('minimal.hdbcalculationview')
      const model = parseCalcView(xml)

      expect(model.id).toBe('MINIMAL_TEST')
      expect(model.description).toBe('Minimal Test View')
      expect(model.dataCategory).toBe('CUBE')
      expect(model.applyPrivilegeType).toBe('NONE')
      expect(model.dataSources).toHaveLength(0)
      expect(model.calculationViews).toHaveLength(0)
      expect(model.localVariables).toHaveLength(0)
    })

    it('parses layout shapes', () => {
      const xml = loadFixture('minimal.hdbcalculationview')
      const model = parseCalcView(xml)

      expect(model.layout.shapes).toHaveLength(1)
      expect(model.layout.shapes[0].modelObjectName).toBe('Output')
      expect(model.layout.shapes[0].upperLeftCorner).toEqual({ x: 40, y: 85 })
    })

    it('parses data sources', () => {
      const xml = loadFixture('projection.hdbcalculationview')
      const model = parseCalcView(xml)

      expect(model.dataSources).toHaveLength(1)
      expect(model.dataSources[0].id).toBe('PRODUCTS')
      expect(model.dataSources[0].objectName).toBe('PRODUCTS')
    })

    it('parses projection calculation view node', () => {
      const xml = loadFixture('projection.hdbcalculationview')
      const model = parseCalcView(xml)

      expect(model.calculationViews).toHaveLength(1)
      const node = model.calculationViews[0]
      expect(node.id).toBe('Projection_1')
      expect(node.type).toBe('projection')
      expect(node.outputColumns).toHaveLength(3)
      expect(node.inputs).toHaveLength(1)
      expect(node.inputs[0].node).toBe('PRODUCTS')
    })

    it('parses logical model attributes and measures', () => {
      const xml = loadFixture('projection.hdbcalculationview')
      const model = parseCalcView(xml)

      expect(model.logicalModel.attributes).toHaveLength(2)
      expect(model.logicalModel.attributes[0].id).toBe('PRODUCT_ID')
      expect(model.logicalModel.baseMeasures).toHaveLength(1)
      expect(model.logicalModel.baseMeasures[0].id).toBe('PRICE')
      expect(model.logicalModel.baseMeasures[0].aggregationType).toBe('sum')
    })

    it('parses multiple layout shapes', () => {
      const xml = loadFixture('projection.hdbcalculationview')
      const model = parseCalcView(xml)

      expect(model.layout.shapes).toHaveLength(2)
      const projShape = model.layout.shapes.find(s => s.modelObjectName === 'Projection_1')
      expect(projShape).toBeDefined()
      expect(projShape!.upperLeftCorner).toEqual({ x: 100, y: 200 })
    })
  })
})
