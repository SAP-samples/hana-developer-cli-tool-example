export interface DiffRow {
  status: 'added' | 'removed' | 'changed' | 'unchanged'
  left?: Record<string, any>
  right?: Record<string, any>
  changedKeys?: string[]
}

export interface DiffStats {
  added: number
  removed: number
  changed: number
  unchanged: number
}

export interface DiffResult {
  rows: DiffRow[]
  stats: DiffStats
  columns: string[]
}

export function computeDiff(
  leftData: Record<string, any>[],
  rightData: Record<string, any>[],
  keyColumns?: string[]
): DiffResult {
  const columns = Array.from(new Set([
    ...Object.keys(leftData[0] || {}),
    ...Object.keys(rightData[0] || {})
  ]))

  if (keyColumns && keyColumns.length > 0) {
    return keyBasedDiff(leftData, rightData, keyColumns, columns)
  }
  return positionalDiff(leftData, rightData, columns)
}

function makeKey(row: Record<string, any>, keyColumns: string[]): string {
  return keyColumns.map(k => JSON.stringify(row[k] ?? null)).join('|')
}

function keyBasedDiff(
  leftData: Record<string, any>[],
  rightData: Record<string, any>[],
  keyColumns: string[],
  columns: string[]
): DiffResult {
  const leftMap = new Map<string, Record<string, any>>()
  const rightMap = new Map<string, Record<string, any>>()

  for (const row of leftData) leftMap.set(makeKey(row, keyColumns), row)
  for (const row of rightData) rightMap.set(makeKey(row, keyColumns), row)

  const rows: DiffRow[] = []
  const stats: DiffStats = { added: 0, removed: 0, changed: 0, unchanged: 0 }

  for (const [key, leftRow] of leftMap) {
    const rightRow = rightMap.get(key)
    if (!rightRow) {
      rows.push({ status: 'removed', left: leftRow })
      stats.removed++
    } else {
      const changedKeys = columns.filter(c =>
        JSON.stringify(leftRow[c] ?? null) !== JSON.stringify(rightRow[c] ?? null)
      )
      if (changedKeys.length > 0) {
        rows.push({ status: 'changed', left: leftRow, right: rightRow, changedKeys })
        stats.changed++
      } else {
        rows.push({ status: 'unchanged', left: leftRow, right: rightRow })
        stats.unchanged++
      }
    }
  }

  for (const [key, rightRow] of rightMap) {
    if (!leftMap.has(key)) {
      rows.push({ status: 'added', right: rightRow })
      stats.added++
    }
  }

  rows.sort((a, b) => {
    const order = { removed: 0, changed: 1, added: 2, unchanged: 3 }
    return order[a.status] - order[b.status]
  })

  return { rows, stats, columns }
}

function positionalDiff(
  leftData: Record<string, any>[],
  rightData: Record<string, any>[],
  columns: string[]
): DiffResult {
  const maxLen = Math.max(leftData.length, rightData.length)
  const rows: DiffRow[] = []
  const stats: DiffStats = { added: 0, removed: 0, changed: 0, unchanged: 0 }

  for (let i = 0; i < maxLen; i++) {
    const left = leftData[i]
    const right = rightData[i]

    if (!left) {
      rows.push({ status: 'added', right })
      stats.added++
    } else if (!right) {
      rows.push({ status: 'removed', left })
      stats.removed++
    } else {
      const changedKeys = columns.filter(c =>
        JSON.stringify(left[c] ?? null) !== JSON.stringify(right[c] ?? null)
      )
      if (changedKeys.length > 0) {
        rows.push({ status: 'changed', left, right, changedKeys })
        stats.changed++
      } else {
        rows.push({ status: 'unchanged', left, right })
        stats.unchanged++
      }
    }
  }

  return { rows, stats, columns }
}
