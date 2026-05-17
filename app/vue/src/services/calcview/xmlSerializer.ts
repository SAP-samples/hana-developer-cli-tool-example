import { XMLBuilder } from 'fast-xml-parser'
import type { CalcViewModel, CalcViewNode, DataSource, LogicalModel, Hierarchy } from './types'

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  indentBy: '  ',
  suppressEmptyNode: false
})

export function serializeCalcView(model: CalcViewModel): string {
  const scenario: Record<string, unknown> = {
    '@_xmlns:Calculation': 'http://www.sap.com/ndb/BiModelCalculation.ecore',
    '@_id': model.id,
    '@_applyPrivilegeType': model.applyPrivilegeType,
    '@_dataCategory': model.dataCategory,
    descriptions: { '@_defaultDescription': model.description },
    localVariables: serializeVariables(model),
    variableMappings: serializeVariableMappings(model),
    dataSources: serializeDataSources(model.dataSources),
    calculationViews: serializeCalculationViews(model.calculationViews),
    logicalModel: {
      '@_id': model.outputNodeId || '',
      ...serializeLogicalModel(model.logicalModel)
    },
    layout: serializeLayout(model)
  }

  const xmlObj = {
    '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
    'Calculation:scenario': scenario
  }
  return builder.build(xmlObj)
}

function serializeVariables(model: CalcViewModel): unknown {
  if (model.localVariables.length === 0) return ''
  return {
    localVariable: model.localVariables.map(v => ({
      '@_id': v.id,
      '@_datatype': v.dataType,
      ...(v.mandatory ? { '@_mandatory': 'true' } : {}),
      ...(v.defaultValue !== undefined ? { '@_defaultValue': v.defaultValue } : {})
    }))
  }
}

function serializeVariableMappings(model: CalcViewModel): unknown {
  if (model.variableMappings.length === 0) return ''
  return {
    variableMapping: model.variableMappings.map(m => ({
      '@_dataSource': m.sourceVariable,
      '@_target': m.targetVariable,
      '@_node': m.nodeId
    }))
  }
}

function serializeDataSources(sources: DataSource[]): unknown {
  if (sources.length === 0) return ''
  return {
    DataSource: sources.map(s => ({
      '@_id': s.id,
      ...(s.type !== 'table' ? { '@_type': s.type } : {}),
      resourceUri: s.objectName
    }))
  }
}

function serializeCalculationViews(nodes: CalcViewNode[]): unknown {
  if (nodes.length === 0) return ''
  return {
    calculationView: nodes.map(serializeNode)
  }
}

function serializeNode(node: CalcViewNode): Record<string, unknown> {
  const xsiType = getXsiType(node.type)
  const obj: Record<string, unknown> = {
    '@_xsi:type': xsiType,
    '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    '@_id': node.id,
    ...(node.joinConfig ? {
      '@_joinType': node.joinConfig.joinType,
      '@_cardinality': serializeCardinality(node.joinConfig.cardinality)
    } : {}),
    viewAttributes: {
      viewAttribute: node.outputColumns.map(c => ({ '@_id': c.id }))
    },
    ...(node.calculatedColumns.length > 0 ? {
      calculatedViewAttributes: {
        calculatedViewAttribute: node.calculatedColumns.map(c => ({
          '@_id': c.id,
          '@_datatype': c.dataType,
          '@_expressionLanguage': 'SQL',
          formula: c.expression
        }))
      }
    } : { calculatedViewAttributes: '' }),
    input: node.inputs.map(i => ({
      '@_node': i.node,
      mapping: node.outputColumns.map(c => ({
        '@_xsi:type': 'Calculation:AttributeMapping',
        '@_target': c.id,
        '@_source': c.id
      }))
    })),
    ...(node.filterExpression ? {
      filter: { formula: node.filterExpression }
    } : {}),
    ...(node.joinConfig && node.joinConfig.conditions.length > 0 ? {
      joinAttribute: node.joinConfig.conditions.map(c => ({
        '@_name': c.leftColumn
      }))
    } : {})
  }
  return obj
}

function serializeCardinality(card: string): string {
  const map: Record<string, string> = {
    '1..1': 'C1_1', '1..N': 'C1_N', 'N..1': 'CN_1', 'N..M': 'CN_M'
  }
  return map[card] || 'C1_1'
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

function serializeLayout(model: CalcViewModel): Record<string, unknown> {
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
