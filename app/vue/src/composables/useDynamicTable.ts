import { ref, computed, type Ref } from 'vue'
import * as XLSX from 'xlsx'
import type { SmartColumn } from './useSmartTable'

export function useDynamicTable() {
  const rawData: Ref<any[]> = ref([])
  const columns: Ref<SmartColumn[]> = ref([])
  const loading = ref(false)
  const searchQuery = ref('')
  const sortKey = ref<string | null>(null)
  const sortDir = ref<'Ascending' | 'Descending'>('Ascending')

  function setData(data: any[]) {
    rawData.value = data
    if (data.length > 0 && columns.value.length === 0) {
      columns.value = Object.keys(data[0]).map((key, i) => ({
        key,
        label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        sortable: true,
        importance: i < 3 ? 3 : i < 5 ? 2 : 1
      }))
    }
  }

  function resetColumns() {
    columns.value = []
  }

  function toggleSort(key: string) {
    if (sortKey.value === key) {
      sortDir.value = sortDir.value === 'Ascending' ? 'Descending' : 'Ascending'
    } else {
      sortKey.value = key
      sortDir.value = 'Ascending'
    }
  }

  const displayData = computed(() => {
    let result = [...rawData.value]

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(row =>
        columns.value.some(col => String(row[col.key] ?? '').toLowerCase().includes(q))
      )
    }

    if (sortKey.value) {
      const key = sortKey.value
      const dir = sortDir.value === 'Ascending' ? 1 : -1
      result.sort((a, b) => {
        const aVal = a[key] ?? ''
        const bVal = b[key] ?? ''
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * dir
        }
        return String(aVal).localeCompare(String(bVal)) * dir
      })
    }

    return result
  })

  const rowCount = computed(() => displayData.value.length)
  const totalCount = computed(() => rawData.value.length)

  function exportExcel(filename = 'export.xlsx') {
    const exportData = displayData.value.map(row => {
      const obj: Record<string, any> = {}
      columns.value.forEach(col => { obj[col.label] = row[col.key] })
      return obj
    })
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Data')
    XLSX.writeFile(wb, filename)
  }

  function exportCsv(filename = 'export.csv') {
    const cols = columns.value
    const header = cols.map(c => c.label).join(',')
    const rows = displayData.value.map(row =>
      cols.map(c => `"${String(row[c.key] ?? '').replace(/"/g, '""')}"`).join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    rawData,
    columns,
    displayData,
    loading,
    searchQuery,
    sortKey,
    sortDir,
    rowCount,
    totalCount,
    setData,
    resetColumns,
    toggleSort,
    exportExcel,
    exportCsv
  }
}
