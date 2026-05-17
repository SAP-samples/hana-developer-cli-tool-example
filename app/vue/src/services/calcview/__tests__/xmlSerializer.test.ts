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
  })
})
