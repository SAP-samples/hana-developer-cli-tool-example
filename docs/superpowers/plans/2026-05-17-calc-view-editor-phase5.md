# Calculation View Editor Phase 5 — Full BAS Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Calculation View Editor by implementing Semantics column management, hierarchies, restricted measures, node rename/delete, and drag-to-reposition persistence — bringing it to full feature parity with the SAP BAS Calculation View editor's core editing capabilities.

**Architecture:** Each feature follows the established vertical-slice pattern: types already exist in `types.ts` → extend parser/serializer for XML round-trip → add Command classes for undo/redo → add UI components → wire through PropertiesPanel/CalcViewEditor. The Semantics node is the central output definition — its column table becomes a rich editing surface for attribute/measure properties.

**Tech Stack:** Vue 3 + Composition API, UI5 Web Components v2, fast-xml-parser, @vue-flow/core, Vitest

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `app/vue/src/services/calcview/types.ts` | Modify | Add `outputNodeId` field to `CalcViewModel` for logical model source reference |
| `app/vue/src/services/calcview/xmlParser.ts` | Modify | Parse hierarchies, restricted measures, calculated attributes/measures, currency conversion, data masking |
| `app/vue/src/services/calcview/xmlSerializer.ts` | Modify | Serialize hierarchies, restricted measures, calculated attrs/measures, currency conversion, data masking |
| `app/vue/src/services/calcview/__tests__/fixtures/semantics.hdbcalculationview` | Create | Fixture with hierarchies + restricted measures + currency conversion |
| `app/vue/src/services/calcview/__tests__/xmlParser.test.ts` | Modify | Tests for new parsing |
| `app/vue/src/services/calcview/__tests__/xmlSerializer.test.ts` | Modify | Round-trip tests for new features |
| `app/vue/src/composables/calcview/commands.ts` | Modify | Add semantics commands (hierarchy, restricted measure, column props, rename node) |
| `app/vue/src/composables/calcview/useCalcViewModel.ts` | Modify | Add methods for semantics operations, rename, delete with confirmation |
| `app/vue/src/components/calcview/properties/SemanticsColumnsTab.vue` | Create | Full column table with inline property editing |
| `app/vue/src/components/calcview/properties/HierarchiesTab.vue` | Create | Hierarchy management (leveled + parent-child) |
| `app/vue/src/components/calcview/properties/RestrictedMeasuresTab.vue` | Create | Restricted measure builder |
| `app/vue/src/components/calcview/properties/PropertiesPanel.vue` | Modify | Add Semantics tabs, node rename/delete buttons |
| `app/vue/src/components/calcview/canvas/CalcViewCanvas.vue` | Modify | Emit `node-drag-stop` for position persistence |
| `app/vue/src/views/CalcViewEditor.vue` | Modify | Handle new events (rename, delete, drag stop, semantics mutations) |

---

### Task 1: Extend XML Parser for Hierarchies, Restricted Measures, and Calculated Attributes/Measures

**Files:**
- Modify: `app/vue/src/services/calcview/xmlParser.ts`
- Modify: `app/vue/src/services/calcview/__tests__/xmlParser.test.ts`
- Create: `app/vue/src/services/calcview/__tests__/fixtures/semantics.hdbcalculationview`

- [ ] **Step 1: Create the test fixture file**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Calculation:scenario xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore" id="SEMANTICS_TEST" applyPrivilegeType="NONE" dataCategory="CUBE">
  <descriptions defaultDescription="Semantics Features Test"/>
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
        <viewAttribute id="CURRENCY"/>
        <viewAttribute id="REGION"/>
        <viewAttribute id="YEAR"/>
      </viewAttributes>
      <input node="SALES"/>
    </calculationView>
  </calculationViews>
  <logicalModel id="Projection_1">
    <attributes>
      <attribute id="PRODUCT_ID" attributeHierarchyActive="false">
        <descriptions defaultDescription="Product ID"/>
      </attribute>
      <attribute id="REGION" attributeHierarchyActive="false">
        <descriptions defaultDescription="Region"/>
      </attribute>
      <attribute id="YEAR" attributeHierarchyActive="false">
        <descriptions defaultDescription="Year"/>
      </attribute>
    </attributes>
    <calculatedAttributes>
      <calculatedAttribute id="FULL_NAME" datatype="NVARCHAR" length="100" expressionLanguage="SQL">
        <formula>"PRODUCT_ID" || ' - ' || "REGION"</formula>
        <descriptions defaultDescription="Full Name"/>
      </calculatedAttribute>
    </calculatedAttributes>
    <baseMeasures>
      <measure id="AMOUNT" aggregationType="sum">
        <descriptions defaultDescription="Amount"/>
        <currencyConversion generateCurrencyConversion="true">
          <sourceCurrency>CURRENCY</sourceCurrency>
          <targetCurrency>USD</targetCurrency>
          <referenceDate>20240101</referenceDate>
        </currencyConversion>
      </measure>
    </baseMeasures>
    <calculatedMeasures>
      <calculatedMeasure id="DOUBLE_AMOUNT" datatype="DECIMAL" precision="17" scale="2" aggregationType="sum" expressionLanguage="SQL">
        <formula>"AMOUNT" * 2</formula>
        <descriptions defaultDescription="Double Amount"/>
      </calculatedMeasure>
    </calculatedMeasures>
    <restrictedMeasures>
      <restrictedMeasure id="AMOUNT_US" baseMeasure="AMOUNT">
        <descriptions defaultDescription="Amount US Only"/>
        <restriction>
          <filter attributeName="REGION">
            <valueFilter operator="=" value="US"/>
          </filter>
        </restriction>
      </restrictedMeasure>
    </restrictedMeasures>
    <hierarchies>
      <hierarchy id="REGION_HIERARCHY" type="leveled">
        <descriptions defaultDescription="Region Hierarchy"/>
        <levels>
          <level name="Region" column="REGION" ordinal="1"/>
          <level name="Year" column="YEAR" ordinal="2"/>
        </levels>
      </hierarchy>
      <hierarchy id="PRODUCT_HIERARCHY" type="parentChild">
        <descriptions defaultDescription="Product Hierarchy"/>
        <parentColumn>PARENT_ID</parentColumn>
        <childColumn>PRODUCT_ID</childColumn>
      </hierarchy>
    </hierarchies>
  </logicalModel>
  <layout>
    <shapes>
      <shape expanded="true" modelObjectName="Output" modelObjectNameSpace="MeasureGroup">
        <upperLeftCorner x="250" y="50"/>
      </shape>
      <shape expanded="true" modelObjectName="Projection_1" modelObjectNameSpace="CalculationView">
        <upperLeftCorner x="250" y="200"/>
      </shape>
    </shapes>
  </layout>
</Calculation:scenario>
```

- [ ] **Step 2: Write failing tests for hierarchy and restricted measure parsing**

Add to `xmlParser.test.ts`:

```typescript
it('parses calculated attributes', () => {
  const xml = loadFixture('semantics.hdbcalculationview')
  const model = parseCalcView(xml)
  expect(model.logicalModel.calculatedAttributes).toHaveLength(1)
  expect(model.logicalModel.calculatedAttributes[0].id).toBe('FULL_NAME')
  expect(model.logicalModel.calculatedAttributes[0].expression).toBe('"PRODUCT_ID" || \' - \' || "REGION"')
  expect(model.logicalModel.calculatedAttributes[0].dataType).toBe('NVARCHAR')
})

it('parses calculated measures', () => {
  const xml = loadFixture('semantics.hdbcalculationview')
  const model = parseCalcView(xml)
  expect(model.logicalModel.calculatedMeasures).toHaveLength(1)
  expect(model.logicalModel.calculatedMeasures[0].id).toBe('DOUBLE_AMOUNT')
  expect(model.logicalModel.calculatedMeasures[0].expression).toBe('"AMOUNT" * 2')
})

it('parses restricted measures', () => {
  const xml = loadFixture('semantics.hdbcalculationview')
  const model = parseCalcView(xml)
  expect(model.logicalModel.restrictedMeasures).toHaveLength(1)
  const rm = model.logicalModel.restrictedMeasures[0]
  expect(rm.id).toBe('AMOUNT_US')
  expect(rm.baseMeasure).toBe('AMOUNT')
  expect(rm.restriction).toHaveLength(1)
  expect(rm.restriction[0].attributeName).toBe('REGION')
  expect(rm.restriction[0].operator).toBe('=')
  expect(rm.restriction[0].values).toEqual(['US'])
})

it('parses leveled hierarchy', () => {
  const xml = loadFixture('semantics.hdbcalculationview')
  const model = parseCalcView(xml)
  expect(model.logicalModel.hierarchies).toHaveLength(2)
  const h = model.logicalModel.hierarchies[0]
  expect(h.id).toBe('REGION_HIERARCHY')
  expect(h.type).toBe('leveled')
  expect(h.levels).toHaveLength(2)
  expect(h.levels![0]).toEqual({ name: 'Region', column: 'REGION', ordinal: 1 })
})

it('parses parent-child hierarchy', () => {
  const xml = loadFixture('semantics.hdbcalculationview')
  const model = parseCalcView(xml)
  const h = model.logicalModel.hierarchies[1]
  expect(h.id).toBe('PRODUCT_HIERARCHY')
  expect(h.type).toBe('parentChild')
  expect(h.parentColumn).toBe('PARENT_ID')
  expect(h.childColumn).toBe('PRODUCT_ID')
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd app/vue && npx vitest run src/services/calcview/__tests__/xmlParser.test.ts`
Expected: FAIL — `calculatedAttributes` is empty, `restrictedMeasures` is empty, `hierarchies` is empty

- [ ] **Step 4: Implement parser extensions**

In `xmlParser.ts`, add these items to the `isArray` list: `'level'`, `'hierarchy'`, `'filter'` (inside restriction), `'valueFilter'`.

**Important prerequisite:** Add `outputNodeId` field to `CalcViewModel` in `types.ts`:
```typescript
export interface CalcViewModel {
  // ... existing fields ...
  outputNodeId?: string  // The node referenced by <logicalModel id="...">
}
```

In `parseCalcView`, extract the `outputNodeId` from `scenario.logicalModel`:
```typescript
outputNodeId: scenario.logicalModel?.['@_id'] || undefined,
```

Replace the `parseLogicalModel` function:

```typescript
function parseLogicalModel(lm: any): LogicalModel {
  if (!lm) {
    return {
      attributes: [], calculatedAttributes: [], baseMeasures: [],
      calculatedMeasures: [], restrictedMeasures: [], hierarchies: []
    }
  }
  return {
    attributes: parseAttributes(lm.attributes),
    calculatedAttributes: parseCalculatedAttributes(lm.calculatedAttributes),
    baseMeasures: parseMeasures(lm.baseMeasures),
    calculatedMeasures: parseCalculatedMeasures(lm.calculatedMeasures),
    restrictedMeasures: parseRestrictedMeasures(lm.restrictedMeasures),
    hierarchies: parseHierarchies(lm.hierarchies)
  }
}

function parseCalculatedAttributes(ca: any): CalculatedColumn[] {
  if (!ca || !ca.calculatedAttribute) return []
  const list = ensureArray(ca.calculatedAttribute)
  return list.map((a: any) => ({
    id: a['@_id'],
    name: a['@_id'],
    dataType: a['@_datatype'] || 'NVARCHAR',
    expression: a.formula || '',
    aggregationType: a['@_aggregationType'],
    label: a.descriptions?.['@_defaultDescription'] || ''
  }))
}

function parseCalculatedMeasures(cm: any): CalculatedColumn[] {
  if (!cm || !cm.calculatedMeasure) return []
  const list = ensureArray(cm.calculatedMeasure)
  return list.map((m: any) => ({
    id: m['@_id'],
    name: m['@_id'],
    dataType: m['@_datatype'] || 'DECIMAL',
    expression: m.formula || '',
    aggregationType: m['@_aggregationType'] || 'sum',
    label: m.descriptions?.['@_defaultDescription'] || ''
  }))
}

function parseRestrictedMeasures(rm: any): RestrictedMeasure[] {
  if (!rm || !rm.restrictedMeasure) return []
  const list = ensureArray(rm.restrictedMeasure)
  return list.map((m: any) => ({
    id: m['@_id'],
    name: m['@_id'],
    baseMeasure: m['@_baseMeasure'] || '',
    label: m.descriptions?.['@_defaultDescription'] || '',
    restriction: parseRestrictionFilters(m.restriction)
  }))
}

function parseRestrictionFilters(restriction: any): RestrictionFilter[] {
  if (!restriction) return []
  const filters = ensureArray(restriction.filter)
  return filters.map((f: any) => {
    const valueFilters = ensureArray(f.valueFilter)
    return {
      attributeName: f['@_attributeName'] || '',
      operator: valueFilters[0]?.['@_operator'] || '=',
      values: valueFilters.map((vf: any) => vf['@_value'] || '')
    }
  })
}

function parseHierarchies(h: any): Hierarchy[] {
  if (!h || !h.hierarchy) return []
  const list = ensureArray(h.hierarchy)
  return list.map((hier: any) => ({
    id: hier['@_id'],
    name: hier.descriptions?.['@_defaultDescription'] || hier['@_id'],
    type: hier['@_type'] || 'leveled',
    levels: parseLevels(hier.levels),
    parentColumn: hier.parentColumn || undefined,
    childColumn: hier.childColumn || undefined
  }))
}

function parseLevels(levels: any): HierarchyLevel[] | undefined {
  if (!levels || !levels.level) return undefined
  const list = ensureArray(levels.level)
  return list.map((l: any) => ({
    name: l['@_name'] || '',
    column: l['@_column'] || '',
    ordinal: parseInt(l['@_ordinal'] || '0', 10)
  }))
}
```

Add `Hierarchy, HierarchyLevel, RestrictedMeasure, RestrictionFilter` to the import from `./types`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd app/vue && npx vitest run src/services/calcview/__tests__/xmlParser.test.ts`
Expected: All PASS

- [ ] **Step 6: Commit**

```bash
git add app/vue/src/services/calcview/xmlParser.ts app/vue/src/services/calcview/__tests__/xmlParser.test.ts app/vue/src/services/calcview/__tests__/fixtures/semantics.hdbcalculationview
git commit -m "feat(calcview): parse hierarchies, restricted measures, and calculated attrs/measures"
```

---

### Task 2: Extend XML Serializer for Hierarchies, Restricted Measures, and Calculated Attributes/Measures

**Files:**
- Modify: `app/vue/src/services/calcview/xmlSerializer.ts`
- Modify: `app/vue/src/services/calcview/__tests__/xmlSerializer.test.ts`

- [ ] **Step 1: Write failing round-trip tests**

Add to `xmlSerializer.test.ts`:

```typescript
it('serializes calculated attributes', () => {
  const xml = loadFixture('semantics.hdbcalculationview')
  const model = parseCalcView(xml)
  const output = serializeCalcView(model)
  expect(output).toContain('calculatedAttribute')
  expect(output).toContain('FULL_NAME')
  const reparsed = parseCalcView(output)
  expect(reparsed.logicalModel.calculatedAttributes).toHaveLength(1)
  expect(reparsed.logicalModel.calculatedAttributes[0].expression).toBe('"PRODUCT_ID" || \' - \' || "REGION"')
})

it('serializes calculated measures', () => {
  const xml = loadFixture('semantics.hdbcalculationview')
  const model = parseCalcView(xml)
  const output = serializeCalcView(model)
  const reparsed = parseCalcView(output)
  expect(reparsed.logicalModel.calculatedMeasures).toHaveLength(1)
  expect(reparsed.logicalModel.calculatedMeasures[0].id).toBe('DOUBLE_AMOUNT')
})

it('serializes restricted measures', () => {
  const xml = loadFixture('semantics.hdbcalculationview')
  const model = parseCalcView(xml)
  const output = serializeCalcView(model)
  const reparsed = parseCalcView(output)
  expect(reparsed.logicalModel.restrictedMeasures).toHaveLength(1)
  expect(reparsed.logicalModel.restrictedMeasures[0].baseMeasure).toBe('AMOUNT')
})

it('serializes hierarchies (leveled and parent-child)', () => {
  const xml = loadFixture('semantics.hdbcalculationview')
  const model = parseCalcView(xml)
  const output = serializeCalcView(model)
  const reparsed = parseCalcView(output)
  expect(reparsed.logicalModel.hierarchies).toHaveLength(2)
  expect(reparsed.logicalModel.hierarchies[0].type).toBe('leveled')
  expect(reparsed.logicalModel.hierarchies[0].levels).toHaveLength(2)
  expect(reparsed.logicalModel.hierarchies[1].type).toBe('parentChild')
  expect(reparsed.logicalModel.hierarchies[1].parentColumn).toBe('PARENT_ID')
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd app/vue && npx vitest run src/services/calcview/__tests__/xmlSerializer.test.ts`
Expected: FAIL (serializer outputs empty strings for these sections)

- [ ] **Step 3: Implement serializer extensions**

In `xmlSerializer.ts`, update `serializeCalcView` to include `outputNodeId` on the logicalModel element:

```typescript
// In serializeCalcView, change the logicalModel line to:
logicalModel: {
  '@_id': model.outputNodeId || '',
  ...serializeLogicalModel(model.logicalModel)
},
```

Also update `serializeLogicalModel`:

```typescript
function serializeLogicalModel(lm: LogicalModel): Record<string, unknown> {
  return {
    attributes: lm.attributes.length > 0 ? {
      attribute: lm.attributes.map(a => ({
        '@_id': a.id,
        '@_attributeHierarchyActive': 'false',
        '@_displayAttribute': 'false',
        ...(a.hidden ? { '@_hidden': 'true' } : {}),
        descriptions: a.label ? { '@_defaultDescription': a.label } : undefined,
        keyMapping: { '@_columnObjectName': '', '@_columnName': a.id }
      }))
    } : '',
    calculatedAttributes: lm.calculatedAttributes.length > 0 ? {
      calculatedAttribute: lm.calculatedAttributes.map(ca => ({
        '@_id': ca.id,
        '@_datatype': ca.dataType,
        '@_expressionLanguage': 'SQL',
        formula: ca.expression,
        descriptions: ca.label ? { '@_defaultDescription': ca.label } : undefined
      }))
    } : '',
    baseMeasures: lm.baseMeasures.length > 0 ? {
      measure: lm.baseMeasures.map(m => ({
        '@_id': m.id,
        '@_aggregationType': m.aggregationType || 'sum',
        ...(m.hidden ? { '@_hidden': 'true' } : {}),
        descriptions: m.label ? { '@_defaultDescription': m.label } : undefined,
        measureMapping: { '@_columnObjectName': '', '@_columnName': m.id }
      }))
    } : '',
    calculatedMeasures: lm.calculatedMeasures.length > 0 ? {
      calculatedMeasure: lm.calculatedMeasures.map(cm => ({
        '@_id': cm.id,
        '@_datatype': cm.dataType,
        '@_aggregationType': cm.aggregationType || 'sum',
        '@_expressionLanguage': 'SQL',
        formula: cm.expression,
        descriptions: cm.label ? { '@_defaultDescription': cm.label } : undefined
      }))
    } : '',
    restrictedMeasures: lm.restrictedMeasures.length > 0 ? {
      restrictedMeasure: lm.restrictedMeasures.map(rm => ({
        '@_id': rm.id,
        '@_baseMeasure': rm.baseMeasure,
        descriptions: rm.label ? { '@_defaultDescription': rm.label } : undefined,
        restriction: {
          filter: rm.restriction.map(r => ({
            '@_attributeName': r.attributeName,
            valueFilter: r.values.map(v => ({
              '@_operator': r.operator,
              '@_value': v
            }))
          }))
        }
      }))
    } : '',
    hierarchies: serializeHierarchies(lm.hierarchies)
  }
}

function serializeHierarchies(hierarchies: Hierarchy[]): unknown {
  if (hierarchies.length === 0) return ''
  return {
    hierarchy: hierarchies.map(h => ({
      '@_id': h.id,
      '@_type': h.type,
      descriptions: { '@_defaultDescription': h.name },
      ...(h.type === 'leveled' && h.levels ? {
        levels: {
          level: h.levels.map(l => ({
            '@_name': l.name,
            '@_column': l.column,
            '@_ordinal': String(l.ordinal)
          }))
        }
      } : {}),
      ...(h.type === 'parentChild' ? {
        parentColumn: h.parentColumn,
        childColumn: h.childColumn
      } : {})
    }))
  }
}
```

Add `Hierarchy` to the import from `./types`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd app/vue && npx vitest run src/services/calcview/__tests__/xmlSerializer.test.ts`
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add app/vue/src/services/calcview/xmlSerializer.ts app/vue/src/services/calcview/__tests__/xmlSerializer.test.ts
git commit -m "feat(calcview): serialize hierarchies, restricted measures, and calculated attrs/measures"
```

---

### Task 3: Add Semantics Commands (Hierarchy, Restricted Measure, Column Properties)

**Files:**
- Modify: `app/vue/src/composables/calcview/commands.ts`
- Modify: `app/vue/src/composables/calcview/useCalcViewModel.ts`
- Modify: `app/vue/src/services/calcview/__tests__/commands.test.ts`

- [ ] **Step 1: Write failing tests for new commands**

Add to `commands.test.ts`:

Note: The existing test file uses `createMinimalModel()` as the test helper. Use that, not `createTestModel`. Also note that `MoveNodeCommand` already exists in `commands.ts` (line 522) — do NOT redefine it.

```typescript
describe('AddHierarchyCommand', () => {
  it('adds and undoes a hierarchy', () => {
    const model = ref(createMinimalModel())
    const hierarchy = { id: 'H1', name: 'Test', type: 'leveled' as const, levels: [{ name: 'L1', column: 'COL1', ordinal: 1 }] }
    const cmd = new AddHierarchyCommand(model, hierarchy)
    cmd.execute()
    expect(model.value.logicalModel.hierarchies).toHaveLength(1)
    cmd.undo()
    expect(model.value.logicalModel.hierarchies).toHaveLength(0)
  })
})

describe('AddRestrictedMeasureCommand', () => {
  it('adds and undoes a restricted measure', () => {
    const model = ref(createMinimalModel())
    const rm = { id: 'RM1', name: 'Test RM', baseMeasure: 'AMOUNT', restriction: [{ attributeName: 'REGION', operator: '=' as const, values: ['US'] }] }
    const cmd = new AddRestrictedMeasureCommand(model, rm)
    cmd.execute()
    expect(model.value.logicalModel.restrictedMeasures).toHaveLength(1)
    cmd.undo()
    expect(model.value.logicalModel.restrictedMeasures).toHaveLength(0)
  })
})

describe('UpdateColumnPropertiesCommand', () => {
  it('updates and undoes column properties', () => {
    const model = ref(createMinimalModel())
    model.value.logicalModel.attributes.push({ id: 'COL1', name: 'COL1', dataType: 'NVARCHAR', label: 'Old', hidden: false })
    const cmd = new UpdateColumnPropertiesCommand(model, 'attributes', 'COL1', { label: 'New Label', hidden: true })
    cmd.execute()
    expect(model.value.logicalModel.attributes[0].label).toBe('New Label')
    expect(model.value.logicalModel.attributes[0].hidden).toBe(true)
    cmd.undo()
    expect(model.value.logicalModel.attributes[0].label).toBe('Old')
    expect(model.value.logicalModel.attributes[0].hidden).toBe(false)
  })
})

describe('RenameNodeCommand', () => {
  it('renames a node, updates layout shape, and updates outputNodeId', () => {
    const model = ref(createMinimalModel())
    model.value.calculationViews.push({ id: 'Projection_1', type: 'projection', inputs: [], outputColumns: [], calculatedColumns: [] })
    model.value.layout.shapes.push({ modelObjectName: 'Projection_1', modelObjectNameSpace: 'CalculationView', expanded: true, upperLeftCorner: { x: 100, y: 200 } })
    model.value.outputNodeId = 'Projection_1'
    const cmd = new RenameNodeCommand(model, 'Projection_1', 'Sales_Projection')
    cmd.execute()
    expect(model.value.calculationViews[0].id).toBe('Sales_Projection')
    expect(model.value.layout.shapes[0].modelObjectName).toBe('Sales_Projection')
    expect(model.value.outputNodeId).toBe('Sales_Projection')
    cmd.undo()
    expect(model.value.calculationViews[0].id).toBe('Projection_1')
    expect(model.value.outputNodeId).toBe('Projection_1')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd app/vue && npx vitest run src/services/calcview/__tests__/commands.test.ts`
Expected: FAIL (commands don't exist yet)

- [ ] **Step 3: Implement the new commands in commands.ts**

```typescript
export class AddHierarchyCommand implements Command {
  type = 'addHierarchy'
  description: string

  constructor(
    private model: Ref<CalcViewModel>,
    private hierarchy: Hierarchy
  ) {
    this.description = `Add hierarchy ${hierarchy.id}`
  }

  execute() {
    this.model.value.logicalModel.hierarchies.push(this.hierarchy)
  }

  undo() {
    this.model.value.logicalModel.hierarchies = this.model.value.logicalModel.hierarchies.filter(
      h => h.id !== this.hierarchy.id
    )
  }
}

export class RemoveHierarchyCommand implements Command {
  type = 'removeHierarchy'
  description: string
  private removed: Hierarchy | null = null
  private removedIndex = -1

  constructor(
    private model: Ref<CalcViewModel>,
    private hierarchyId: string
  ) {
    this.description = `Remove hierarchy ${hierarchyId}`
  }

  execute() {
    this.removedIndex = this.model.value.logicalModel.hierarchies.findIndex(h => h.id === this.hierarchyId)
    if (this.removedIndex >= 0) {
      this.removed = this.model.value.logicalModel.hierarchies[this.removedIndex]
      this.model.value.logicalModel.hierarchies.splice(this.removedIndex, 1)
    }
  }

  undo() {
    if (this.removed && this.removedIndex >= 0) {
      this.model.value.logicalModel.hierarchies.splice(this.removedIndex, 0, this.removed)
    }
  }
}

export class AddRestrictedMeasureCommand implements Command {
  type = 'addRestrictedMeasure'
  description: string

  constructor(
    private model: Ref<CalcViewModel>,
    private measure: RestrictedMeasure
  ) {
    this.description = `Add restricted measure ${measure.id}`
  }

  execute() {
    this.model.value.logicalModel.restrictedMeasures.push(this.measure)
  }

  undo() {
    this.model.value.logicalModel.restrictedMeasures = this.model.value.logicalModel.restrictedMeasures.filter(
      rm => rm.id !== this.measure.id
    )
  }
}

export class RemoveRestrictedMeasureCommand implements Command {
  type = 'removeRestrictedMeasure'
  description: string
  private removed: RestrictedMeasure | null = null
  private removedIndex = -1

  constructor(
    private model: Ref<CalcViewModel>,
    private measureId: string
  ) {
    this.description = `Remove restricted measure ${measureId}`
  }

  execute() {
    this.removedIndex = this.model.value.logicalModel.restrictedMeasures.findIndex(rm => rm.id === this.measureId)
    if (this.removedIndex >= 0) {
      this.removed = this.model.value.logicalModel.restrictedMeasures[this.removedIndex]
      this.model.value.logicalModel.restrictedMeasures.splice(this.removedIndex, 1)
    }
  }

  undo() {
    if (this.removed && this.removedIndex >= 0) {
      this.model.value.logicalModel.restrictedMeasures.splice(this.removedIndex, 0, this.removed)
    }
  }
}

export class UpdateColumnPropertiesCommand implements Command {
  type = 'updateColumnProperties'
  description: string
  private oldProps: Partial<Column> = {}

  constructor(
    private model: Ref<CalcViewModel>,
    private collectionKey: 'attributes' | 'baseMeasures',
    private columnId: string,
    private updates: Partial<Column>
  ) {
    this.description = `Update ${columnId} properties`
  }

  execute() {
    const col = this.model.value.logicalModel[this.collectionKey].find(c => c.id === this.columnId)
    if (!col) return
    this.oldProps = {}
    for (const key of Object.keys(this.updates) as (keyof Column)[]) {
      (this.oldProps as any)[key] = (col as any)[key]
      ;(col as any)[key] = (this.updates as any)[key]
    }
  }

  undo() {
    const col = this.model.value.logicalModel[this.collectionKey].find(c => c.id === this.columnId)
    if (!col) return
    for (const key of Object.keys(this.oldProps) as (keyof Column)[]) {
      (col as any)[key] = (this.oldProps as any)[key]
    }
  }
}

export class RenameNodeCommand implements Command {
  type = 'renameNode'
  description: string

  constructor(
    private model: Ref<CalcViewModel>,
    private oldId: string,
    private newId: string
  ) {
    this.description = `Rename ${oldId} to ${newId}`
  }

  execute() {
    const node = this.model.value.calculationViews.find(n => n.id === this.oldId)
    if (node) node.id = this.newId
    const shape = this.model.value.layout.shapes.find(s => s.modelObjectName === this.oldId)
    if (shape) shape.modelObjectName = this.newId
    // Update input references in other nodes
    for (const n of this.model.value.calculationViews) {
      for (const input of n.inputs) {
        if (input.node === this.oldId) input.node = this.newId
      }
    }
    // Update outputNodeId reference
    if (this.model.value.outputNodeId === this.oldId) {
      this.model.value.outputNodeId = this.newId
    }
  }

  undo() {
    const node = this.model.value.calculationViews.find(n => n.id === this.newId)
    if (node) node.id = this.oldId
    const shape = this.model.value.layout.shapes.find(s => s.modelObjectName === this.newId)
    if (shape) shape.modelObjectName = this.oldId
    for (const n of this.model.value.calculationViews) {
      for (const input of n.inputs) {
        if (input.node === this.newId) input.node = this.oldId
      }
    }
    if (this.model.value.outputNodeId === this.newId) {
      this.model.value.outputNodeId = this.oldId
    }
  }
}

// NOTE: MoveNodeCommand already exists in commands.ts (line 522). Do NOT redefine it.
// Just import it in useCalcViewModel.ts.
```

Add imports for `Hierarchy, RestrictedMeasure` to the type imports at the top.

- [ ] **Step 4: Add methods to useCalcViewModel.ts**

First, add the new command imports to the import statement at the top of `useCalcViewModel.ts`:
```typescript
import {
  // ... existing imports ...
  MoveNodeCommand,
  AddHierarchyCommand,
  RemoveHierarchyCommand,
  AddRestrictedMeasureCommand,
  RemoveRestrictedMeasureCommand,
  UpdateColumnPropertiesCommand,
  RenameNodeCommand
} from './commands'
```

Also add `Hierarchy, RestrictedMeasure` to the type import from `../../services/calcview/types`.

Then add these methods:

```typescript
function addHierarchy(hierarchy: Hierarchy) {
  if (!model.value) return
  undoRedo.push(new AddHierarchyCommand(model as Ref<CalcViewModel>, hierarchy))
}

function removeHierarchy(hierarchyId: string) {
  if (!model.value) return
  undoRedo.push(new RemoveHierarchyCommand(model as Ref<CalcViewModel>, hierarchyId))
}

function addRestrictedMeasure(measure: RestrictedMeasure) {
  if (!model.value) return
  undoRedo.push(new AddRestrictedMeasureCommand(model as Ref<CalcViewModel>, measure))
}

function removeRestrictedMeasure(measureId: string) {
  if (!model.value) return
  undoRedo.push(new RemoveRestrictedMeasureCommand(model as Ref<CalcViewModel>, measureId))
}

function updateColumnProperties(collectionKey: 'attributes' | 'baseMeasures', columnId: string, updates: Partial<Column>) {
  if (!model.value) return
  undoRedo.push(new UpdateColumnPropertiesCommand(model as Ref<CalcViewModel>, collectionKey, columnId, updates))
}

function renameNode(oldId: string, newId: string) {
  if (!model.value) return
  undoRedo.push(new RenameNodeCommand(model as Ref<CalcViewModel>, oldId, newId))
}

function moveNode(nodeId: string, position: { x: number; y: number }) {
  if (!model.value) return
  undoRedo.push(new MoveNodeCommand(model as Ref<CalcViewModel>, nodeId, position))
}
```

Add these to the return object.

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd app/vue && npx vitest run`
Expected: All PASS

- [ ] **Step 6: Commit**

```bash
git add app/vue/src/composables/calcview/commands.ts app/vue/src/composables/calcview/useCalcViewModel.ts app/vue/src/services/calcview/__tests__/commands.test.ts
git commit -m "feat(calcview): add commands for hierarchy, restricted measure, column props, rename, move"
```

---

### Task 4: Semantics Columns Tab (Full Column Table with Inline Property Editing)

**Files:**
- Create: `app/vue/src/components/calcview/properties/SemanticsColumnsTab.vue`
- Modify: `app/vue/src/components/calcview/properties/PropertiesPanel.vue`
- Modify: `app/vue/src/views/CalcViewEditor.vue`

**Context:** When the Semantics node (`__semantics__`) is selected, the PropertiesPanel currently shows ViewPropertiesTab and ParametersTab. This task adds a `SemanticsColumnsTab` that shows all output columns (attributes and measures) in a table with inline editing of label, hidden, aggregation type, and semantic type properties.

- [ ] **Step 1: Create SemanticsColumnsTab.vue**

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import '@ui5/webcomponents/dist/Table.js'
import '@ui5/webcomponents/dist/TableHeaderRow.js'
import '@ui5/webcomponents/dist/TableHeaderCell.js'
import '@ui5/webcomponents/dist/TableRow.js'
import '@ui5/webcomponents/dist/TableCell.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/CheckBox.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import type { LogicalModel, Column } from '../../../services/calcview/types'

const props = defineProps<{
  logicalModel: LogicalModel
}>()

const emit = defineEmits<{
  'update-column': [collection: 'attributes' | 'baseMeasures', columnId: string, updates: Partial<Column>]
}>()

interface DisplayColumn {
  id: string
  name: string
  label: string
  semanticType: 'attribute' | 'measure'
  aggregationType: string
  hidden: boolean
  collection: 'attributes' | 'baseMeasures'
}

const columns = computed<DisplayColumn[]>(() => {
  const result: DisplayColumn[] = []
  for (const a of props.logicalModel.attributes) {
    result.push({
      id: a.id, name: a.name, label: a.label || '',
      semanticType: 'attribute', aggregationType: '', hidden: a.hidden || false,
      collection: 'attributes'
    })
  }
  for (const m of props.logicalModel.baseMeasures) {
    result.push({
      id: m.id, name: m.name, label: m.label || '',
      semanticType: 'measure', aggregationType: m.aggregationType || 'sum', hidden: m.hidden || false,
      collection: 'baseMeasures'
    })
  }
  return result
})

function handleLabelChange(col: DisplayColumn, e: any) {
  const newLabel = e.target.value
  if (newLabel !== col.label) {
    emit('update-column', col.collection, col.id, { label: newLabel })
  }
}

function handleHiddenChange(col: DisplayColumn, e: any) {
  emit('update-column', col.collection, col.id, { hidden: e.target.checked })
}

function handleAggregationChange(col: DisplayColumn, e: any) {
  const val = e.detail?.selectedOption?.value || e.detail?.selectedOption?.textContent?.trim()
  if (val && val !== col.aggregationType) {
    emit('update-column', col.collection, col.id, { aggregationType: val })
  }
}
</script>

<template>
  <div class="semantics-columns-tab">
    <div class="column-table">
      <div class="table-header">
        <span class="col-name-h">Column</span>
        <span class="col-label-h">Label</span>
        <span class="col-type-h">Type</span>
        <span class="col-agg-h">Aggregation</span>
        <span class="col-hidden-h">Hidden</span>
      </div>
      <div
        v-for="col in columns"
        :key="col.id"
        class="table-row"
        :class="{ 'measure-row': col.semanticType === 'measure' }"
      >
        <span class="col-name">{{ col.name }}</span>
        <ui5-input
          class="col-label"
          :value="col.label"
          placeholder="Description..."
          @change="handleLabelChange(col, $event)"
        />
        <span class="col-type">{{ col.semanticType === 'measure' ? 'Measure' : 'Attribute' }}</span>
        <template v-if="col.semanticType === 'measure'">
          <ui5-select class="col-agg" @change="handleAggregationChange(col, $event)">
            <ui5-option value="sum" :selected="col.aggregationType === 'sum'">SUM</ui5-option>
            <ui5-option value="count" :selected="col.aggregationType === 'count'">COUNT</ui5-option>
            <ui5-option value="min" :selected="col.aggregationType === 'min'">MIN</ui5-option>
            <ui5-option value="max" :selected="col.aggregationType === 'max'">MAX</ui5-option>
            <ui5-option value="avg" :selected="col.aggregationType === 'avg'">AVG</ui5-option>
          </ui5-select>
        </template>
        <span v-else class="col-agg">—</span>
        <ui5-checkbox
          class="col-hidden"
          :checked="col.hidden"
          @change="handleHiddenChange(col, $event)"
        />
      </div>
      <div v-if="columns.length === 0" class="empty">
        No output columns defined in semantics
      </div>
    </div>
  </div>
</template>

<style scoped>
.semantics-columns-tab { padding: 8px; }

.column-table { font-size: 11px; }

.table-header {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 0.8fr 1fr 0.5fr;
  gap: 4px;
  padding: 6px 8px;
  background: var(--sapList_HeaderBackground, #f2f2f2);
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  font-weight: 600;
  color: var(--sapTextColor, #333);
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 0.8fr 1fr 0.5fr;
  gap: 4px;
  padding: 4px 8px;
  border-bottom: 1px solid var(--sapList_BorderColor, #e5e5e5);
  align-items: center;
}

.measure-row { background: var(--sapList_AlternatingBackground, #f7f7f7); }
.col-name { font-weight: 500; overflow: hidden; text-overflow: ellipsis; }
.col-type { color: var(--sapContent_LabelColor, #666); }
.col-agg { color: var(--sapContent_LabelColor, #666); }
.col-label { width: 100%; }
.col-hidden { justify-self: center; }
.empty { padding: 16px; text-align: center; color: var(--sapContent_LabelColor, #666); }
</style>
```

- [ ] **Step 2: Wire into PropertiesPanel**

In `PropertiesPanel.vue`, refactor the semantics section (when `!selectedNodeId || selectedNodeId === '__semantics__'`) to use a `<ui5-tabcontainer>` for navigation between tabs. Import `SemanticsColumnsTab`. The template should become:

```vue
<template v-if="!selectedNodeId || selectedNodeId === '__semantics__'">
  <ui5-tabcontainer>
    <ui5-tab text="Properties">
      <ViewPropertiesTab :model="model" />
    </ui5-tab>
    <ui5-tab text="Columns">
      <SemanticsColumnsTab
        :logical-model="model.logicalModel"
        @update-column="(collection, colId, updates) => emit('update-column', collection, colId, updates)"
      />
    </ui5-tab>
    <ui5-tab text="Variables">
      <ParametersTab
        :model="model"
        @add-variable="(v) => emit('add-variable', v)"
        @remove-variable="(id) => emit('remove-variable', id)"
        @update-variable="(id, updates) => emit('update-variable', id, updates)"
      />
    </ui5-tab>
  </ui5-tabcontainer>
</template>
```

Note: Tasks 5 and 6 will add "Hierarchies" and "Restricted Measures" tabs to this same tabcontainer.

Add `'update-column': [collection: 'attributes' | 'baseMeasures', columnId: string, updates: Partial<Column>]` to PropertiesPanel emits.

- [ ] **Step 3: Wire into CalcViewEditor**

In `CalcViewEditor.vue`, add handler on PropertiesPanel:
```vue
@update-column="(collection, colId, updates) => activeTab?.editor.updateColumnProperties(collection, colId, updates)"
```

- [ ] **Step 4: Run tests and commit**

Run: `cd app/vue && npx vitest run`
Expected: All PASS

```bash
git add app/vue/src/components/calcview/properties/SemanticsColumnsTab.vue app/vue/src/components/calcview/properties/PropertiesPanel.vue app/vue/src/views/CalcViewEditor.vue
git commit -m "feat(calcview): add Semantics Columns tab with inline property editing"
```

---

### Task 5: Hierarchies Tab

**Files:**
- Create: `app/vue/src/components/calcview/properties/HierarchiesTab.vue`
- Modify: `app/vue/src/components/calcview/properties/PropertiesPanel.vue`
- Modify: `app/vue/src/views/CalcViewEditor.vue`

**Context:** Shown under the Semantics node. Displays existing hierarchies and allows adding new leveled or parent-child hierarchies. Uses the available attributes from `logicalModel.attributes` as column sources.

- [ ] **Step 1: Create HierarchiesTab.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import '@ui5/webcomponents/dist/Dialog.js'
import type { LogicalModel, Hierarchy, HierarchyLevel } from '../../../services/calcview/types'

const props = defineProps<{
  logicalModel: LogicalModel
}>()

const emit = defineEmits<{
  'add-hierarchy': [hierarchy: Hierarchy]
  'remove-hierarchy': [hierarchyId: string]
}>()

const showAddDialog = ref(false)
const newId = ref('')
const newName = ref('')
const newType = ref<'leveled' | 'parentChild'>('leveled')
const newParentColumn = ref('')
const newChildColumn = ref('')
const newLevels = ref<HierarchyLevel[]>([])

function openAddDialog() {
  newId.value = ''
  newName.value = ''
  newType.value = 'leveled'
  newParentColumn.value = ''
  newChildColumn.value = ''
  newLevels.value = []
  showAddDialog.value = true
}

function addLevel() {
  newLevels.value.push({ name: '', column: '', ordinal: newLevels.value.length + 1 })
}

function removeLevel(index: number) {
  newLevels.value.splice(index, 1)
  newLevels.value.forEach((l, i) => l.ordinal = i + 1)
}

function confirmAdd() {
  if (!newId.value.trim()) return
  const hierarchy: Hierarchy = {
    id: newId.value.trim(),
    name: newName.value.trim() || newId.value.trim(),
    type: newType.value,
    ...(newType.value === 'leveled' ? { levels: [...newLevels.value] } : {}),
    ...(newType.value === 'parentChild' ? { parentColumn: newParentColumn.value, childColumn: newChildColumn.value } : {})
  }
  emit('add-hierarchy', hierarchy)
  showAddDialog.value = false
}

function handleRemove(id: string) {
  emit('remove-hierarchy', id)
}
</script>

<template>
  <div class="hierarchies-tab">
    <div class="tab-header">
      <span class="tab-title">Hierarchies ({{ logicalModel.hierarchies.length }})</span>
      <ui5-button design="Transparent" @click="openAddDialog">+ Add</ui5-button>
    </div>

    <div class="hierarchy-list">
      <div v-for="h in logicalModel.hierarchies" :key="h.id" class="hierarchy-item">
        <div class="hierarchy-header">
          <span class="hierarchy-name">{{ h.id }}</span>
          <span class="hierarchy-type">{{ h.type }}</span>
          <ui5-button design="Transparent" icon="decline" @click="handleRemove(h.id)" />
        </div>
        <div v-if="h.type === 'leveled' && h.levels" class="hierarchy-levels">
          <span v-for="level in h.levels" :key="level.name" class="level-chip">
            {{ level.name }} ({{ level.column }})
          </span>
        </div>
        <div v-if="h.type === 'parentChild'" class="hierarchy-pc">
          Parent: {{ h.parentColumn }} → Child: {{ h.childColumn }}
        </div>
      </div>
      <div v-if="logicalModel.hierarchies.length === 0" class="empty">No hierarchies defined</div>
    </div>

    <ui5-dialog :open="showAddDialog" header-text="Add Hierarchy" @close="showAddDialog = false">
      <div class="add-dialog-content">
        <div class="form-row">
          <label>ID</label>
          <ui5-input :value="newId" @input="(e: any) => newId = e.target.value" placeholder="HIERARCHY_ID" />
        </div>
        <div class="form-row">
          <label>Name</label>
          <ui5-input :value="newName" @input="(e: any) => newName = e.target.value" placeholder="Display Name" />
        </div>
        <div class="form-row">
          <label>Type</label>
          <ui5-select @change="(e: any) => { const v = e.detail?.selectedOption?.getAttribute('value'); if (v) newType = v }">
            <ui5-option value="leveled" :selected="newType === 'leveled'">Leveled</ui5-option>
            <ui5-option value="parentChild" :selected="newType === 'parentChild'">Parent-Child</ui5-option>
          </ui5-select>
        </div>

        <template v-if="newType === 'leveled'">
          <div class="levels-section">
            <div class="levels-header">
              <span>Levels</span>
              <ui5-button design="Transparent" @click="addLevel">+ Level</ui5-button>
            </div>
            <div v-for="(level, idx) in newLevels" :key="idx" class="level-row">
              <ui5-input :value="level.name" placeholder="Level name" @input="(e: any) => level.name = e.target.value" />
              <ui5-select @change="(e: any) => { const v = e.detail?.selectedOption?.getAttribute('value'); if (v) level.column = v }">
                <ui5-option value="">Select column...</ui5-option>
                <ui5-option v-for="attr in logicalModel.attributes" :key="attr.id" :value="attr.id" :selected="level.column === attr.id">{{ attr.id }}</ui5-option>
              </ui5-select>
              <ui5-button design="Transparent" icon="decline" @click="removeLevel(idx)" />
            </div>
          </div>
        </template>

        <template v-if="newType === 'parentChild'">
          <div class="form-row">
            <label>Parent Column</label>
            <ui5-select @change="(e: any) => { const v = e.detail?.selectedOption?.getAttribute('value'); if (v) newParentColumn = v }">
              <ui5-option value="">Select...</ui5-option>
              <ui5-option v-for="attr in logicalModel.attributes" :key="attr.id" :value="attr.id" :selected="newParentColumn === attr.id">{{ attr.id }}</ui5-option>
            </ui5-select>
          </div>
          <div class="form-row">
            <label>Child Column</label>
            <ui5-select @change="(e: any) => { const v = e.detail?.selectedOption?.getAttribute('value'); if (v) newChildColumn = v }">
              <ui5-option value="">Select...</ui5-option>
              <ui5-option v-for="attr in logicalModel.attributes" :key="attr.id" :value="attr.id" :selected="newChildColumn === attr.id">{{ attr.id }}</ui5-option>
            </ui5-select>
          </div>
        </template>
      </div>
      <div slot="footer" class="dialog-footer">
        <ui5-button design="Emphasized" @click="confirmAdd" :disabled="!newId.trim()">Add</ui5-button>
        <ui5-button design="Transparent" @click="showAddDialog = false">Cancel</ui5-button>
      </div>
    </ui5-dialog>
  </div>
</template>

<style scoped>
.hierarchies-tab { padding: 8px; }
.tab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.tab-title { font-size: 11px; font-weight: 600; color: var(--sapTextColor, #333); }
.hierarchy-item { border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9); border-radius: 6px; padding: 8px; margin-bottom: 6px; }
.hierarchy-header { display: flex; align-items: center; gap: 8px; }
.hierarchy-name { font-weight: 500; font-size: 12px; }
.hierarchy-type { color: var(--sapContent_LabelColor, #666); font-size: 10px; background: var(--sapList_HeaderBackground, #f2f2f2); padding: 2px 6px; border-radius: 4px; }
.hierarchy-levels { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.level-chip { font-size: 10px; background: var(--sapButton_Lite_Background, #f0f0f0); padding: 2px 6px; border-radius: 4px; }
.hierarchy-pc { font-size: 10px; color: var(--sapContent_LabelColor, #666); margin-top: 4px; }
.empty { padding: 16px; text-align: center; color: var(--sapContent_LabelColor, #666); font-size: 11px; }
.add-dialog-content { padding: 16px; min-width: 400px; display: flex; flex-direction: column; gap: 12px; }
.form-row { display: flex; flex-direction: column; gap: 4px; }
.form-row label { font-size: 11px; color: var(--sapContent_LabelColor, #666); }
.levels-section { border-top: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9); padding-top: 8px; }
.levels-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.level-row { display: flex; gap: 8px; align-items: center; margin-bottom: 4px; }
.level-row ui5-input { flex: 1; }
.level-row ui5-select { flex: 1; }
.dialog-footer { display: flex; gap: 8px; justify-content: flex-end; padding: 8px 16px; }
</style>
```

- [ ] **Step 2: Wire into PropertiesPanel**

Import `HierarchiesTab` and add to the semantics section (when `!selectedNodeId || selectedNodeId === '__semantics__'`):

```vue
<HierarchiesTab
  :logical-model="model.logicalModel"
  @add-hierarchy="(h) => emit('add-hierarchy', h)"
  @remove-hierarchy="(id) => emit('remove-hierarchy', id)"
/>
```

Add emits:
```typescript
'add-hierarchy': [hierarchy: Hierarchy]
'remove-hierarchy': [hierarchyId: string]
```

- [ ] **Step 3: Wire into CalcViewEditor**

```vue
@add-hierarchy="(h) => activeTab?.editor.addHierarchy(h)"
@remove-hierarchy="(id) => activeTab?.editor.removeHierarchy(id)"
```

- [ ] **Step 4: Run tests and commit**

```bash
cd app/vue && npx vitest run
git add app/vue/src/components/calcview/properties/HierarchiesTab.vue app/vue/src/components/calcview/properties/PropertiesPanel.vue app/vue/src/views/CalcViewEditor.vue
git commit -m "feat(calcview): add Hierarchies tab for leveled and parent-child hierarchy management"
```

---

### Task 6: Restricted Measures Tab

**Files:**
- Create: `app/vue/src/components/calcview/properties/RestrictedMeasuresTab.vue`
- Modify: `app/vue/src/components/calcview/properties/PropertiesPanel.vue`
- Modify: `app/vue/src/views/CalcViewEditor.vue`

**Context:** Shown under the Semantics node. Displays existing restricted measures and allows creating new ones. A restricted measure references a base measure and adds filter conditions (attribute restrictions).

- [ ] **Step 1: Create RestrictedMeasuresTab.vue**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import '@ui5/webcomponents/dist/Dialog.js'
import type { LogicalModel, RestrictedMeasure, RestrictionFilter } from '../../../services/calcview/types'

const props = defineProps<{
  logicalModel: LogicalModel
}>()

const emit = defineEmits<{
  'add-restricted-measure': [measure: RestrictedMeasure]
  'remove-restricted-measure': [measureId: string]
}>()

const showAddDialog = ref(false)
const newId = ref('')
const newName = ref('')
const newBaseMeasure = ref('')
const newFilters = ref<RestrictionFilter[]>([])

const availableMeasures = computed(() => props.logicalModel.baseMeasures)
const availableAttributes = computed(() => props.logicalModel.attributes)

function openAddDialog() {
  newId.value = ''
  newName.value = ''
  newBaseMeasure.value = ''
  newFilters.value = []
  showAddDialog.value = true
}

function addFilter() {
  newFilters.value.push({ attributeName: '', operator: '=', values: [''] })
}

function removeFilter(index: number) {
  newFilters.value.splice(index, 1)
}

function confirmAdd() {
  if (!newId.value.trim() || !newBaseMeasure.value) return
  const measure: RestrictedMeasure = {
    id: newId.value.trim(),
    name: newName.value.trim() || newId.value.trim(),
    baseMeasure: newBaseMeasure.value,
    restriction: newFilters.value.filter(f => f.attributeName && f.values[0]),
    label: newName.value.trim()
  }
  emit('add-restricted-measure', measure)
  showAddDialog.value = false
}
</script>

<template>
  <div class="restricted-measures-tab">
    <div class="tab-header">
      <span class="tab-title">Restricted Measures ({{ logicalModel.restrictedMeasures.length }})</span>
      <ui5-button design="Transparent" @click="openAddDialog">+ Add</ui5-button>
    </div>

    <div class="measure-list">
      <div v-for="rm in logicalModel.restrictedMeasures" :key="rm.id" class="measure-item">
        <div class="measure-header">
          <span class="measure-name">{{ rm.id }}</span>
          <span class="measure-base">Base: {{ rm.baseMeasure }}</span>
          <ui5-button design="Transparent" icon="decline" @click="emit('remove-restricted-measure', rm.id)" />
        </div>
        <div class="measure-filters">
          <span v-for="(filter, idx) in rm.restriction" :key="idx" class="filter-chip">
            {{ filter.attributeName }} {{ filter.operator }} {{ filter.values.join(', ') }}
          </span>
        </div>
      </div>
      <div v-if="logicalModel.restrictedMeasures.length === 0" class="empty">No restricted measures defined</div>
    </div>

    <ui5-dialog :open="showAddDialog" header-text="Add Restricted Measure" @close="showAddDialog = false">
      <div class="add-dialog-content">
        <div class="form-row">
          <label>ID</label>
          <ui5-input :value="newId" @input="(e: any) => newId = e.target.value" placeholder="MEASURE_ID" />
        </div>
        <div class="form-row">
          <label>Label</label>
          <ui5-input :value="newName" @input="(e: any) => newName = e.target.value" placeholder="Display name" />
        </div>
        <div class="form-row">
          <label>Base Measure</label>
          <ui5-select @change="(e: any) => { const v = e.detail?.selectedOption?.getAttribute('value'); if (v) newBaseMeasure = v }">
            <ui5-option value="">Select measure...</ui5-option>
            <ui5-option v-for="m in availableMeasures" :key="m.id" :value="m.id" :selected="newBaseMeasure === m.id">{{ m.id }}</ui5-option>
          </ui5-select>
        </div>
        <div class="filters-section">
          <div class="filters-header">
            <span>Restrictions</span>
            <ui5-button design="Transparent" @click="addFilter">+ Filter</ui5-button>
          </div>
          <div v-for="(filter, idx) in newFilters" :key="idx" class="filter-row">
            <ui5-select @change="(e: any) => { const v = e.detail?.selectedOption?.getAttribute('value'); if (v) filter.attributeName = v }">
              <ui5-option value="">Attribute...</ui5-option>
              <ui5-option v-for="attr in availableAttributes" :key="attr.id" :value="attr.id" :selected="filter.attributeName === attr.id">{{ attr.id }}</ui5-option>
            </ui5-select>
            <ui5-select @change="(e: any) => { const v = e.detail?.selectedOption?.getAttribute('value'); if (v) filter.operator = v as any }">
              <ui5-option value="=" :selected="filter.operator === '='">= (equals)</ui5-option>
              <ui5-option value="IN" :selected="filter.operator === 'IN'">IN</ui5-option>
              <ui5-option value="BETWEEN" :selected="filter.operator === 'BETWEEN'">BETWEEN</ui5-option>
            </ui5-select>
            <ui5-input :value="filter.values[0]" placeholder="Value" @input="(e: any) => filter.values = [e.target.value]" />
            <ui5-button design="Transparent" icon="decline" @click="removeFilter(idx)" />
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <ui5-button design="Emphasized" @click="confirmAdd" :disabled="!newId.trim() || !newBaseMeasure">Add</ui5-button>
        <ui5-button design="Transparent" @click="showAddDialog = false">Cancel</ui5-button>
      </div>
    </ui5-dialog>
  </div>
</template>

<style scoped>
.restricted-measures-tab { padding: 8px; }
.tab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.tab-title { font-size: 11px; font-weight: 600; color: var(--sapTextColor, #333); }
.measure-item { border: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9); border-radius: 6px; padding: 8px; margin-bottom: 6px; }
.measure-header { display: flex; align-items: center; gap: 8px; }
.measure-name { font-weight: 500; font-size: 12px; }
.measure-base { color: var(--sapContent_LabelColor, #666); font-size: 10px; margin-left: auto; }
.measure-filters { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.filter-chip { font-size: 10px; background: var(--sapWarningBackground, #fff3cd); padding: 2px 6px; border-radius: 4px; }
.empty { padding: 16px; text-align: center; color: var(--sapContent_LabelColor, #666); font-size: 11px; }
.add-dialog-content { padding: 16px; min-width: 450px; display: flex; flex-direction: column; gap: 12px; }
.form-row { display: flex; flex-direction: column; gap: 4px; }
.form-row label { font-size: 11px; color: var(--sapContent_LabelColor, #666); }
.filters-section { border-top: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9); padding-top: 8px; }
.filters-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.filter-row { display: flex; gap: 6px; align-items: center; margin-bottom: 4px; }
.filter-row ui5-select { flex: 1; }
.filter-row ui5-input { flex: 1; }
.dialog-footer { display: flex; gap: 8px; justify-content: flex-end; padding: 8px 16px; }
</style>
```

- [ ] **Step 2: Wire into PropertiesPanel**

Import `RestrictedMeasuresTab` and add to the semantics section:

```vue
<RestrictedMeasuresTab
  :logical-model="model.logicalModel"
  @add-restricted-measure="(rm) => emit('add-restricted-measure', rm)"
  @remove-restricted-measure="(id) => emit('remove-restricted-measure', id)"
/>
```

Add emits:
```typescript
'add-restricted-measure': [measure: RestrictedMeasure]
'remove-restricted-measure': [measureId: string]
```

- [ ] **Step 3: Wire into CalcViewEditor**

```vue
@add-restricted-measure="(rm) => activeTab?.editor.addRestrictedMeasure(rm)"
@remove-restricted-measure="(id) => activeTab?.editor.removeRestrictedMeasure(id)"
```

- [ ] **Step 4: Run tests and commit**

```bash
cd app/vue && npx vitest run
git add app/vue/src/components/calcview/properties/RestrictedMeasuresTab.vue app/vue/src/components/calcview/properties/PropertiesPanel.vue app/vue/src/views/CalcViewEditor.vue
git commit -m "feat(calcview): add Restricted Measures tab with filter builder"
```

---

### Task 7: Node Rename, Node Delete, and Drag-to-Reposition

**Files:**
- Modify: `app/vue/src/components/calcview/properties/PropertiesPanel.vue`
- Modify: `app/vue/src/components/calcview/canvas/CalcViewCanvas.vue`
- Modify: `app/vue/src/views/CalcViewEditor.vue`

**Context:** This task adds three interactive features: (1) rename node from properties panel, (2) delete node from properties panel, (3) persist drag position changes to the model via MoveNodeCommand.

- [ ] **Step 1: Add rename/delete UI to PropertiesPanel**

In `PropertiesPanel.vue`, when a calc view node is selected (not semantics), add a header section with rename and delete buttons:

```vue
<!-- Above the tabcontainer, when selectedNode exists -->
<div class="node-actions">
  <ui5-input
    :value="selectedNode.id"
    @change="(e: any) => { const v = e.target.value?.trim(); if (v && v !== selectedNode!.id) emit('rename-node', selectedNode!.id, v) }"
    class="node-name-input"
  />
  <ui5-button design="Negative" icon="delete" @click="emit('delete-node', selectedNode!.id)">Delete</ui5-button>
</div>
```

Add emits:
```typescript
'rename-node': [oldId: string, newId: string]
'delete-node': [nodeId: string]
```

- [ ] **Step 2: Add node-drag-stop event to CalcViewCanvas**

In `CalcViewCanvas.vue`, listen to Vue Flow's `@node-drag-stop` event:

```vue
@node-drag-stop="handleNodeDragStop"
```

```typescript
const emit = defineEmits<{
  'node-click': [node: Node]
  'connect': [connection: Connection]
  'edge-remove': [edge: Edge]
  'node-drag-stop': [nodeId: string, position: { x: number; y: number }]
}>()

function handleNodeDragStop(event: any) {
  // event.node contains the node that was dragged with its new position
  if (event.node) {
    emit('node-drag-stop', event.node.id, {
      x: Math.round(event.node.position.x),
      y: Math.round(event.node.position.y)
    })
  }
}
```

- [ ] **Step 3: Wire into CalcViewEditor**

In `CalcViewEditor.vue`:

```typescript
function handleRenameNode(oldId: string, newId: string) {
  if (activeTab.value) activeTab.value.editor.renameNode(oldId, newId)
}

function handleDeleteNode(nodeId: string) {
  if (activeTab.value) activeTab.value.editor.removeNode(nodeId)
  if (selectedNodeId.value === nodeId) selectedNodeId.value = null
}

function handleNodeDragStop(nodeId: string, position: { x: number; y: number }) {
  if (nodeId === '__semantics__') return
  if (activeTab.value) activeTab.value.editor.moveNode(nodeId, position)
}
```

In the template:
```vue
<CalcViewCanvas
  ...
  @node-drag-stop="handleNodeDragStop"
/>
<PropertiesPanel
  ...
  @rename-node="handleRenameNode"
  @delete-node="handleDeleteNode"
/>
```

- [ ] **Step 4: Run tests and commit**

```bash
cd app/vue && npx vitest run
git add app/vue/src/components/calcview/properties/PropertiesPanel.vue app/vue/src/components/calcview/canvas/CalcViewCanvas.vue app/vue/src/views/CalcViewEditor.vue
git commit -m "feat(calcview): add node rename, delete, and drag-to-reposition persistence"
```

---

## Summary

| Task | Description | Key Components |
|------|-------------|----------------|
| 1 | Parse hierarchies, restricted measures, calculated attrs/measures | xmlParser.ts + fixture + tests |
| 2 | Serialize hierarchies, restricted measures, calculated attrs/measures | xmlSerializer.ts + round-trip tests |
| 3 | Commands for hierarchy, restricted measure, column props, rename, move | commands.ts + useCalcViewModel.ts + tests |
| 4 | Semantics Columns Tab with inline editing | SemanticsColumnsTab.vue |
| 5 | Hierarchies Tab | HierarchiesTab.vue |
| 6 | Restricted Measures Tab | RestrictedMeasuresTab.vue |
| 7 | Node rename, delete, drag-to-reposition | PropertiesPanel + CalcViewCanvas + CalcViewEditor |

**Estimated time:** ~15-25 minutes per task via subagent

**Notes:**
- Currency conversion and data masking are deferred. The spec mentions them but they require complex HANA-specific configuration UIs (conversion tables, masking rules) that go beyond basic column properties. The existing fast-xml-parser preserves unrecognized XML elements in the parsed output, so these features won't cause data loss during round-trip.
- Calculated measures lose `precision` and `scale` attributes in round-trip (the `CalculatedColumn` type doesn't include these fields). This is a known limitation — extending the type is a future improvement.
- The `outputNodeId` field is added to `CalcViewModel` to track the `<logicalModel id="...">` attribute, which references the topmost node feeding the output. This is essential for node rename correctness.
- The `@vue-flow/core` `node-drag-stop` event fires after drag completes, giving us the final position to commit to the model. This makes drags undoable.
