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
  outputNodeId?: string
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
