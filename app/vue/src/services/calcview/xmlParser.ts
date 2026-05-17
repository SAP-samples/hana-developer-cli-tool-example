import { XMLParser } from 'fast-xml-parser'
import type {
  CalcViewModel, CalcViewNode, DataSource, Column,
  LogicalModel, NodeShape, LayoutInfo,
  NodeType, NodeInput, Variable, VariableMapping,
  JoinConfig, JoinCondition, CalculatedColumn,
  Hierarchy, HierarchyLevel, RestrictedMeasure, RestrictionFilter
} from './types'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => {
    const arrayElements = [
      'DataSource', 'calculationView', 'viewAttribute', 'input',
      'mapping', 'attribute', 'measure', 'shape', 'localVariable',
      'variableMapping', 'calculatedAttribute', 'calculatedMeasure',
      'restrictedMeasure', 'joinAttribute', 'calculatedViewAttribute',
      'level', 'hierarchy', 'valueFilter'
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
    _unknownElements: [],
    outputNodeId: scenario.logicalModel?.['@_id'] || undefined,
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
  const nodeType = inferNodeType(node)
  const result: CalcViewNode = {
    id: node['@_id'],
    type: nodeType,
    inputs: parseInputs(node.input),
    outputColumns: parseViewAttributes(node.viewAttributes),
    calculatedColumns: parseCalculatedViewAttributes(node.calculatedViewAttributes),
    filterExpression: node.filter?.formula || undefined
  }
  if (nodeType === 'join' || nodeType === 'nonEquiJoin') {
    result.joinConfig = parseJoinConfig(node)
  }
  return result
}

function inferNodeType(node: any): NodeType {
  const xsiType = node['@_xsi:type'] || ''
  if (xsiType.includes('NonEquiJoinView')) return 'nonEquiJoin'
  if (xsiType.includes('JoinView')) return 'join'
  if (xsiType.includes('UnionView')) return 'union'
  if (xsiType.includes('MinusView')) return 'minus'
  if (xsiType.includes('IntersectView')) return 'intersect'
  if (xsiType.includes('ProjectionView')) return 'projection'
  if (xsiType.includes('AggregationView')) return 'aggregation'
  if (xsiType.includes('RankView')) return 'rank'
  if (xsiType.includes('TableFunctionView')) return 'tableFunction'
  if (xsiType.includes('HierarchyFunctionView')) return 'hierarchyFunction'
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

function parseCalculatedViewAttributes(cva: any): CalculatedColumn[] {
  if (!cva || !cva.calculatedViewAttribute) return []
  const list = Array.isArray(cva.calculatedViewAttribute) ? cva.calculatedViewAttribute : [cva.calculatedViewAttribute]
  return list.map((a: any) => ({
    id: a['@_id'],
    name: a['@_id'],
    dataType: a['@_datatype'] || 'NVARCHAR',
    expression: a.formula || '',
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
    calculatedAttributes: parseCalculatedLogicalAttributes(lm.calculatedAttributes),
    baseMeasures: parseMeasures(lm.baseMeasures),
    calculatedMeasures: parseCalculatedMeasures(lm.calculatedMeasures),
    restrictedMeasures: parseRestrictedMeasures(lm.restrictedMeasures),
    hierarchies: parseHierarchies(lm.hierarchies)
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

function parseCalculatedLogicalAttributes(ca: any): CalculatedColumn[] {
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

function parseJoinConfig(cv: any): JoinConfig {
  const joinType = cv['@_joinType'] || 'inner'
  const rawCardinality = cv['@_cardinality'] || 'C1_1'
  const cardinality = parseCardinality(rawCardinality)
  const joinAttributes = ensureArray(cv['joinAttribute'])
  const conditions: JoinCondition[] = joinAttributes.map((ja: any) => ({
    leftColumn: typeof ja === 'string' ? ja : (ja['@_name'] || ''),
    rightColumn: typeof ja === 'string' ? ja : (ja['@_name'] || ''),
    operator: '=' as const
  }))
  return { joinType, cardinality, conditions }
}

function parseCardinality(raw: string): '1..1' | '1..N' | 'N..1' | 'N..M' {
  const map: Record<string, '1..1' | '1..N' | 'N..1' | 'N..M'> = {
    'C1_1': '1..1', 'C1_N': '1..N', 'CN_1': 'N..1', 'CN_M': 'N..M'
  }
  return map[raw] || '1..1'
}

function ensureArray(val: any): any[] {
  if (!val) return []
  return Array.isArray(val) ? val : [val]
}
