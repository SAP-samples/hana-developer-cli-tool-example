import { ref, computed, type Ref } from 'vue'
import * as XLSX from 'xlsx'

export interface SmartColumn {
  key: string
  label: string
  width?: string
  importance?: number
  sortable?: boolean
}

export function useSmartTable<T extends Record<string, any>>(columns: SmartColumn[]) {
  const rawData: Ref<T[]> = ref([])
  const loading = ref(false)
  const searchQuery = ref('')
  const sortKey = ref<string | null>(null)
  const sortDir = ref<'Ascending' | 'Descending'>('Ascending')

  function setData(data: T[]) {
    rawData.value = data
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
        columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q))
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
      columns.forEach(col => { obj[col.label] = row[col.key] })
      return obj
    })
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Data')
    XLSX.writeFile(wb, filename)
  }

  function exportCsv(filename = 'export.csv') {
    const header = columns.map(c => c.label).join(',')
    const rows = displayData.value.map(row =>
      columns.map(c => `"${String(row[c.key] ?? '').replace(/"/g, '""')}"`).join(',')
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
    displayData,
    loading,
    searchQuery,
    sortKey,
    sortDir,
    rowCount,
    totalCount,
    setData,
    toggleSort,
    exportExcel,
    exportCsv
  }
}
