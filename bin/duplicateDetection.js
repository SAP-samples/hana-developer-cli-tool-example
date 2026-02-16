// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"

export const command = 'duplicateDetection'
export const aliases = ['dupdetect', 'findDuplicates', 'duplicates']
export const describe = baseLite.bundle.getText("duplicateDetection")

export const builder = baseLite.getBuilder({
  table: {
    alias: ['t'],
    type: 'string',
    desc: baseLite.bundle.getText("duplicateDetectionTable")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("duplicateDetectionSchema")
  },
  keyColumns: {
    alias: ['k'],
    type: 'string',
    desc: baseLite.bundle.getText("duplicateDetectionKeyColumns")
  },
  checkColumns: {
    alias: ['c'],
    type: 'string',
    desc: baseLite.bundle.getText("duplicateDetectionCheckColumns")
  },
  excludeColumns: {
    alias: ['e'],
    type: 'string',
    desc: baseLite.bundle.getText("duplicateDetectionExcludeColumns")
  },
  mode: {
    alias: ['m'],
    choices: ["exact", "fuzzy", "partial"],
    default: "exact",
    type: 'string',
    desc: baseLite.bundle.getText("duplicateDetectionMode")
  },
  threshold: {
    alias: ['th'],
    type: 'number',
    default: 0.95,
    desc: baseLite.bundle.getText("duplicateDetectionThreshold")
  },
  output: {
    alias: ['o'],
    type: 'string',
    desc: baseLite.bundle.getText("duplicateDetectionOutput")
  },
  format: {
    alias: ['f'],
    choices: ["json", "csv", "summary"],
    default: "summary",
    type: 'string',
    desc: baseLite.bundle.getText("duplicateDetectionFormat")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 10000,
    desc: baseLite.bundle.getText("duplicateDetectionLimit")
  },
  timeout: {
    alias: ['to'],
    type: 'number',
    default: 3600,
    desc: baseLite.bundle.getText("duplicateDetectionTimeout")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})

export let inputPrompts = {
  table: {
    description: baseLite.bundle.getText("duplicateDetectionTable"),
    type: 'string',
    required: true
  },
  schema: {
    description: baseLite.bundle.getText("duplicateDetectionSchema"),
    type: 'string',
    required: false
  },
  keyColumns: {
    description: baseLite.bundle.getText("duplicateDetectionKeyColumns"),
    type: 'string',
    required: false,
    ask: () => true
  },
  checkColumns: {
    description: baseLite.bundle.getText("duplicateDetectionCheckColumns"),
    type: 'string',
    required: false,
    ask: () => false
  },
  mode: {
    description: baseLite.bundle.getText("duplicateDetectionMode"),
    type: 'string',
    required: false,
    ask: () => false
  },
  output: {
    description: baseLite.bundle.getText("duplicateDetectionOutput"),
    type: 'string',
    required: false,
    ask: () => false
  },
  profile: {
    description: baseLite.bundle.getText("profile"),
    type: 'string',
    required: false,
    ask: () => { }
  }
}

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, duplicateDetectionMain, inputPrompts)
}

/**
 * Find duplicate records
 * @param {object} prompts - User prompts
 * @returns {Promise<void>}
 */
export async function duplicateDetectionMain(prompts) {
  const base = await import('../utils/base.js')
  base.debug('duplicateDetectionMain')

  try {
    base.setPrompts(prompts)

    // Set operation timeout
    const timeoutHandle = prompts.timeout > 0
      ? setTimeout(() => process.exit(1), prompts.timeout * 1000)
      : null

    // Connect to database
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()

    const dbKind = (dbClient.getKind() || 'hana').toLowerCase()

    // Get schema if not provided
    let schema = prompts.schema

    if (!schema && dbKind !== 'sqlite') {
      schema = await getCurrentSchema(dbClient, dbKind)
    }

    const table = prompts.table

    console.log(baseLite.bundle.getText("info.startingDuplicateDetection", [table]))

    // Get table columns
    const tableColumns = await getTableColumns(dbClient, schema, table, dbKind)

    if (tableColumns.length === 0) {
      throw new Error(baseLite.bundle.getText("error.noColumns"))
    }

    // Determine columns to check
    let checkColumns = tableColumns
    if (prompts.checkColumns) {
      const selected = prompts.checkColumns.split(',').map(c => c.trim()).filter(c => c)
      checkColumns = checkColumns.filter(c => selected.includes(c))
    }

    if (prompts.excludeColumns) {
      const excluded = prompts.excludeColumns.split(',').map(c => c.trim()).filter(c => c)
      checkColumns = checkColumns.filter(c => !excluded.includes(c))
    }

    // Get data to check
    let query = `SELECT * FROM ${formatQualifiedName(schema, table)}`
    if (prompts.limit > 0) {
      query += ` LIMIT ${prompts.limit}`
    }

    const rows = await dbClient.execSQL(query)

    // Detect duplicates
    const results = detectDuplicates(rows, checkColumns, prompts.mode, prompts.threshold)

    // Output results
    if (prompts.output) {
      await outputResults(prompts.output, results, prompts.format)
    } else {
      displayResults(results, prompts.format)
    }

    console.log(baseLite.bundle.getText("success.duplicateDetectionComplete", [
      results.totalRows,
      results.uniqueRows,
      results.duplicateGroups,
      results.totalDuplicates
    ]))

    await dbClient.disconnect()
    if (timeoutHandle) clearTimeout(timeoutHandle)

  } catch (error) {
    console.error(baseLite.bundle.getText("error.duplicateDetection", [error.message]))
    base.debug(error)
    throw error
  }
}

/**
 * Get current schema
 * @param {object} dbClient - Database client
 * @param {string} dbKind - Database kind
 * @returns {Promise<string>}
 */
async function getCurrentSchema(dbClient, dbKind) {
  if (dbKind === 'hana') {
    const result = await dbClient.execSQL('SELECT CURRENT_SCHEMA FROM DUMMY')
    return result[0]?.CURRENT_SCHEMA || 'PUBLIC'
  } else if (dbKind === 'postgres') {
    const result = await dbClient.execSQL('SELECT current_schema()')
    return result[0]?.current_schema || 'public'
  }
  return 'public'
}

/**
 * Get table columns
 * @param {object} dbClient - Database client
 * @param {string|null} schema - Schema name
 * @param {string} table - Table name
 * @param {string} dbKind - Database kind
 * @returns {Promise<Array<string>>}
 */
async function getTableColumns(dbClient, schema, table, dbKind) {
  let query

  if (dbKind === 'hana') {
    query = `SELECT COLUMN_NAME FROM SYS.TABLE_COLUMNS 
             WHERE SCHEMA_NAME = ? AND TABLE_NAME = ? 
             ORDER BY POSITION`
    const result = await dbClient.execSQL(query, [schema || 'PUBLIC', table.toUpperCase()])
    return result.map(r => r.COLUMN_NAME)
  } else if (dbKind === 'postgres') {
    query = `SELECT column_name FROM information_schema.columns 
             WHERE table_schema = ? AND table_name = ? 
             ORDER BY ordinal_position`
    const result = await dbClient.execSQL(query, [schema || 'public', table.toLowerCase()])
    return result.map(r => r.column_name)
  }

  return []
}

/**
 * Format qualified table name
 * @param {string|null} schema - Schema name
 * @param {string} table - Table name
 * @returns {string}
 */
function formatQualifiedName(schema, table) {
  if (schema) {
    return `"${schema}"."${table}"`
  }
  return `"${table}"`
}

/**
 * Detect duplicate records
 * @param {Array<object>} rows - Data rows
 * @param {Array<string>} columns - Columns to check
 * @param {string} mode - Detection mode (exact, fuzzy, partial)
 * @param {number} threshold - Similarity threshold for fuzzy matching
 * @returns {object}
 */
function detectDuplicates(rows, columns, mode, threshold) {
  const results = {
    totalRows: rows.length,
    uniqueRows: 0,
    duplicateGroups: 0,
    totalDuplicates: 0,
    duplicates: [],
    stats: {}
  }

  if (mode === 'exact') {
    results.duplicates = detectExactDuplicates(rows, columns)
  } else if (mode === 'fuzzy') {
    results.duplicates = detectFuzzyDuplicates(rows, columns, threshold)
  } else if (mode === 'partial') {
    results.duplicates = detectPartialDuplicates(rows, columns)
  }

  results.duplicateGroups = results.duplicates.length
  results.totalDuplicates = results.duplicates.reduce((sum, group) => sum + group.records.length - 1, 0)
  results.uniqueRows = results.totalRows - results.totalDuplicates

  // Calculate statistics
  for (const group of results.duplicates) {
    const key = group.matchKey || 'unknown'
    if (!results.stats[key]) {
      results.stats[key] = 0
    }
    results.stats[key]++
  }

  return results
}

/**
 * Detect exact duplicates
 * @param {Array<object>} rows - Data rows
 * @param {Array<string>} columns - Columns to check
 * @returns {Array<object>}
 */
function detectExactDuplicates(rows, columns) {
  const groups = new Map()
  const duplicates = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const key = columns.map(c => String(row[c] || '')).join('||')

    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key).push(i)
  }

  for (const [key, indices] of groups.entries()) {
    if (indices.length > 1) {
      duplicates.push({
        matchKey: key,
        matchPercentage: 100,
        count: indices.length,
        records: indices.map(idx => ({
          rowNumber: idx,
          data: rows[idx]
        }))
      })
    }
  }

  return duplicates
}

/**
 * Detect fuzzy duplicates using Levenshtein distance
 * @param {Array<object>} rows - Data rows
 * @param {Array<string>} columns - Columns to check
 * @param {number} threshold - Similarity threshold (0-1)
 * @returns {Array<object>}
 */
function detectFuzzyDuplicates(rows, columns, threshold) {
  const duplicates = []
  const matched = new Set()

  for (let i = 0; i < rows.length; i++) {
    if (matched.has(i)) continue

    const group = [{
      rowNumber: i,
      data: rows[i]
    }]

    for (let j = i + 1; j < rows.length; j++) {
      if (matched.has(j)) continue

      const similarity = calculateSimilarity(rows[i], rows[j], columns)
      if (similarity >= threshold) {
        group.push({
          rowNumber: j,
          data: rows[j]
        })
        matched.add(j)
      }
    }

    if (group.length > 1) {
      duplicates.push({
        matchKey: `fuzzy_group_${duplicates.length}`,
        matchPercentage: Math.round(threshold * 100),
        count: group.length,
        records: group
      })
    }

    matched.add(i)
  }

  return duplicates
}

/**
 * Detect partial duplicates
 * @param {Array<object>} rows - Data rows
 * @param {Array<string>} columns - Columns to check
 * @returns {Array<object>}
 */
function detectPartialDuplicates(rows, columns) {
  const groups = new Map()
  const duplicates = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const key = columns.slice(0, 1).map(c => String(row[c] || '')).join('||')

    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key).push(i)
  }

  for (const [key, indices] of groups.entries()) {
    if (indices.length > 1) {
      duplicates.push({
        matchKey: key,
        matchPercentage: 50,
        count: indices.length,
        records: indices.map(idx => ({
          rowNumber: idx,
          data: rows[idx]
        }))
      })
    }
  }

  return duplicates
}

/**
 * Calculate similarity between two rows
 * @param {object} row1 - First row
 * @param {object} row2 - Second row
 * @param {Array<string>} columns - Columns to compare
 * @returns {number}
 */
function calculateSimilarity(row1, row2, columns) {
  let totalSimilarity = 0

  for (const col of columns) {
    const val1 = String(row1[col] || '')
    const val2 = String(row2[col] || '')
    const similarity = 1 - (levenshteinDistance(val1, val2) / Math.max(val1.length, val2.length, 1))
    totalSimilarity += similarity
  }

  return columns.length > 0 ? totalSimilarity / columns.length : 0
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number}
 */
function levenshteinDistance(str1, str2) {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i
  }

  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      )
    }
  }

  return track[str2.length][str1.length]
}

/**
 * Output results to file
 * @param {string} filePath - Output file path
 * @param {object} results - Detection results
 * @param {string} format - Output format
 * @returns {Promise<void>}
 */
async function outputResults(filePath, results, format) {
  const fsModule = await import('fs')
  const fs = fsModule.promises

  let content

  if (format === 'json') {
    content = JSON.stringify(results, null, 2)
  } else if (format === 'csv') {
    content = 'Group,Rows,Similarity\n'
    for (const group of results.duplicates) {
      content += `"${group.matchKey}","${group.count}","${group.matchPercentage}%"\n`
    }
  } else {
    content = formatSummaryReport(results)
  }

  await fs.writeFile(filePath, content)
}

/**
 * Format summary report
 * @param {object} results - Detection results
 * @returns {string}
 */
function formatSummaryReport(results) {
  let report = 'Duplicate Detection Report\n'
  report += '==========================\n\n'
  report += `Total Rows: ${results.totalRows}\n`
  report += `Unique Rows: ${results.uniqueRows}\n`
  report += `Duplicate Groups: ${results.duplicateGroups}\n`
  report += `Total Duplicates: ${results.totalDuplicates}\n\n`

  if (results.duplicates.length > 0) {
    report += 'Duplicate Groups:\n'
    for (const group of results.duplicates.slice(0, 20)) {
      report += `  Group: ${group.matchKey}, Records: ${group.count}, Match: ${group.matchPercentage}%\n`
    }
    if (results.duplicates.length > 20) {
      report += `  ... and ${results.duplicates.length - 20} more groups\n`
    }
  }

  return report
}

/**
 * Display results in console
 * @param {object} results - Detection results
 * @param {string} format - Display format
 * @returns {void}
 */
function displayResults(results, format) {
  if (format === 'json') {
    console.log(JSON.stringify(results, null, 2))
  } else if (format === 'csv') {
    console.log('Group,Rows,Similarity')
    for (const group of results.duplicates) {
      console.log(`"${group.matchKey}","${group.count}","${group.matchPercentage}%"`)
    }
  } else {
    console.log(formatSummaryReport(results))
  }
}
