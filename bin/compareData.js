// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"

export const command = 'compareData'
export const aliases = ['cmpdata', 'compardata', 'dataCompare']
export const describe = baseLite.bundle.getText("compareData")

export const builder = baseLite.getBuilder({
  sourceTable: {
    alias: ['st'],
    type: 'string',
    desc: baseLite.bundle.getText("compareDataSourceTable")
  },
  sourceSchema: {
    alias: ['ss'],
    type: 'string',
    desc: baseLite.bundle.getText("compareDataSourceSchema")
  },
  targetTable: {
    alias: ['tt'],
    type: 'string',
    desc: baseLite.bundle.getText("compareDataTargetTable")
  },
  targetSchema: {
    alias: ['ts'],
    type: 'string',
    desc: baseLite.bundle.getText("compareDataTargetSchema")
  },
  keyColumns: {
    alias: ['k'],
    type: 'string',
    desc: baseLite.bundle.getText("compareDataKeyColumns")
  },
  output: {
    alias: ['o'],
    type: 'string',
    desc: baseLite.bundle.getText("compareDataOutput")
  },
  columns: {
    alias: ['c'],
    type: 'string',
    desc: baseLite.bundle.getText("compareDataColumns")
  },
  showMatches: {
    alias: ['sm'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("compareDataShowMatches")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 1000,
    desc: baseLite.bundle.getText("compareDataLimit")
  },
  timeout: {
    alias: ['to'],
    type: 'number',
    default: 3600,
    desc: baseLite.bundle.getText("compareDataTimeout")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})

export let inputPrompts = {
  sourceTable: {
    description: baseLite.bundle.getText("compareDataSourceTable"),
    type: 'string',
    required: true
  },
  sourceSchema: {
    description: baseLite.bundle.getText("compareDataSourceSchema"),
    type: 'string',
    required: false
  },
  targetTable: {
    description: baseLite.bundle.getText("compareDataTargetTable"),
    type: 'string',
    required: true
  },
  targetSchema: {
    description: baseLite.bundle.getText("compareDataTargetSchema"),
    type: 'string',
    required: false
  },
  keyColumns: {
    description: baseLite.bundle.getText("compareDataKeyColumns"),
    type: 'string',
    required: true
  },
  output: {
    description: baseLite.bundle.getText("compareDataOutput"),
    type: 'string',
    required: false,
    ask: () => false
  },
  columns: {
    description: baseLite.bundle.getText("compareDataColumns"),
    type: 'string',
    required: false,
    ask: () => false
  },
  showMatches: {
    description: baseLite.bundle.getText("compareDataShowMatches"),
    type: 'boolean',
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
  base.promptHandler(argv, compareDataMain, inputPrompts)
}

/**
 * Compare data between two tables
 * @param {object} prompts - User prompts with table and comparison options
 * @returns {Promise<void>}
 */
export async function compareDataMain(prompts) {
  const base = await import('../utils/base.js')
  base.debug('compareDataMain')

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

    // Get schemas if not provided
    let sourceSchema = prompts.sourceSchema
    let targetSchema = prompts.targetSchema

    if (!sourceSchema && dbKind !== 'sqlite') {
      sourceSchema = await getCurrentSchema(dbClient, dbKind)
    }

    if (!targetSchema && dbKind !== 'sqlite') {
      targetSchema = sourceSchema
    }

    const sourceTable = prompts.sourceTable
    const targetTable = prompts.targetTable
    const keyColumns = prompts.keyColumns.split(',').map(c => c.trim()).filter(c => c)

    if (keyColumns.length === 0) {
      throw new Error(baseLite.bundle.getText("errNoKeyColumns"))
    }

    console.log(baseLite.bundle.getText("info.startingDataComparison", [sourceTable, targetTable]))

    // Get column lists
    let sourceColumns = await getTableColumns(dbClient, sourceSchema, sourceTable, dbKind)
    let targetColumns = await getTableColumns(dbClient, targetSchema, targetTable, dbKind)

    // Filter columns if specified
    if (prompts.columns) {
      const selectedCols = prompts.columns.split(',').map(c => c.trim()).filter(c => c)
      sourceColumns = sourceColumns.filter(c => selectedCols.includes(c))
      targetColumns = targetColumns.filter(c => selectedCols.includes(c))
    }

    // Compare rows
    const comparison = await compareTables(
      dbClient,
      sourceSchema,
      sourceTable,
      targetSchema,
      targetTable,
      keyColumns,
      sourceColumns,
      targetColumns,
      prompts.limit,
      dbKind
    )

    // Output results
    if (prompts.output) {
      await outputComparisonResults(prompts.output, comparison)
    } else {
      displayComparisonResults(comparison, prompts.showMatches)
    }

    console.log(baseLite.bundle.getText("success.comparisonComplete", [
      comparison.sourceCount,
      comparison.targetCount,
      comparison.matches,
      comparison.differences,
      comparison.sourceOnly,
      comparison.targetOnly
    ]))

    await dbClient.disconnect()
    if (timeoutHandle) clearTimeout(timeoutHandle)

  } catch (error) {
    console.error(baseLite.bundle.getText("error.compareData", [error.message]))
    base.debug(error)
    throw error
  }
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
 * Compare two tables
 * @param {object} dbClient - Database client
 * @param {string|null} sourceSchema - Source schema
 * @param {string} sourceTable - Source table
 * @param {string|null} targetSchema - Target schema
 * @param {string} targetTable - Target table
 * @param {Array<string>} keyColumns - Key columns for comparison
 * @param {Array<string>} sourceColumns - Columns to compare
 * @param {Array<string>} targetColumns - Columns to compare
 * @param {number} limit - Maximum rows to compare
 * @param {string} dbKind - Database kind
 * @returns {Promise<object>}
 */
async function compareTables(dbClient, sourceSchema, sourceTable, targetSchema, targetTable, keyColumns, sourceColumns, targetColumns, limit, dbKind) {
  const comparison = {
    sourceCount: 0,
    targetCount: 0,
    matches: 0,
    differences: [],
    sourceOnly: [],
    targetOnly: []
  }

  try {
    // Get all rows from source
    const sourceQualified = formatQualifiedName(sourceSchema, sourceTable)
    const targetQualified = formatQualifiedName(targetSchema, targetTable)
    const keyList = keyColumns.map(k => `"${k}"`).join(',')
    const colList = sourceColumns.map(c => `"${c}"`).join(',')

    const sourceQuery = `SELECT ${keyList}, ${colList} FROM ${sourceQualified} LIMIT ${limit}`
    const sourceRows = await dbClient.execSQL(sourceQuery)
    comparison.sourceCount = sourceRows.length

    // Build target map for faster lookup
    const targetQuery = `SELECT ${keyList}, ${colList} FROM ${targetQualified} LIMIT ${limit}`
    const targetRows = await dbClient.execSQL(targetQuery)
    comparison.targetCount = targetRows.length

    const targetMap = new Map()
    for (const row of targetRows) {
      const keyValue = keyColumns.map(k => row[k]).join('|')
      targetMap.set(keyValue, row)
    }

    // Compare rows
    for (const sourceRow of sourceRows) {
      const keyValue = keyColumns.map(k => sourceRow[k]).join('|')

      if (targetMap.has(keyValue)) {
        const targetRow = targetMap.get(keyValue)
        const diff = findDifferences(sourceRow, targetRow, sourceColumns)

        if (diff.length > 0) {
          comparison.differences.push({
            key: keyValue,
            differences: diff
          })
        } else {
          comparison.matches++
        }
        targetMap.delete(keyValue)
      } else {
        comparison.sourceOnly.push({
          key: keyValue,
          row: sourceRow
        })
      }
    }

    // Remaining in target are targetOnly
    for (const [keyValue, row] of targetMap) {
      comparison.targetOnly.push({
        key: keyValue,
        row: row
      })
    }

  } catch (error) {
    baseLite.debug(`Error comparing tables: ${error.message}`)
    throw error
  }

  return comparison
}

/**
 * Find differences between two rows
 * @param {object} sourceRow - Source row
 * @param {object} targetRow - Target row
 * @param {Array<string>} columns - Columns to check
 * @returns {Array<object>}
 */
function findDifferences(sourceRow, targetRow, columns) {
  const differences = []

  for (const col of columns) {
    const sourceValue = sourceRow[col]
    const targetValue = targetRow[col]

    if (JSON.stringify(sourceValue) !== JSON.stringify(targetValue)) {
      differences.push({
        column: col,
        sourceValue,
        targetValue
      })
    }
  }

  return differences
}

/**
 * Display comparison results in console
 * @param {object} comparison - Comparison results
 * @param {boolean} showMatches - Whether to show matching rows
 * @returns {void}
 */
function displayComparisonResults(comparison, showMatches = false) {
  if (showMatches && comparison.matches > 0) {
    console.log(`\n${baseLite.colors.cyan('Matching rows:')} ${comparison.matches}`)
  }

  if (comparison.differences.length > 0) {
    console.log(`\n${baseLite.colors.yellow('Differences found:')} ${comparison.differences.length}`)
    comparison.differences.slice(0, 10).forEach(diff => {
      console.log(`  Key: ${diff.key}`)
      diff.differences.forEach(d => {
        console.log(`    ${d.column}: ${d.sourceValue} -> ${d.targetValue}`)
      })
    })
    if (comparison.differences.length > 10) {
      console.log(`  ... and ${comparison.differences.length - 10} more`)
    }
  }

  if (comparison.sourceOnly.length > 0) {
    console.log(`\n${baseLite.colors.red('Source-only rows:')} ${comparison.sourceOnly.length}`)
  }

  if (comparison.targetOnly.length > 0) {
    console.log(`\n${baseLite.colors.green('Target-only rows:')} ${comparison.targetOnly.length}`)
  }
}

/**
 * Output comparison results to file
 * @param {string} filePath - Output file path
 * @param {object} comparison - Comparison results
 * @returns {Promise<void>}
 */
async function outputComparisonResults(filePath, comparison) {
  const fs = await import('fs')

  const report = {
    summary: {
      sourceCount: comparison.sourceCount,
      targetCount: comparison.targetCount,
      matches: comparison.matches,
      differences: comparison.differences.length,
      sourceOnly: comparison.sourceOnly.length,
      targetOnly: comparison.targetOnly.length
    },
    differences: comparison.differences,
    sourceOnly: comparison.sourceOnly,
    targetOnly: comparison.targetOnly
  }

  await fs.promises.writeFile(filePath, JSON.stringify(report, null, 2), 'utf8')
}

/**
 * Get current schema
 * @param {object} dbClient - Database client
 * @param {string} dbKind - Database kind
 * @returns {Promise<string|null>}
 */
async function getCurrentSchema(dbClient, dbKind) {
  try {
    if (dbKind === 'hana') {
      const result = await dbClient.execSQL("SELECT CURRENT_SCHEMA FROM DUMMY")
      return result?.[0]?.CURRENT_SCHEMA || null
    } else if (dbKind === 'postgres') {
      const result = await dbClient.execSQL("SELECT current_schema()")
      return result?.[0]?.current_schema || null
    }
  } catch (error) {
    baseLite.debug(`Error getting current schema: ${error.message}`)
  }
  return null
}

/**
 * Format qualified table name (schema.table)
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
