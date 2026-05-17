import { ref } from 'vue'
import type { Ref } from 'vue'
import { useHanaApi } from './useHanaApi'

// ── Type definitions ──────────────────────────────────────────────────────────

export interface ColumnMetadata {
  column: string
  dataType: string
  nullable: boolean
  length?: number
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SERVER_AGGREGATION_THRESHOLD = 10000

// ── Composable ────────────────────────────────────────────────────────────────

export function useDataSource() {
  const columns: Ref<ColumnMetadata[]> = ref([])
  const rowCount: Ref<number | null> = ref(null)
  const loading: Ref<boolean> = ref(false)
  const useServerAggregation: Ref<boolean> = ref(true)

  const { execute } = useHanaApi()

  /**
   * Load column metadata and row-count estimate for the given schema/object.
   * Uses the existing inspectTable-ui endpoint (PUT params then GET).
   */
  async function loadMetadata(schema: string, object: string): Promise<void> {
    loading.value = true
    try {
      const result = await execute<any>('inspectTable-ui', { schema, table: object })

      // Parse fields into ColumnMetadata[]
      const fields: any[] = result.fields || result.columns || []
      columns.value = fields.map((f: any) => {
        const length = f.LENGTH ?? f.length
        const meta: ColumnMetadata = {
          column: f.COLUMN_NAME || f.column_name || '',
          dataType: f.DATA_TYPE_NAME || f.data_type_name || '',
          nullable: (f.IS_NULLABLE || '') === 'TRUE',
        }
        if (length !== undefined && length !== null) {
          meta.length = Number(length)
        }
        return meta
      })

      // Determine row count from TABLE_SIZE if present
      const count = result.TABLE_SIZE?.RECORD_COUNT ?? result.basic?.RECORD_COUNT ?? null
      rowCount.value = count !== null ? Number(count) : null

      // Use server aggregation when count exceeds threshold or is unknown
      useServerAggregation.value =
        rowCount.value === null || rowCount.value > SERVER_AGGREGATION_THRESHOLD
    } finally {
      loading.value = false
    }
  }

  /**
   * Execute an aggregated analytics query against the POST /hana/analytics-ui endpoint.
   * Returns { columns, data, metadata } as documented by the route.
   */
  async function fetchAggregated(config: Record<string, any>): Promise<{
    columns: string[]
    data: any[][]
    metadata: { totalRows: number; aggregated: boolean; executionTime: number }
  }> {
    const res = await fetch('/hana/analytics-ui', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    if (!res.ok) {
      let detail = `${res.status} ${res.statusText}`
      try {
        const body = await res.json()
        if (body.error) detail = body.error
      } catch { /* fall through */ }
      throw new Error(detail)
    }
    return res.json()
  }

  /**
   * Reset all state back to initial values.
   */
  function clear(): void {
    columns.value = []
    rowCount.value = null
    loading.value = false
    useServerAggregation.value = true
  }

  return {
    columns,
    rowCount,
    loading,
    useServerAggregation,
    loadMetadata,
    fetchAggregated,
    clear,
  }
}
