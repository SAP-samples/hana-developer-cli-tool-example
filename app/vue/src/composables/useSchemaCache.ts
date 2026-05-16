import { ref, reactive } from 'vue'
import { useHanaApi } from './useHanaApi'

export interface TableInfo {
  schema: string
  name: string
  type: string
}

export interface ColumnInfo {
  name: string
  dataType: string
  length: number
  nullable: boolean
}

interface CacheEntry<T> {
  data: T
  fetchedAt: number
}

const TTL = 5 * 60 * 1000

const schemas = ref<string[]>([])
const tables = reactive(new Map<string, CacheEntry<TableInfo[]>>())
const columns = reactive(new Map<string, CacheEntry<ColumnInfo[]>>())

let schemasLoaded = false
let schemasPromise: Promise<void> | null = null

const { execute } = useHanaApi()

function isStale(entry: CacheEntry<any> | undefined): boolean {
  if (!entry) return true
  return Date.now() - entry.fetchedAt > TTL
}

async function getSchemas(): Promise<string[]> {
  if (schemasLoaded && schemas.value.length > 0) return schemas.value
  if (schemasPromise) { await schemasPromise; return schemas.value }

  schemasPromise = (async () => {
    try {
      const result = await execute<any[]>('schemas-ui', { schema: '*', limit: 1000 })
      schemas.value = result.map(r => r.SCHEMA_NAME || r.schema_name || '').filter(Boolean)
      schemasLoaded = true
    } catch { /* silent */ }
  })()
  await schemasPromise
  schemasPromise = null
  return schemas.value
}

async function getTables(schema: string): Promise<TableInfo[]> {
  const key = schema
  const cached = tables.get(key)
  if (cached && !isStale(cached)) return cached.data

  try {
    const result = await execute<any[]>('tables-ui', { schema, table: '*', limit: 2000 })
    const data: TableInfo[] = result.map(r => ({
      schema: r.SCHEMA_NAME || schema,
      name: r.TABLE_NAME || r.table_name || '',
      type: r.TABLE_TYPE || 'TABLE'
    }))
    tables.set(key, { data, fetchedAt: Date.now() })
    return data
  } catch { return [] }
}

async function getColumns(schema: string, table: string): Promise<ColumnInfo[]> {
  const key = `${schema}.${table}`
  const cached = columns.get(key)
  if (cached && !isStale(cached)) return cached.data

  try {
    const result = await execute<any>('inspectTable-ui', { schema, table, limit: 500 })
    const fields = result.fields || result.columns || []
    const data: ColumnInfo[] = fields.map((f: any) => ({
      name: f.COLUMN_NAME || f.column_name || '',
      dataType: f.DATA_TYPE_NAME || f.data_type_name || '',
      length: f.LENGTH || f.length || 0,
      nullable: (f.IS_NULLABLE || '') === 'TRUE'
    }))
    columns.set(key, { data, fetchedAt: Date.now() })
    return data
  } catch { return [] }
}

function refresh() {
  schemasLoaded = false
  schemas.value = []
  tables.clear()
  columns.clear()
}

export function useSchemaCache() {
  return { schemas, getSchemas, getTables, getColumns, refresh }
}
