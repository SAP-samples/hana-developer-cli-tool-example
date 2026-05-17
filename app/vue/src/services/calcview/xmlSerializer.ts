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
    logicalModel: serializeLogicalModel(model.logicalModel),
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

function serializeLogicalModel(lm: LogicalModel): Record<string, unknown> {
  return {
    attributes: lm.attributes.length > 0 ? {
      attribute: lm.attributes.map(a => ({
        '@_id': a.id,
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
