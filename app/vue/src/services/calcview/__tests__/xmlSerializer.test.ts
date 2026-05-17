import { describe, it, expect } from 'vitest'
import { parseCalcView } from '../xmlParser'
import { serializeCalcView } from '../xmlSerializer'
import { readFileSync } from 'fs'
import { resolve } from 'path'

function loadFixture(name: string): string {
  return readFileSync(resolve(__dirname, 'fixtures', name), 'utf-8')
}

describe('xmlSerializer', () => {
  describe('serializeCalcView', () => {
    it('round-trips a minimal calculation view', () => {
      const xml = loadFixture('minimal.hdbcalculationview')
      const model = parseCalcView(xml)
      const output = serializeCalcView(model)

      // Re-parse to compare semantically (ignoring whitespace differences)
      const reparsed = parseCalcView(output)
      expect(reparsed.id).toBe(model.id)
      expect(reparsed.description).toBe(model.description)
      expect(reparsed.dataCategory).toBe(model.dataCategory)
      expect(reparsed.layout.shapes).toEqual(model.layout.shapes)
    })

    it('round-trips a projection view', () => {
      const xml = loadFixture('projection.hdbcalculationview')
      const model = parseCalcView(xml)
      const output = serializeCalcView(model)

      const reparsed = parseCalcView(output)
      expect(reparsed.id).toBe(model.id)
      expect(reparsed.dataSources).toHaveLength(1)
      expect(reparsed.calculationViews).toHaveLength(1)
      expect(reparsed.calculationViews[0].type).toBe('projection')
      expect(reparsed.logicalModel.attributes).toHaveLength(2)
      expect(reparsed.logicalModel.baseMeasures).toHaveLength(1)
    })

    it('produces valid XML with declaration', () => {
      const xml = loadFixture('minimal.hdbcalculationview')
      const model = parseCalcView(xml)
      const output = serializeCalcView(model)

      expect(output).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(output).toContain('Calculation:scenario')
      expect(output).toContain('xmlns:Calculation')
    })

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

    it('round-trips calculated columns and filter expression', () => {
      const xml = loadFixture('calculated.hdbcalculationview')
      const model = parseCalcView(xml)
      const output = serializeCalcView(model)
      const reparsed = parseCalcView(output)

      expect(reparsed.calculationViews[0].calculatedColumns).toHaveLength(1)
      expect(reparsed.calculationViews[0].calculatedColumns[0].id).toBe('DOUBLE_AMOUNT')
      expect(reparsed.calculationViews[0].calculatedColumns[0].expression).toBe('"AMOUNT" * 2')
      expect(reparsed.calculationViews[0].filterExpression).toBe('"AMOUNT" > 100')
    })

    it('round-trips outputNodeId', () => {
      const xml = loadFixture('semantics.hdbcalculationview')
      const model = parseCalcView(xml)
      const output = serializeCalcView(model)
      const reparsed = parseCalcView(output)
      expect(reparsed.outputNodeId).toBe('Projection_1')
    })

    it('round-trips calculated attributes', () => {
      const xml = loadFixture('semantics.hdbcalculationview')
      const model = parseCalcView(xml)
      const output = serializeCalcView(model)
      const reparsed = parseCalcView(output)
      expect(reparsed.logicalModel.calculatedAttributes).toHaveLength(1)
      expect(reparsed.logicalModel.calculatedAttributes[0].id).toBe('FULL_NAME')
      expect(reparsed.logicalModel.calculatedAttributes[0].expression).toBe('"PRODUCT_ID" || \' - \' || "REGION"')
    })

    it('round-trips calculated measures', () => {
      const xml = loadFixture('semantics.hdbcalculationview')
      const model = parseCalcView(xml)
      const output = serializeCalcView(model)
      const reparsed = parseCalcView(output)
      expect(reparsed.logicalModel.calculatedMeasures).toHaveLength(1)
      expect(reparsed.logicalModel.calculatedMeasures[0].id).toBe('DOUBLE_AMOUNT')
      expect(reparsed.logicalModel.calculatedMeasures[0].expression).toBe('"AMOUNT" * 2')
    })

    it('round-trips restricted measures', () => {
      const xml = loadFixture('semantics.hdbcalculationview')
      const model = parseCalcView(xml)
      const output = serializeCalcView(model)
      const reparsed = parseCalcView(output)
      expect(reparsed.logicalModel.restrictedMeasures).toHaveLength(1)
      expect(reparsed.logicalModel.restrictedMeasures[0].id).toBe('AMOUNT_US')
      expect(reparsed.logicalModel.restrictedMeasures[0].baseMeasure).toBe('AMOUNT')
      expect(reparsed.logicalModel.restrictedMeasures[0].restriction[0].attributeName).toBe('REGION')
      expect(reparsed.logicalModel.restrictedMeasures[0].restriction[0].values).toEqual(['US'])
    })

    it('round-trips hierarchies (leveled and parent-child)', () => {
      const xml = loadFixture('semantics.hdbcalculationview')
      const model = parseCalcView(xml)
      const output = serializeCalcView(model)
      const reparsed = parseCalcView(output)
      expect(reparsed.logicalModel.hierarchies).toHaveLength(2)
      expect(reparsed.logicalModel.hierarchies[0].id).toBe('REGION_HIERARCHY')
      expect(reparsed.logicalModel.hierarchies[0].type).toBe('leveled')
      expect(reparsed.logicalModel.hierarchies[0].levels).toHaveLength(2)
      expect(reparsed.logicalModel.hierarchies[0].levels![0]).toEqual({ name: 'Region', column: 'REGION', ordinal: 1 })
      expect(reparsed.logicalModel.hierarchies[1].id).toBe('PRODUCT_HIERARCHY')
      expect(reparsed.logicalModel.hierarchies[1].type).toBe('parentChild')
      expect(reparsed.logicalModel.hierarchies[1].parentColumn).toBe('PARENT_ID')
      expect(reparsed.logicalModel.hierarchies[1].childColumn).toBe('PRODUCT_ID')
    })
  })
})
