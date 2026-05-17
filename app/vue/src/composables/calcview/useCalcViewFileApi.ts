// app/vue/src/composables/calcview/useCalcViewFileApi.ts
import { useHanaApi } from '../useHanaApi'

export interface CalcViewFileInfo {
  name: string
  fileName: string
  filePath: string
  lastModified: string
  size: number
}

export function useCalcViewFileApi() {
  const { fetchDirect, execute } = useHanaApi()

  async function listProjectFiles(dirPath: string): Promise<CalcViewFileInfo[]> {
    const encoded = encodeURIComponent(dirPath)
    return fetchDirect<CalcViewFileInfo[]>(`/hana/calcview/project/list?path=${encoded}`)
  }

  async function readProjectFile(filePath: string, basePath?: string): Promise<{ xml: string; filePath: string }> {
    let url = `/hana/calcview/project/read?file=${encodeURIComponent(filePath)}`
    if (basePath) url += `&base=${encodeURIComponent(basePath)}`
    return fetchDirect<{ xml: string; filePath: string }>(url)
  }

  async function writeProjectFile(filePath: string, xml: string, basePath?: string): Promise<{ success: boolean; filePath: string }> {
    const res = await fetch('/hana/calcview/project/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: filePath, xml, base: basePath })
    })
    if (!res.ok) {
      const detail = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(detail.error || `${res.status} ${res.statusText}`)
    }
    return res.json()
  }

  async function listRuntimeViews(): Promise<any[]> {
    try {
      return await execute<any[]>('calcViews')
    } catch {
      return []
    }
  }

  return { listProjectFiles, readProjectFile, writeProjectFile, listRuntimeViews }
}

export function generateSkeletonXml(config: {
  name: string
  dataCategory: string
  description: string
  initialNode: string
}): string {
  const { name, dataCategory, description, initialNode } = config

  let calcViewsXml = ''
  let shapesXml = ''

  if (initialNode !== 'none') {
    const typeMap: Record<string, string> = {
      projection: 'Calculation:ProjectionView',
      aggregation: 'Calculation:AggregationView',
      join: 'Calculation:JoinView'
    }
    const xsiType = typeMap[initialNode] || 'Calculation:ProjectionView'
    const nodeId = `${initialNode.charAt(0).toUpperCase() + initialNode.slice(1)}_1`

    calcViewsXml = `
    <calculationView xsi:type="${xsiType}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="${nodeId}">
      <viewAttributes/>
      <input/>
    </calculationView>`

    shapesXml = `
      <shape expanded="true" modelObjectName="${nodeId}" modelObjectNameSpace="CalculationView">
        <upperLeftCorner x="200" y="250"/>
      </shape>`
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<Calculation:scenario xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore" id="${name}" applyPrivilegeType="NONE" dataCategory="${dataCategory}">
  <descriptions defaultDescription="${description}"/>
  <localVariables/>
  <variableMappings/>
  <dataSources/>
  <calculationViews>${calcViewsXml}
  </calculationViews>
  <logicalModel${initialNode !== 'none' ? ` id="${initialNode.charAt(0).toUpperCase() + initialNode.slice(1)}_1"` : ''}>
    <attributes/>
    <calculatedAttributes/>
    <baseMeasures/>
    <calculatedMeasures/>
    <restrictedMeasures/>
  </logicalModel>
  <layout>
    <shapes>
      <shape expanded="true" modelObjectName="Output" modelObjectNameSpace="MeasureGroup">
        <upperLeftCorner x="200" y="50"/>
      </shape>${shapesXml}
    </shapes>
  </layout>
</Calculation:scenario>`
}
