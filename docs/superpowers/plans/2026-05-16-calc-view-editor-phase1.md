# Calculation View Editor — Phase 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the foundational infrastructure for the Graphical Calculation View Editor — XML parsing, reactive model, basic Vue Flow canvas, node palette, and properties shell.

**Architecture:** XML files are parsed by `fast-xml-parser` into a reactive TypeScript model (`CalcViewModel`). The model is transformed into Vue Flow nodes/edges for rendering. A node palette allows dragging new nodes onto the canvas. A properties panel shows basic view properties for the selected node.

**Tech Stack:** Vue 3 + TypeScript, Vue Flow (@vue-flow/core), fast-xml-parser, elkjs, UI5 Web Components, Vite, Mocha + Chai (backend tests)

**Spec:** `docs/superpowers/specs/2026-05-16-calc-view-editor-design.md`

---

## File Structure

### New Files (Frontend — `app/vue/src/`)

| File | Responsibility |
|------|---------------|
| `services/calcview/xmlParser.ts` | Parse `.hdbcalculationview` XML → CalcViewModel |
| `services/calcview/xmlSerializer.ts` | Serialize CalcViewModel → XML string |
| `services/calcview/types.ts` | All TypeScript interfaces (CalcViewModel, CalcViewNode, etc.) |
| `services/calcview/nodeTypes.ts` | Node type registry (metadata, colors, icons) |
| `services/calcview/calcViewApi.ts` | REST API calls for file operations (stub) |
| `composables/calcview/useCalcViewModel.ts` | Reactive model management |
| `views/CalcViewBrowser.vue` | Modeling Home — browse/open views |
| `views/CalcViewEditor.vue` | Editor shell (tabs + 3-panel layout) |
| `components/calcview/canvas/CalcViewCanvas.vue` | Vue Flow wrapper |
| `components/calcview/canvas/NodePalette.vue` | Draggable node type list |
| `components/calcview/canvas/nodes/SemanticsNode.vue` | Semantics output node |
| `components/calcview/canvas/nodes/ProjectionNode.vue` | Projection node |
| `components/calcview/canvas/edges/DataFlowEdge.vue` | Custom edge component |
| `components/calcview/properties/PropertiesPanel.vue` | Properties panel shell |
| `components/calcview/properties/ViewPropertiesTab.vue` | View-level properties |
| `components/calcview/toolbar/EditorToolbar.vue` | Toolbar with actions |
| `components/calcview/tabs/EditorTabBar.vue` | Multi-tab bar |

### New Files (Backend — project root)

| File | Responsibility |
|------|---------------|
| `routes/calcView.js` | Express routes for calc view file operations |
| `tests/routes/calcView.http.Test.js` | Route integration tests |

### Modified Files

| File | Change |
|------|--------|
| `app/vue/package.json` | Add @vue-flow/core, @vue-flow/minimap, @vue-flow/controls, elkjs, fast-xml-parser |
| `app/vue/src/router.ts` | Add calc view routes |
| `app/vue/src/model/navigation.ts` | Add "Modeling" nav group |

### Test Fixtures

| File | Purpose |
|------|---------|
| `app/vue/src/services/calcview/__tests__/xmlParser.test.ts` | Parser unit tests |
| `app/vue/src/services/calcview/__tests__/xmlSerializer.test.ts` | Serializer unit tests |
| `app/vue/src/services/calcview/__tests__/fixtures/minimal.hdbcalculationview` | Minimal valid XML |
| `app/vue/src/services/calcview/__tests__/fixtures/projection.hdbcalculationview` | View with Projection node |
| `app/vue/src/services/calcview/__tests__/fixtures/join.hdbcalculationview` | View with Join + 2 Projections (Phase 2 — listed for reference) |

---

## Task 1: Install Dependencies & Project Setup

**Files:**
- Modify: `app/vue/package.json`

- [ ] **Step 1: Install npm packages**

```bash
cd app/vue && npm install @vue-flow/core @vue-flow/minimap @vue-flow/controls elkjs fast-xml-parser
```

- [ ] **Step 2: Verify existing Vite proxy covers calcview routes**

The existing `/hana` proxy entry in `app/vue/vite.config.ts` already proxies all `/hana/*` requests (including `/hana/calcview/*`) to `http://localhost:3010`. No additional proxy entry is needed.

- [ ] **Step 3: Verify build still works**

```bash
cd app/vue && npx vue-tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add app/vue/package.json app/vue/package-lock.json
git commit -m "feat(calcview): add Vue Flow, elkjs, and fast-xml-parser dependencies"
```

---

## Task 2: TypeScript Interfaces & Node Type Registry

**Files:**
- Create: `app/vue/src/services/calcview/types.ts`
- Create: `app/vue/src/services/calcview/nodeTypes.ts`

- [ ] **Step 1: Create the types file**

Create `app/vue/src/services/calcview/types.ts` with all interfaces from the spec:

```typescript
export type DataCategory = 'CUBE' | 'DIMENSION' | 'DEFAULT'

export type NodeType =
  | 'join' | 'nonEquiJoin' | 'projection' | 'aggregation'
  | 'union' | 'minus' | 'intersect' | 'rank'
  | 'tableFunction' | 'hierarchyFunction'

export interface CalcViewModel {
  id: string
  description: string
  dataCategory: DataCategory
  applyPrivilegeType: string
  dataSources: DataSource[]
  calculationViews: CalcViewNode[]
  logicalModel: LogicalModel
  localVariables: Variable[]
  variableMappings: VariableMapping[]
  layout: LayoutInfo
  _unknownElements: unknown[]
}

export interface CalcViewNode {
  id: string
  type: NodeType
  inputs: NodeInput[]
  outputColumns: Column[]
  calculatedColumns: CalculatedColumn[]
  filterExpression?: string
  joinConfig?: JoinConfig
  rankConfig?: RankConfig
  unionConfig?: UnionConfig
  tableFunctionConfig?: TableFunctionConfig
  hierarchyFunctionConfig?: HierarchyFunctionConfig
}

export interface NodeInput {
  name: string
  node: string
}

export interface JoinConfig {
  joinType: 'inner' | 'leftOuter' | 'rightOuter' | 'fullOuter' | 'textJoin' | 'referential'
  cardinality: '1..1' | '1..N' | 'N..1' | 'N..M'
  conditions: JoinCondition[]
}

export interface JoinCondition {
  leftColumn: string
  rightColumn: string
  operator: '=' | '<' | '>' | '<=' | '>=' | '!='
}

export interface RankConfig {
  orderBy: { column: string; direction: 'ASC' | 'DESC' }[]
  thresholdType: 'top' | 'bottom'
  count: number
}

export interface UnionConfig {
  pruningType?: 'NONE' | 'REMOVE_EMPTY'
}

export interface TableFunctionConfig {
  schemaName: string
  functionName: string
  parameterMappings: { paramName: string; value: string }[]
}

export interface HierarchyFunctionConfig {
  hierarchyType: 'leveled' | 'parentChild'
  sourceNode: string
  parentColumn?: string
  childColumn?: string
  levels?: { name: string; column: string }[]
}

export interface DataSource {
  id: string
  type: 'table' | 'view' | 'calculationView'
  schemaName?: string
  objectName: string
  columns: ColumnInfo[]
}

export interface ColumnInfo {
  name: string
  dataType: string
  length?: number
  precision?: number
  scale?: number
}

export interface Column {
  id: string
  name: string
  dataType: string
  length?: number
  precision?: number
  scale?: number
  isKey?: boolean
  semanticType?: 'attribute' | 'measure'
  aggregationType?: string
  label?: string
  hidden?: boolean
}

export interface CalculatedColumn {
  id: string
  name: string
  dataType: string
  expression: string
  aggregationType?: string
  label?: string
}

export interface LogicalModel {
  attributes: Column[]
  calculatedAttributes: CalculatedColumn[]
  baseMeasures: Column[]
  calculatedMeasures: CalculatedColumn[]
  restrictedMeasures: RestrictedMeasure[]
  hierarchies: Hierarchy[]
}

export interface RestrictedMeasure {
  id: string
  name: string
  baseMeasure: string
  restriction: RestrictionFilter[]
  label?: string
}

export interface RestrictionFilter {
  attributeName: string
  operator: '=' | 'IN' | 'BETWEEN'
  values: string[]
}

export interface Hierarchy {
  id: string
  name: string
  type: 'leveled' | 'parentChild'
  levels?: HierarchyLevel[]
  parentColumn?: string
  childColumn?: string
}

export interface HierarchyLevel {
  name: string
  column: string
  ordinal: number
}

export interface Variable {
  id: string
  name: string
  dataType: string
  defaultValue?: string
  selectionType?: 'single' | 'interval' | 'range'
  mandatory?: boolean
  description?: string
}

export interface VariableMapping {
  sourceVariable: string
  targetVariable: string
  nodeId: string
}

export interface LayoutInfo {
  shapes: NodeShape[]
}

export interface NodeShape {
  modelObjectName: string
  modelObjectNameSpace: string
  expanded: boolean
  upperLeftCorner: { x: number; y: number }
}
```

- [ ] **Step 2: Create the node type registry**

Create `app/vue/src/services/calcview/nodeTypes.ts`:

```typescript
import type { NodeType } from './types'

export interface NodeTypeDefinition {
  type: NodeType
  label: string
  icon: string
  themeVariable: string
  maxInputs: number
  canBeLeaf: boolean
}

export const NODE_TYPE_DEFINITIONS: Record<NodeType, NodeTypeDefinition> = {
  join: {
    type: 'join',
    label: 'Join',
    icon: '⊕',
    themeVariable: '--sapChart_OrderedColor_1',
    maxInputs: 2,
    canBeLeaf: false
  },
  nonEquiJoin: {
    type: 'nonEquiJoin',
    label: 'Non Equi Join',
    icon: '⊗',
    themeVariable: '--sapChart_OrderedColor_2',
    maxInputs: 2,
    canBeLeaf: false
  },
  union: {
    type: 'union',
    label: 'Union',
    icon: '⊎',
    themeVariable: '--sapChart_OrderedColor_3',
    maxInputs: Infinity,
    canBeLeaf: false
  },
  minus: {
    type: 'minus',
    label: 'Minus',
    icon: '⊖',
    themeVariable: '--sapChart_OrderedColor_4',
    maxInputs: 2,
    canBeLeaf: false
  },
  intersect: {
    type: 'intersect',
    label: 'Intersect',
    icon: '⊓',
    themeVariable: '--sapChart_OrderedColor_5',
    maxInputs: 2,
    canBeLeaf: false
  },
  projection: {
    type: 'projection',
    label: 'Projection',
    icon: '▦',
    themeVariable: '--sapChart_OrderedColor_6',
    maxInputs: 1,
    canBeLeaf: true
  },
  aggregation: {
    type: 'aggregation',
    label: 'Aggregation',
    icon: 'Σ',
    themeVariable: '--sapChart_OrderedColor_7',
    maxInputs: 1,
    canBeLeaf: true
  },
  rank: {
    type: 'rank',
    label: 'Rank',
    icon: '⧗',
    themeVariable: '--sapChart_OrderedColor_8',
    maxInputs: 1,
    canBeLeaf: false
  },
  tableFunction: {
    type: 'tableFunction',
    label: 'Table Function',
    icon: 'ƒ',
    themeVariable: '--sapChart_OrderedColor_9',
    maxInputs: 0,
    canBeLeaf: true
  },
  hierarchyFunction: {
    type: 'hierarchyFunction',
    label: 'Hierarchy Function',
    icon: '⊹',
    themeVariable: '--sapChart_OrderedColor_10',
    maxInputs: 1,
    canBeLeaf: false
  }
}

export const SEMANTICS_THEME_VARIABLE = '--sapAccentColor6'
```

- [ ] **Step 3: Verify types compile**

```bash
cd app/vue && npx vue-tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add app/vue/src/services/calcview/types.ts app/vue/src/services/calcview/nodeTypes.ts
git commit -m "feat(calcview): add TypeScript interfaces and node type registry"
```

---

## Task 3: XML Parser

**Files:**
- Create: `app/vue/src/services/calcview/xmlParser.ts`
- Create: `app/vue/src/services/calcview/__tests__/xmlParser.test.ts`
- Create: `app/vue/src/services/calcview/__tests__/fixtures/minimal.hdbcalculationview`
- Create: `app/vue/src/services/calcview/__tests__/fixtures/projection.hdbcalculationview`

- [ ] **Step 1: Create test fixtures**

Create `app/vue/src/services/calcview/__tests__/fixtures/minimal.hdbcalculationview`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Calculation:scenario xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore" id="MINIMAL_TEST" applyPrivilegeType="NONE" dataCategory="CUBE">
  <descriptions defaultDescription="Minimal Test View"/>
  <localVariables/>
  <variableMappings/>
  <dataSources/>
  <calculationViews/>
  <logicalModel>
    <attributes/>
    <calculatedAttributes/>
    <baseMeasures/>
    <calculatedMeasures/>
    <restrictedMeasures/>
  </logicalModel>
  <layout>
    <shapes>
      <shape expanded="true" modelObjectName="Output" modelObjectNameSpace="MeasureGroup">
        <upperLeftCorner x="40" y="85"/>
      </shape>
    </shapes>
  </layout>
</Calculation:scenario>
```

Create `app/vue/src/services/calcview/__tests__/fixtures/projection.hdbcalculationview`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Calculation:scenario xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore" id="PROJECTION_TEST" applyPrivilegeType="NONE" dataCategory="DIMENSION">
  <descriptions defaultDescription="Projection Test View"/>
  <localVariables/>
  <variableMappings/>
  <dataSources>
    <DataSource id="PRODUCTS">
      <resourceUri>PRODUCTS</resourceUri>
    </DataSource>
  </dataSources>
  <calculationViews>
    <calculationView xsi:type="Calculation:ProjectionView" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Projection_1">
      <descriptions defaultDescription="Product Projection"/>
      <viewAttributes>
        <viewAttribute id="PRODUCT_ID"/>
        <viewAttribute id="PRODUCT_NAME"/>
        <viewAttribute id="PRICE"/>
      </viewAttributes>
      <input node="PRODUCTS">
        <mapping xsi:type="Calculation:AttributeMapping" target="PRODUCT_ID" source="PRODUCT_ID"/>
        <mapping xsi:type="Calculation:AttributeMapping" target="PRODUCT_NAME" source="PRODUCT_NAME"/>
        <mapping xsi:type="Calculation:AttributeMapping" target="PRICE" source="PRICE"/>
      </input>
    </calculationView>
  </calculationViews>
  <logicalModel id="Projection_1">
    <attributes>
      <attribute id="PRODUCT_ID" order="1" attributeHierarchyActive="false" displayAttribute="false">
        <descriptions defaultDescription="Product ID"/>
        <keyMapping columnObjectName="Projection_1" columnName="PRODUCT_ID"/>
      </attribute>
      <attribute id="PRODUCT_NAME" order="2" attributeHierarchyActive="false" displayAttribute="false">
        <descriptions defaultDescription="Product Name"/>
        <keyMapping columnObjectName="Projection_1" columnName="PRODUCT_NAME"/>
      </attribute>
    </attributes>
    <calculatedAttributes/>
    <baseMeasures>
      <measure id="PRICE" order="3" aggregationType="sum">
        <descriptions defaultDescription="Price"/>
        <measureMapping columnObjectName="Projection_1" columnName="PRICE"/>
      </measure>
    </baseMeasures>
    <calculatedMeasures/>
    <restrictedMeasures/>
  </logicalModel>
  <layout>
    <shapes>
      <shape expanded="true" modelObjectName="Output" modelObjectNameSpace="MeasureGroup">
        <upperLeftCorner x="40" y="85"/>
      </shape>
      <shape expanded="true" modelObjectName="Projection_1" modelObjectNameSpace="CalculationView">
        <upperLeftCorner x="100" y="200"/>
      </shape>
    </shapes>
  </layout>
</Calculation:scenario>
```

- [ ] **Step 2: Write the parser tests**

Create `app/vue/src/services/calcview/__tests__/xmlParser.test.ts`:

```typescript
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
```

- [ ] **Step 3: Set up Vitest for the Vue app (if not present)**

Check if `vitest` is already configured. If not, add to `app/vue/package.json` devDependencies:

```bash
cd app/vue && npm install -D vitest
```

Add to `app/vue/package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Add Vitest config to `app/vue/vite.config.ts` (add `test` block):

```typescript
test: {
  globals: true,
  environment: 'node'
}
```

- [ ] **Step 4: Run tests — verify they fail**

```bash
cd app/vue && npx vitest run src/services/calcview/__tests__/xmlParser.test.ts
```

Expected: FAIL — `parseCalcView` not found.

- [ ] **Step 5: Implement the XML parser**

Create `app/vue/src/services/calcview/xmlParser.ts`:

```typescript
import { XMLParser } from 'fast-xml-parser'
import type {
  CalcViewModel, CalcViewNode, DataSource, Column,
  CalculatedColumn, LogicalModel, NodeShape, LayoutInfo,
  NodeType, NodeInput, Variable, VariableMapping
} from './types'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => {
    const arrayElements = [
      'DataSource', 'calculationView', 'viewAttribute', 'input',
      'mapping', 'attribute', 'measure', 'shape', 'localVariable',
      'variableMapping', 'calculatedAttribute', 'calculatedMeasure',
      'restrictedMeasure'
    ]
    return arrayElements.includes(name)
  }
})

export function parseCalcView(xml: string): CalcViewModel {
  const parsed = parser.parse(xml)
  const scenario = parsed['Calculation:scenario']

  return {
    id: scenario['@_id'],
    description: extractDescription(scenario.descriptions),
    dataCategory: scenario['@_dataCategory'] || 'DEFAULT',
    applyPrivilegeType: scenario['@_applyPrivilegeType'] || 'NONE',
    dataSources: parseDataSources(scenario.dataSources),
    calculationViews: parseCalculationViews(scenario.calculationViews),
    logicalModel: parseLogicalModel(scenario.logicalModel),
    localVariables: parseVariables(scenario.localVariables),
    variableMappings: parseVariableMappings(scenario.variableMappings),
    layout: parseLayout(scenario.layout),
    _unknownElements: []
  }
}

function extractDescription(descriptions: any): string {
  if (!descriptions) return ''
  return descriptions['@_defaultDescription'] || ''
}

function parseDataSources(ds: any): DataSource[] {
  if (!ds || !ds.DataSource) return []
  const sources = Array.isArray(ds.DataSource) ? ds.DataSource : [ds.DataSource]
  return sources.map((s: any) => ({
    id: s['@_id'],
    type: inferDataSourceType(s),
    schemaName: s['@_schemaName'],
    objectName: s.resourceUri || s['@_id'],
    columns: []
  }))
}

function inferDataSourceType(source: any): 'table' | 'view' | 'calculationView' {
  const type = source['@_type']
  if (type === 'calculationView') return 'calculationView'
  if (type === 'view') return 'view'
  return 'table'
}

function parseCalculationViews(cv: any): CalcViewNode[] {
  if (!cv || !cv.calculationView) return []
  const views = Array.isArray(cv.calculationView) ? cv.calculationView : [cv.calculationView]
  return views.map(parseCalcViewNode)
}

function parseCalcViewNode(node: any): CalcViewNode {
  return {
    id: node['@_id'],
    type: inferNodeType(node),
    inputs: parseInputs(node.input),
    outputColumns: parseViewAttributes(node.viewAttributes),
    calculatedColumns: [],
    filterExpression: node.filter?.expression || undefined
  }
}

function inferNodeType(node: any): NodeType {
  const xsiType = node['@_xsi:type'] || node['@_xmlns:xsi'] && ''
  if (xsiType?.includes('JoinView')) return 'join'
  if (xsiType?.includes('NonEquiJoinView')) return 'nonEquiJoin'
  if (xsiType?.includes('UnionView')) return 'union'
  if (xsiType?.includes('MinusView')) return 'minus'
  if (xsiType?.includes('IntersectView')) return 'intersect'
  if (xsiType?.includes('ProjectionView')) return 'projection'
  if (xsiType?.includes('AggregationView')) return 'aggregation'
  if (xsiType?.includes('RankView')) return 'rank'
  if (xsiType?.includes('TableFunctionView')) return 'tableFunction'
  if (xsiType?.includes('HierarchyFunctionView')) return 'hierarchyFunction'
  return 'projection'
}

function parseInputs(input: any): NodeInput[] {
  if (!input) return []
  const inputs = Array.isArray(input) ? input : [input]
  return inputs.map((i: any) => ({
    name: i['@_name'] || i['@_node'] || '',
    node: i['@_node'] || ''
  }))
}

function parseViewAttributes(va: any): Column[] {
  if (!va || !va.viewAttribute) return []
  const attrs = Array.isArray(va.viewAttribute) ? va.viewAttribute : [va.viewAttribute]
  return attrs.map((a: any) => ({
    id: a['@_id'],
    name: a['@_id'],
    dataType: a['@_datatype'] || '',
    semanticType: a['@_semanticType'] as any,
    aggregationType: a['@_aggregationType']
  }))
}

function parseLogicalModel(lm: any): LogicalModel {
  if (!lm) {
    return {
      attributes: [], calculatedAttributes: [], baseMeasures: [],
      calculatedMeasures: [], restrictedMeasures: [], hierarchies: []
    }
  }
  return {
    attributes: parseAttributes(lm.attributes),
    calculatedAttributes: [],
    baseMeasures: parseMeasures(lm.baseMeasures),
    calculatedMeasures: [],
    restrictedMeasures: [],
    hierarchies: []
  }
}

function parseAttributes(attrs: any): Column[] {
  if (!attrs || !attrs.attribute) return []
  const list = Array.isArray(attrs.attribute) ? attrs.attribute : [attrs.attribute]
  return list.map((a: any) => ({
    id: a['@_id'],
    name: a['@_id'],
    dataType: a['@_datatype'] || '',
    label: a.descriptions?.['@_defaultDescription'] || '',
    semanticType: 'attribute' as const,
    hidden: a['@_hidden'] === 'true'
  }))
}

function parseMeasures(measures: any): Column[] {
  if (!measures || !measures.measure) return []
  const list = Array.isArray(measures.measure) ? measures.measure : [measures.measure]
  return list.map((m: any) => ({
    id: m['@_id'],
    name: m['@_id'],
    dataType: m['@_datatype'] || '',
    label: m.descriptions?.['@_defaultDescription'] || '',
    semanticType: 'measure' as const,
    aggregationType: m['@_aggregationType'] || 'sum',
    hidden: m['@_hidden'] === 'true'
  }))
}

function parseVariables(vars: any): Variable[] {
  if (!vars || !vars.localVariable) return []
  const list = Array.isArray(vars.localVariable) ? vars.localVariable : [vars.localVariable]
  return list.map((v: any) => ({
    id: v['@_id'],
    name: v['@_id'],
    dataType: v['@_datatype'] || 'NVARCHAR',
    defaultValue: v['@_defaultValue'],
    mandatory: v['@_mandatory'] === 'true'
  }))
}

function parseVariableMappings(vm: any): VariableMapping[] {
  if (!vm || !vm.variableMapping) return []
  const list = Array.isArray(vm.variableMapping) ? vm.variableMapping : [vm.variableMapping]
  return list.map((m: any) => ({
    sourceVariable: m['@_dataSource'] || '',
    targetVariable: m['@_target'] || '',
    nodeId: m['@_node'] || ''
  }))
}

function parseLayout(layout: any): LayoutInfo {
  if (!layout || !layout.shapes || !layout.shapes.shape) {
    return { shapes: [] }
  }
  const shapes = Array.isArray(layout.shapes.shape) ? layout.shapes.shape : [layout.shapes.shape]
  return {
    shapes: shapes.map((s: any): NodeShape => ({
      modelObjectName: s['@_modelObjectName'],
      modelObjectNameSpace: s['@_modelObjectNameSpace'] || '',
      expanded: s['@_expanded'] !== 'false',
      upperLeftCorner: {
        x: parseInt(s.upperLeftCorner?.['@_x'] || '0', 10),
        y: parseInt(s.upperLeftCorner?.['@_y'] || '0', 10)
      }
    }))
  }
}
```

- [ ] **Step 6: Run tests — verify they pass**

```bash
cd app/vue && npx vitest run src/services/calcview/__tests__/xmlParser.test.ts
```

Expected: All tests PASS.

- [ ] **Step 7: Commit**

```bash
git add app/vue/src/services/calcview/xmlParser.ts app/vue/src/services/calcview/__tests__/
git commit -m "feat(calcview): implement XML parser with round-trip test fixtures"
```

---

## Task 4: XML Serializer

**Files:**
- Create: `app/vue/src/services/calcview/xmlSerializer.ts`
- Create: `app/vue/src/services/calcview/__tests__/xmlSerializer.test.ts`

- [ ] **Step 1: Write the serializer tests**

Create `app/vue/src/services/calcview/__tests__/xmlSerializer.test.ts`:

```typescript
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
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd app/vue && npx vitest run src/services/calcview/__tests__/xmlSerializer.test.ts
```

Expected: FAIL — `serializeCalcView` not found.

- [ ] **Step 3: Implement the XML serializer**

Create `app/vue/src/services/calcview/xmlSerializer.ts`:

```typescript
import { XMLBuilder } from 'fast-xml-parser'
import type { CalcViewModel, CalcViewNode, DataSource, LogicalModel } from './types'

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  indentBy: '  ',
  suppressEmptyNode: false
})

export function serializeCalcView(model: CalcViewModel): string {
  const scenario: any = {
    '@_xmlns:Calculation': 'http://www.sap.com/ndb/BiModelCalculation.ecore',
    '@_id': model.id,
    '@_applyPrivilegeType': model.applyPrivilegeType,
    '@_dataCategory': model.dataCategory,
    descriptions: { '@_defaultDescription': model.description },
    localVariables: serializeVariables(model),
    variableMappings: serializeVariableMappings(model),
    dataSources: serializeDataSources(model.dataSources),
    calculationViews: serializeCalculationViews(model.calculationViews),
    logicalModel: serializeLogicalModel(model.logicalModel),
    layout: serializeLayout(model)
  }

  const xmlObj = { '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' }, 'Calculation:scenario': scenario }
  return builder.build(xmlObj)
}

function serializeVariables(model: CalcViewModel): any {
  if (model.localVariables.length === 0) return ''
  return {
    localVariable: model.localVariables.map(v => ({
      '@_id': v.id,
      '@_datatype': v.dataType,
      '@_mandatory': v.mandatory ? 'true' : undefined,
      '@_defaultValue': v.defaultValue
    }))
  }
}

function serializeVariableMappings(model: CalcViewModel): any {
  if (model.variableMappings.length === 0) return ''
  return {
    variableMapping: model.variableMappings.map(m => ({
      '@_dataSource': m.sourceVariable,
      '@_target': m.targetVariable,
      '@_node': m.nodeId
    }))
  }
}

function serializeDataSources(sources: DataSource[]): any {
  if (sources.length === 0) return ''
  return {
    DataSource: sources.map(s => ({
      '@_id': s.id,
      '@_type': s.type === 'table' ? undefined : s.type,
      resourceUri: s.objectName
    }))
  }
}

function serializeCalculationViews(nodes: CalcViewNode[]): any {
  if (nodes.length === 0) return ''
  return {
    calculationView: nodes.map(serializeNode)
  }
}

function serializeNode(node: CalcViewNode): any {
  const xsiType = getXsiType(node.type)
  return {
    '@_xsi:type': xsiType,
    '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    '@_id': node.id,
    viewAttributes: {
      viewAttribute: node.outputColumns.map(c => ({ '@_id': c.id }))
    },
    input: node.inputs.map(i => ({
      '@_node': i.node,
      mapping: node.outputColumns.map(c => ({
        '@_xsi:type': 'Calculation:AttributeMapping',
        '@_target': c.id,
        '@_source': c.id
      }))
    }))
  }
}

function getXsiType(type: string): string {
  const typeMap: Record<string, string> = {
    projection: 'Calculation:ProjectionView',
    aggregation: 'Calculation:AggregationView',
    join: 'Calculation:JoinView',
    nonEquiJoin: 'Calculation:NonEquiJoinView',
    union: 'Calculation:UnionView',
    minus: 'Calculation:MinusView',
    intersect: 'Calculation:IntersectView',
    rank: 'Calculation:RankView',
    tableFunction: 'Calculation:TableFunctionView',
    hierarchyFunction: 'Calculation:HierarchyFunctionView'
  }
  return typeMap[type] || 'Calculation:ProjectionView'
}

function serializeLogicalModel(lm: LogicalModel): any {
  return {
    attributes: lm.attributes.length > 0 ? {
      attribute: lm.attributes.map(a => ({
        '@_id': a.id,
        '@_order': undefined,
        '@_attributeHierarchyActive': 'false',
        '@_displayAttribute': 'false',
        descriptions: a.label ? { '@_defaultDescription': a.label } : undefined,
        keyMapping: { '@_columnObjectName': '', '@_columnName': a.id }
      }))
    } : '',
    calculatedAttributes: '',
    baseMeasures: lm.baseMeasures.length > 0 ? {
      measure: lm.baseMeasures.map(m => ({
        '@_id': m.id,
        '@_aggregationType': m.aggregationType || 'sum',
        descriptions: m.label ? { '@_defaultDescription': m.label } : undefined,
        measureMapping: { '@_columnObjectName': '', '@_columnName': m.id }
      }))
    } : '',
    calculatedMeasures: '',
    restrictedMeasures: ''
  }
}

function serializeLayout(model: CalcViewModel): any {
  return {
    shapes: {
      shape: model.layout.shapes.map(s => ({
        '@_expanded': s.expanded ? 'true' : 'false',
        '@_modelObjectName': s.modelObjectName,
        '@_modelObjectNameSpace': s.modelObjectNameSpace,
        upperLeftCorner: {
          '@_x': String(s.upperLeftCorner.x),
          '@_y': String(s.upperLeftCorner.y)
        }
      }))
    }
  }
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd app/vue && npx vitest run src/services/calcview/__tests__/xmlSerializer.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/vue/src/services/calcview/xmlSerializer.ts app/vue/src/services/calcview/__tests__/xmlSerializer.test.ts
git commit -m "feat(calcview): implement XML serializer with round-trip tests"
```

---

## Task 5: Backend Route — File Operations

**Files:**
- Create: `routes/calcView.js`
- Create: `tests/routes/calcView.http.Test.js`

- [ ] **Step 1: Write the route tests**

Create `tests/routes/calcView.http.Test.js`:

```javascript
import { expect } from 'chai'
import request from 'supertest'
import { createMinimalApp } from '../appFactory.js'
import { route } from '../../routes/calcView.js'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

describe('CalcView Route - HTTP Integration Tests', function () {
  let app
  let tempDir

  before(async function () {
    app = createMinimalApp(route)
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'calcview-test-'))
    // Create a test fixture
    await fs.writeFile(
      path.join(tempDir, 'TEST.hdbcalculationview'),
      '<?xml version="1.0" encoding="UTF-8"?><Calculation:scenario xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore" id="TEST" applyPrivilegeType="NONE" dataCategory="CUBE"><descriptions defaultDescription="Test"/><localVariables/><variableMappings/><dataSources/><calculationViews/><logicalModel><attributes/><calculatedAttributes/><baseMeasures/><calculatedMeasures/><restrictedMeasures/></logicalModel><layout><shapes><shape expanded="true" modelObjectName="Output" modelObjectNameSpace="MeasureGroup"><upperLeftCorner x="40" y="85"/></shape></shapes></layout></Calculation:scenario>'
    )
  })

  after(async function () {
    await fs.rm(tempDir, { recursive: true })
  })

  describe('GET /hana/calcview/project/list', function () {
    it('should list .hdbcalculationview files', async function () {
      const response = await request(app)
        .get('/hana/calcview/project/list')
        .query({ path: tempDir })
        .expect(200)

      expect(response.body).to.be.an('array')
      expect(response.body).to.have.lengthOf(1)
      expect(response.body[0].name).to.equal('TEST')
      expect(response.body[0].fileName).to.equal('TEST.hdbcalculationview')
    })

    it('should return 400 if path is missing', async function () {
      await request(app)
        .get('/hana/calcview/project/list')
        .expect(400)
    })
  })

  describe('GET /hana/calcview/project/read', function () {
    it('should read a calculation view file', async function () {
      const filePath = path.join(tempDir, 'TEST.hdbcalculationview')
      const response = await request(app)
        .get('/hana/calcview/project/read')
        .query({ file: filePath })
        .expect(200)

      expect(response.body.xml).to.contain('Calculation:scenario')
      expect(response.body.xml).to.contain('id="TEST"')
    })

    it('should reject path traversal attempts', async function () {
      await request(app)
        .get('/hana/calcview/project/read')
        .query({ file: '/etc/passwd' })
        .expect(403)
    })

    it('should reject paths outside the project root', async function () {
      const filePath = path.resolve(tempDir, '..', 'outside.hdbcalculationview')
      await request(app)
        .get('/hana/calcview/project/read')
        .query({ file: filePath, base: tempDir })
        .expect(403)
    })
  })

  describe('POST /hana/calcview/project/write', function () {
    it('should write XML to a file', async function () {
      const filePath = path.join(tempDir, 'NEW.hdbcalculationview')
      const xml = '<?xml version="1.0" encoding="UTF-8"?><Calculation:scenario xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore" id="NEW" applyPrivilegeType="NONE" dataCategory="CUBE"></Calculation:scenario>'

      await request(app)
        .post('/hana/calcview/project/write')
        .send({ file: filePath, xml })
        .expect(200)

      const content = await fs.readFile(filePath, 'utf-8')
      expect(content).to.equal(xml)
    })
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm run test:grep -- "CalcView Route"
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the route**

Create `routes/calcView.js`:

```javascript
import path from 'path'
import fs from 'fs/promises'
import { glob } from 'glob'

export function route(app) {
  app.get('/hana/calcview/project/list', async (req, res, next) => {
    try {
      const dirPath = req.query.path
      if (!dirPath) {
        return res.status(400).json({ error: 'path parameter is required' })
      }

      const pattern = path.posix.join(dirPath.replace(/\\/g, '/'), '**', '*.hdbcalculationview')
      const files = await glob(pattern)

      const results = await Promise.all(files.map(async (filePath) => {
        const stat = await fs.stat(filePath)
        const fileName = path.basename(filePath)
        const name = fileName.replace('.hdbcalculationview', '')
        return {
          name,
          fileName,
          filePath,
          lastModified: stat.mtime.toISOString(),
          size: stat.size
        }
      }))

      res.status(200).json(results)
    } catch (error) {
      next(error)
    }
  })

  app.get('/hana/calcview/project/read', async (req, res, next) => {
    try {
      const filePath = req.query.file
      const basePath = req.query.base
      if (!filePath) {
        return res.status(400).json({ error: 'file parameter is required' })
      }

      const resolved = path.resolve(filePath)
      if (!resolved.endsWith('.hdbcalculationview')) {
        return res.status(403).json({ error: 'Only .hdbcalculationview files can be read' })
      }

      // Path traversal protection: resolved path must be within base directory
      if (basePath) {
        const normalizedBase = path.resolve(basePath)
        if (!resolved.startsWith(normalizedBase + path.sep) && resolved !== normalizedBase) {
          return res.status(403).json({ error: 'Access denied: path outside project root' })
        }
      }

      try {
        await fs.access(resolved)
      } catch {
        return res.status(404).json({ error: 'File not found' })
      }

      const xml = await fs.readFile(resolved, 'utf-8')
      res.status(200).json({ xml, filePath: resolved })
    } catch (error) {
      next(error)
    }
  })

  app.post('/hana/calcview/project/write', async (req, res, next) => {
    try {
      const { file, xml, base } = req.body
      if (!file || !xml) {
        return res.status(400).json({ error: 'file and xml are required' })
      }

      const resolved = path.resolve(file)
      if (!resolved.endsWith('.hdbcalculationview')) {
        return res.status(403).json({ error: 'Only .hdbcalculationview files can be written' })
      }

      // Path traversal protection: resolved path must be within base directory
      if (base) {
        const normalizedBase = path.resolve(base)
        if (!resolved.startsWith(normalizedBase + path.sep) && resolved !== normalizedBase) {
          return res.status(403).json({ error: 'Access denied: path outside project root' })
        }
      }

      await fs.writeFile(resolved, xml, 'utf-8')
      res.status(200).json({ success: true, filePath: resolved })
    } catch (error) {
      next(error)
    }
  })
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm run test:grep -- "CalcView Route"
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add routes/calcView.js tests/routes/calcView.http.Test.js
git commit -m "feat(calcview): add backend routes for project file operations"
```

---

## Task 6: Navigation & Router Integration

**Files:**
- Modify: `app/vue/src/router.ts`
- Modify: `app/vue/src/model/navigation.ts`
- Create: `app/vue/src/views/CalcViewBrowser.vue` (placeholder)
- Create: `app/vue/src/views/CalcViewEditor.vue` (placeholder)

- [ ] **Step 1: Add routes**

Add to `app/vue/src/router.ts` in the routes array:

```typescript
{
  path: '/calc-view-browser',
  name: 'calcViewBrowser',
  component: () => import('./views/CalcViewBrowser.vue')
},
{
  path: '/calc-view-editor',
  name: 'calcViewEditor',
  component: () => import('./views/CalcViewEditor.vue')
},
```

- [ ] **Step 2: Add navigation group**

Add to `app/vue/src/model/navigation.ts` in the `navigation` array:

```typescript
{
  key: 'modeling',
  title: 'Modeling',
  icon: 'business-objects-experience',
  expanded: false,
  items: [
    { key: 'calcViewBrowser', title: 'Calculation Views', route: 'calcViewBrowser' }
  ]
}
```

- [ ] **Step 3: Create placeholder views**

Create `app/vue/src/views/CalcViewBrowser.vue`:

```vue
<script setup lang="ts">
import '@ui5/webcomponents/dist/Title.js'
</script>

<template>
  <div class="calc-view-browser">
    <ui5-title level="H2">Calculation Views</ui5-title>
    <p>Modeling Home — browse and open calculation views.</p>
  </div>
</template>

<style scoped>
.calc-view-browser {
  padding: 1rem;
}
</style>
```

Create `app/vue/src/views/CalcViewEditor.vue`:

```vue
<script setup lang="ts">
import '@ui5/webcomponents/dist/Title.js'
</script>

<template>
  <div class="calc-view-editor">
    <ui5-title level="H2">Calculation View Editor</ui5-title>
    <p>Editor shell — to be implemented.</p>
  </div>
</template>

<style scoped>
.calc-view-editor {
  padding: 1rem;
  height: 100%;
}
</style>
```

- [ ] **Step 4: Verify build**

```bash
cd app/vue && npx vue-tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add app/vue/src/router.ts app/vue/src/model/navigation.ts app/vue/src/views/CalcViewBrowser.vue app/vue/src/views/CalcViewEditor.vue
git commit -m "feat(calcview): add Modeling navigation group and route placeholders"
```

---

## Task 7: Vue Flow Canvas with Semantics + Projection Nodes

**Files:**
- Create: `app/vue/src/components/calcview/canvas/CalcViewCanvas.vue`
- Create: `app/vue/src/components/calcview/canvas/nodes/SemanticsNode.vue`
- Create: `app/vue/src/components/calcview/canvas/nodes/ProjectionNode.vue`
- Create: `app/vue/src/components/calcview/canvas/edges/DataFlowEdge.vue`
- Create: `app/vue/src/composables/calcview/useCalcViewModel.ts`
- Update: `app/vue/src/views/CalcViewEditor.vue`

- [ ] **Step 1: Create the model composable**

Create `app/vue/src/composables/calcview/useCalcViewModel.ts`:

```typescript
import { ref, computed } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import type { CalcViewModel, CalcViewNode } from '../../services/calcview/types'
import { NODE_TYPE_DEFINITIONS, SEMANTICS_THEME_VARIABLE } from '../../services/calcview/nodeTypes'

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
```

- [ ] **Step 2: Create the Semantics node component**

Create `app/vue/src/components/calcview/canvas/nodes/SemanticsNode.vue`:

```vue
<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{
  data: {
    label: string
    dataCategory: string
    attributeCount: number
    measureCount: number
  }
}>()
</script>

<template>
  <div class="semantics-node">
    <Handle type="target" :position="Position.Bottom" />
    <div class="node-icon">◈</div>
    <div class="node-content">
      <div class="node-label">{{ data.label }}</div>
      <div class="node-subtitle">
        {{ data.dataCategory }} · {{ data.attributeCount }} attrs · {{ data.measureCount }} measures
      </div>
    </div>
  </div>
</template>

<style scoped>
.semantics-node {
  background: var(--sapTile_Background, #fff);
  border: 2px dashed var(--sapAccentColor6, #0854a0);
  border-radius: 10px;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 180px;
}

.node-icon {
  color: var(--sapAccentColor6, #0854a0);
  font-size: 18px;
}

.node-content {
  display: flex;
  flex-direction: column;
}

.node-label {
  color: var(--sapAccentColor6, #0854a0);
  font-weight: bold;
  font-size: 13px;
}

.node-subtitle {
  color: var(--sapContent_LabelColor, #666);
  font-size: 10px;
  margin-top: 2px;
}
</style>
```

- [ ] **Step 3: Create the Projection node component**

Create `app/vue/src/components/calcview/canvas/nodes/ProjectionNode.vue`:

```vue
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
  <div class="projection-node" :style="{ borderColor: `var(${data.typeDef.themeVariable})` }">
    <Handle type="target" :position="Position.Bottom" />
    <Handle type="source" :position="Position.Top" />
    <div class="node-icon" :style="{ color: `var(${data.typeDef.themeVariable})` }">
      {{ data.typeDef.icon }}
    </div>
    <div class="node-content">
      <div class="node-label">{{ data.label }}</div>
      <div class="node-subtitle">{{ data.inputCount }} input · {{ data.columnCount }} columns</div>
    </div>
  </div>
</template>

<style scoped>
.projection-node {
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

- [ ] **Step 4: Create the DataFlow edge component**

Create `app/vue/src/components/calcview/canvas/edges/DataFlowEdge.vue`:

```vue
<script setup lang="ts">
import { BezierEdge } from '@vue-flow/core'
</script>

<template>
  <BezierEdge v-bind="$attrs" :style="{ stroke: 'var(--sapContent_NonInteractiveIconColor, #6a6d70)', strokeWidth: 2 }" />
</template>
```

- [ ] **Step 5: Create the CalcViewCanvas wrapper**

Create `app/vue/src/components/calcview/canvas/CalcViewCanvas.vue`:

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
import DataFlowEdge from './edges/DataFlowEdge.vue'

import type { Node, Edge } from '@vue-flow/core'

const props = defineProps<{
  nodes: Node[]
  edges: Edge[]
}>()

const emit = defineEmits<{
  'node-click': [node: Node]
}>()
</script>

<template>
  <div class="canvas-container">
    <VueFlow
      :nodes="props.nodes"
      :edges="props.edges"
      :default-viewport="{ zoom: 1, x: 0, y: 0 }"
      fit-view-on-init
      @node-click="(_event, node) => emit('node-click', node)"
    >
      <template #node-semantics="nodeProps">
        <SemanticsNode v-bind="nodeProps" />
      </template>
      <template #node-projection="nodeProps">
        <ProjectionNode v-bind="nodeProps" />
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

- [ ] **Step 6: Wire the editor view**

Update `app/vue/src/views/CalcViewEditor.vue`:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useCalcViewModel } from '../composables/calcview/useCalcViewModel'
import { parseCalcView } from '../services/calcview/xmlParser'
import CalcViewCanvas from '../components/calcview/canvas/CalcViewCanvas.vue'
import '@ui5/webcomponents/dist/Title.js'

const { model, vueFlowNodes, vueFlowEdges, loadModel } = useCalcViewModel()

onMounted(() => {
  // Load a demo model for development
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
</script>

<template>
  <div class="calc-view-editor">
    <CalcViewCanvas
      v-if="vueFlowNodes.length > 0"
      :nodes="vueFlowNodes"
      :edges="vueFlowEdges"
    />
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

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
```

- [ ] **Step 7: Verify build and test in browser**

```bash
cd app/vue && npx vue-tsc --noEmit
```

Then start the dev server:
```bash
cd app/vue && npm run dev
```

Navigate to `http://localhost:5173/#/calc-view-editor` and verify:
- Two nodes render (Semantics at top, Projection below)
- An edge connects them
- Minimap is visible
- Zoom/pan works

- [ ] **Step 8: Commit**

```bash
git add app/vue/src/components/calcview/ app/vue/src/composables/calcview/ app/vue/src/views/CalcViewEditor.vue
git commit -m "feat(calcview): basic Vue Flow canvas with Semantics and Projection nodes"
```

---

## Task 8: Node Palette

**Files:**
- Create: `app/vue/src/components/calcview/canvas/NodePalette.vue`
- Update: `app/vue/src/views/CalcViewEditor.vue` (add palette to layout)

- [ ] **Step 1: Create the NodePalette component**

Create `app/vue/src/components/calcview/canvas/NodePalette.vue`:

```vue
<script setup lang="ts">
import { NODE_TYPE_DEFINITIONS } from '../../../services/calcview/nodeTypes'
import type { NodeType } from '../../../services/calcview/types'

const emit = defineEmits<{
  'add-node': [type: NodeType]
}>()

const nodeTypes = Object.values(NODE_TYPE_DEFINITIONS)

function onDragStart(event: DragEvent, type: NodeType) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/calcview-node-type', type)
    event.dataTransfer.effectAllowed = 'move'
  }
}
</script>

<template>
  <div class="node-palette">
    <div class="palette-header">Nodes</div>
    <div class="palette-items">
      <div
        v-for="nodeDef in nodeTypes"
        :key="nodeDef.type"
        class="palette-item"
        draggable="true"
        @dragstart="onDragStart($event, nodeDef.type)"
        @click="emit('add-node', nodeDef.type)"
      >
        <span class="palette-icon" :style="{ color: `var(${nodeDef.themeVariable})` }">
          {{ nodeDef.icon }}
        </span>
        <span class="palette-label">{{ nodeDef.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.node-palette {
  width: 180px;
  background: var(--sapGroup_ContentBackground, #fff);
  border-right: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  padding: 12px 8px;
  overflow-y: auto;
  flex-shrink: 0;
}

.palette-header {
  color: var(--sapContent_LabelColor, #666);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  padding: 0 8px;
}

.palette-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  cursor: grab;
  border: 1px solid transparent;
  font-size: 12px;
  transition: background 0.15s;
}

.palette-item:hover {
  background: var(--sapList_Hover_Background, #e5e5e5);
  border-color: var(--sapList_BorderColor, #e5e5e5);
}

.palette-item:active {
  cursor: grabbing;
}

.palette-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.palette-label {
  color: var(--sapTextColor, #333);
}
</style>
```

- [ ] **Step 2: Update the editor layout to include palette**

Update `app/vue/src/views/CalcViewEditor.vue` template to add the palette:

Replace the template section with:

```vue
<template>
  <div class="calc-view-editor">
    <div class="editor-content" v-if="vueFlowNodes.length > 0">
      <NodePalette @add-node="handleAddNode" />
      <CalcViewCanvas
        :nodes="vueFlowNodes"
        :edges="vueFlowEdges"
      />
    </div>
    <div v-else class="empty-state">
      <ui5-title level="H3">No Calculation View loaded</ui5-title>
    </div>
  </div>
</template>
```

Add to the script:

```typescript
import NodePalette from '../components/calcview/canvas/NodePalette.vue'
import type { NodeType } from '../services/calcview/types'

function handleAddNode(type: NodeType) {
  // Phase 2: will add node to model
  console.log('Add node:', type)
}
```

Add to the style:

```css
.editor-content {
  display: flex;
  height: 100%;
}
```

- [ ] **Step 3: Verify in browser**

Start dev server and navigate to the editor. Verify:
- Node palette shows on the left with all 10 node types
- Each has the correct icon and label
- Palette items are draggable
- Clicking a palette item logs to console

- [ ] **Step 4: Commit**

```bash
git add app/vue/src/components/calcview/canvas/NodePalette.vue app/vue/src/views/CalcViewEditor.vue
git commit -m "feat(calcview): add node palette with drag support"
```

---

## Task 9: Properties Panel Shell

**Files:**
- Create: `app/vue/src/components/calcview/properties/PropertiesPanel.vue`
- Create: `app/vue/src/components/calcview/properties/ViewPropertiesTab.vue`
- Update: `app/vue/src/views/CalcViewEditor.vue` (add properties panel)

- [ ] **Step 1: Create the ViewPropertiesTab**

Create `app/vue/src/components/calcview/properties/ViewPropertiesTab.vue`:

```vue
<script setup lang="ts">
import '@ui5/webcomponents/dist/Label.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'

import type { CalcViewModel } from '../../../services/calcview/types'

const props = defineProps<{
  model: CalcViewModel
}>()
</script>

<template>
  <div class="view-properties">
    <div class="property-row">
      <ui5-label>Name</ui5-label>
      <ui5-input :value="model.id" readonly />
    </div>
    <div class="property-row">
      <ui5-label>Description</ui5-label>
      <ui5-input :value="model.description" />
    </div>
    <div class="property-row">
      <ui5-label>Data Category</ui5-label>
      <ui5-select>
        <ui5-option :selected="model.dataCategory === 'CUBE'">CUBE</ui5-option>
        <ui5-option :selected="model.dataCategory === 'DIMENSION'">DIMENSION</ui5-option>
        <ui5-option :selected="model.dataCategory === 'DEFAULT'">DEFAULT</ui5-option>
      </ui5-select>
    </div>
    <div class="property-row">
      <ui5-label>Privilege Type</ui5-label>
      <ui5-input :value="model.applyPrivilegeType" />
    </div>
  </div>
</template>

<style scoped>
.view-properties {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.property-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
```

- [ ] **Step 2: Create the PropertiesPanel shell**

Create `app/vue/src/components/calcview/properties/PropertiesPanel.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/TabContainer.js'
import '@ui5/webcomponents/dist/Tab.js'

import ViewPropertiesTab from './ViewPropertiesTab.vue'
import type { CalcViewModel, CalcViewNode } from '../../../services/calcview/types'
import { NODE_TYPE_DEFINITIONS } from '../../../services/calcview/nodeTypes'

const props = defineProps<{
  model: CalcViewModel
  selectedNodeId: string | null
}>()

const selectedNode = computed<CalcViewNode | null>(() => {
  if (!props.selectedNodeId || props.selectedNodeId === '__semantics__') return null
  return props.model.calculationViews.find(n => n.id === props.selectedNodeId) || null
})

const panelTitle = computed(() => {
  if (!props.selectedNodeId || props.selectedNodeId === '__semantics__') return 'View Properties'
  if (selectedNode.value) {
    const typeDef = NODE_TYPE_DEFINITIONS[selectedNode.value.type]
    return `${selectedNode.value.id} (${typeDef.label})`
  }
  return 'Properties'
})
</script>

<template>
  <div class="properties-panel">
    <div class="panel-header">
      <ui5-title level="H5">{{ panelTitle }}</ui5-title>
    </div>
    <div class="panel-content">
      <ViewPropertiesTab
        v-if="!selectedNodeId || selectedNodeId === '__semantics__'"
        :model="model"
      />
      <div v-else class="node-properties-placeholder">
        <p>Node properties for <strong>{{ selectedNode?.id }}</strong></p>
        <p>Type: {{ selectedNode?.type }}</p>
        <p>Columns: {{ selectedNode?.outputColumns.length }}</p>
        <p class="note">Full property editing in Phase 2.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.properties-panel {
  width: 300px;
  background: var(--sapGroup_ContentBackground, #fff);
  border-left: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
}

.node-properties-placeholder {
  padding: 12px;
  color: var(--sapTextColor, #333);
  font-size: 12px;
}

.note {
  color: var(--sapContent_LabelColor, #666);
  font-style: italic;
  margin-top: 8px;
}
</style>
```

- [ ] **Step 3: Wire into the editor layout**

Update `app/vue/src/views/CalcViewEditor.vue` to add the properties panel and node selection:

Add to script:
```typescript
import { ref } from 'vue'
import PropertiesPanel from '../components/calcview/properties/PropertiesPanel.vue'
import type { Node } from '@vue-flow/core'

const selectedNodeId = ref<string | null>(null)

function handleNodeClick(node: Node) {
  selectedNodeId.value = node.id
}
```

Update template:
```vue
<template>
  <div class="calc-view-editor">
    <div class="editor-content" v-if="model && vueFlowNodes.length > 0">
      <NodePalette @add-node="handleAddNode" />
      <CalcViewCanvas
        :nodes="vueFlowNodes"
        :edges="vueFlowEdges"
        @node-click="handleNodeClick"
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
```

- [ ] **Step 4: Verify in browser**

Start dev server. Verify:
- Three-panel layout: palette | canvas | properties
- Properties panel shows "View Properties" by default
- Clicking a node updates properties panel title and content
- View properties shows name, description, data category

- [ ] **Step 5: Commit**

```bash
git add app/vue/src/components/calcview/properties/ app/vue/src/views/CalcViewEditor.vue
git commit -m "feat(calcview): add properties panel with view properties tab"
```

---

## Summary

Phase 1 delivers:

| Deliverable | Status |
|-------------|--------|
| TypeScript interfaces (all model types) | Task 2 |
| Node type registry (10 types + metadata) | Task 2 |
| XML Parser (fast-xml-parser → CalcViewModel) | Task 3 |
| XML Serializer (CalcViewModel → XML) | Task 4 |
| Backend routes (/hana/calcview/project/*) | Task 5 |
| Navigation + routing (Modeling group) | Task 6 |
| Vue Flow canvas (Semantics + Projection) | Task 7 |
| Node palette (draggable, all 10 types) | Task 8 |
| Properties panel shell (view properties) | Task 9 |

**After Phase 1**, the editor can:
- Parse any `.hdbcalculationview` XML file into a reactive model
- Render Semantics and Projection nodes on a Vue Flow canvas
- Show all 10 node types in a draggable palette
- Display view-level properties in the right panel
- Read/write files via the backend API

**Next:** Phase 2 adds all remaining node types, edge connections, column mapping, join conditions, and undo/redo.
