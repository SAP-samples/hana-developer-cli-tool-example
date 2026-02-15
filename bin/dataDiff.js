// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"

export const command = 'dataDiff'
export const aliases = ['ddiff', 'diffData', 'dataCompare']
export const describe = baseLite.bundle.getText("dataDiff")

export const builder = baseLite.getBuilder({
  table1: {
    alias: ['t1', 'Table1'],
    type: 'string',
    desc: baseLite.bundle.getText("dataDiffTable1")
  },
  table2: {
    alias: ['t2', 'Table2'],
    type: 'string',
    desc: baseLite.bundle.getText("dataDiffTable2")
  },
  schema1: {
    alias: ['s1', 'Schema1'],
    type: 'string',
    desc: baseLite.bundle.getText("dataDiffSchema1")
  },
  schema2: {
    alias: ['s2', 'Schema2'],
    type: 'string',
    desc: baseLite.bundle.getText("dataDiffSchema2")
  },
  keyColumns: {
    alias: ['k', 'KeyColumns'],
    type: 'string',
    desc: baseLite.bundle.getText("dataDiffKeyColumns")
  },
  compareColumns: {
    alias: ['c', 'CompareColumns'],
    type: 'string',
    desc: baseLite.bundle.getText("dataDiffCompareColumns")
  },
  output: {
    alias: ['o', 'Output'],
    type: 'string',
    desc: baseLite.bundle.getText("dataDiffOutput")
  },
  format: {
    alias: ['f', 'Format'],
    choices: ["json", "csv", "summary"],
    default: "summary",
    type: 'string',
    desc: baseLite.bundle.getText("dataDiffFormat")
  },
  limit: {
    alias: ['l', 'Limit'],
    type: 'number',
    default: 10000,
    desc: baseLite.bundle.getText("dataDiffLimit")
  },
  showValues: {
    alias: ['sv', 'ShowValues'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("dataDiffShowValues")
  },
  timeout: {
    alias: ['to', 'Timeout'],
    type: 'number',
    default: 3600,
    desc: baseLite.bundle.getText("dataDiffTimeout")
  },
  profile: {
    alias: ['p', 'Profile'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})

export let inputPrompts = {
  table1: {
    description: baseLite.bundle.getText("dataDiffTable1"),
    type: 'string',
    required: true
  },
  table2: {
    description: baseLite.bundle.getText("dataDiffTable2"),
    type: 'string',
    required: true
  },
  schema1: {
    description: baseLite.bundle.getText("dataDiffSchema1"),
    type: 'string',
    required: false
  },
  schema2: {
    description: baseLite.bundle.getText("dataDiffSchema2"),
    type: 'string',
    required: false
  },
  keyColumns: {
    description: baseLite.bundle.getText("dataDiffKeyColumns"),
    type: 'string',
    required: true
  },
  compareColumns: {
    description: baseLite.bundle.getText("dataDiffCompareColumns"),
    type: 'string',
    required: false,
    ask: () => false
  },
  output: {
    description: baseLite.bundle.getText("dataDiffOutput"),
    type: 'string',
    required: false,
    ask: () => false
  },
  format: {
    description: baseLite.bundle.getText("dataDiffFormat"),
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
  base.promptHandler(argv, dataDiffMain, inputPrompts)
}

/**
 * Show differences between two datasets
 * @param {object} prompts - User prompts
 * @returns {Promise<void>}
 */
export async function dataDiffMain(prompts) {
  const base = await import('../utils/base.js')
  base.debug('dataDiffMain')

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
    let schema1 = prompts.schema1
    let schema2 = prompts.schema2

    if (!schema1 && dbKind !== 'sqlite') {
      schema1 = await getCurrentSchema(dbClient, dbKind)
    }

    if (!schema2 && dbKind !== 'sqlite') {
      schema2 = schema1
    }

    const table1 = prompts.table1
    const table2 = prompts.table2
    const keyColumns = prompts.keyColumns.split(',').map(c => c.trim()).filter(c => c)

    if (keyColumns.length === 0) {
      throw new Error(baseLite.bundle.getText("errNoKeyColumns"))
    }

    console.log(baseLite.bundle.getText("info.startingDataDiff", [table1, table2]))

    // Get columns
    const columns1 = await getTableColumns(dbClient, schema1, table1, dbKind)
    const columns2 = await getTableColumns(dbClient, schema2, table2, dbKind)

    // Determine columns to compare
    let compareColumns = columns1.filter(c => columns2.includes(c))
    if (prompts.compareColumns) {
      const selected = prompts.compareColumns.split(',').map(c => c.trim()).filter(c => c)
      compareColumns = compareColumns.filter(c => selected.includes(c))
    }

    // Perform diff
    const diffs = await performDataDiff(
      dbClient,
      schema1,
      table1,
      schema2,
      table2,
      keyColumns,
      compareColumns,
      prompts.limit,
      dbKind
    )

    // Output results
    if (prompts.output) {
      await outputDiffResults(prompts.output, diffs, prompts.format)
    } else {
      displayDiffResults(diffs, prompts.format, prompts.showValues)
    }

    console.log(baseLite.bundle.getText("success.dataDiffComplete", [
      diffs.identical,
      diffs.different,
      diffs.onlyInTable1.length,
      diffs.onlyInTable2.length
    ]))

    await dbClient.disconnect()
    if (timeoutHandle) clearTimeout(timeoutHandle)

  } catch (error) {
    console.error(baseLite.bundle.getText("error.dataDiff", [error.message]))
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
 * Perform data diff between two tables
 * @param {object} dbClient - Database client
 * @param {string|null} schema1 - Schema 1
 * @param {string} table1 - Table 1
 * @param {string|null} schema2 - Schema 2
 * @param {string} table2 - Table 2
 * @param {Array<string>} keyColumns - Key columns
 * @param {Array<string>} compareColumns - Columns to compare
 * @param {number} limit - Row limit
 * @param {string} dbKind - Database kind
 * @returns {Promise<object>}
 */
async function performDataDiff(dbClient, schema1, table1, schema2, table2, keyColumns, compareColumns, limit, dbKind) {
  const diffs = {
    identical: 0,
    different: 0,
    onlyInTable1: [],
    onlyInTable2: [],
    differences: []
  }

  try {
    // Get rows from both tables
    const keyList = keyColumns.map(k => `"${k}"`).join(',')
    const colList = [keyList, ...compareColumns.map(c => `"${c}"`)].join(',')

    const table1Name = formatQualifiedName(schema1, table1)
    const table2Name = formatQualifiedName(schema2, table2)

    const query1 = `SELECT ${colList} FROM ${table1Name} LIMIT ${limit}`
    const query2 = `SELECT ${colList} FROM ${table2Name} LIMIT ${limit}`

    const rows1 = await dbClient.execSQL(query1)
    const rows2 = await dbClient.execSQL(query2)

    // Build maps
    const map1 = new Map()
    for (const row of rows1) {
      const keyValue = keyColumns.map(k => row[k]).join('|')
      map1.set(keyValue, row)
    }

    const map2 = new Map()
    for (const row of rows2) {
      const keyValue = keyColumns.map(k => row[k]).join('|')
      map2.set(keyValue, row)
    }

    // Compare
    for (const [keyValue, row1] of map1) {
      if (map2.has(keyValue)) {
        const row2 = map2.get(keyValue)
        const diffs_list = []

        for (const col of compareColumns) {
          if (JSON.stringify(row1[col]) !== JSON.stringify(row2[col])) {
            diffs_list.push({
              column: col,
              table1Value: row1[col],
              table2Value: row2[col]
            })
          }
        }

        if (diffs_list.length > 0) {
          diffs.different++
          diffs.differences.push({
            key: keyValue,
            changes: diffs_list
          })
        } else {
          diffs.identical++
        }

        map2.delete(keyValue)
      } else {
        diffs.onlyInTable1.push({
          key: keyValue,
          row: row1
        })
      }
    }

    // Remaining in map2
    for (const [keyValue, row] of map2) {
      diffs.onlyInTable2.push({
        key: keyValue,
        row: row
      })
    }

  } catch (error) {
    baseLite.debug(`Error performing data diff: ${error.message}`)
    throw error
  }

  return diffs
}

/**
 * Display diff results
 * @param {object} diffs - Diff results
 * @param {string} format - Display format
 * @param {boolean} showValues - Whether to show values
 * @returns {void}
 */
function displayDiffResults(diffs, format = 'summary', showValues = false) {
  if (format === 'summary') {
    console.log(`\n${baseLite.colors.green('Identical:')} ${diffs.identical}`)
    console.log(`${baseLite.colors.yellow('Different:')} ${diffs.different}`)
    console.log(`${baseLite.colors.red('Only in Table 1:')} ${diffs.onlyInTable1.length}`)
    console.log(`${baseLite.colors.cyan('Only in Table 2:')} ${diffs.onlyInTable2.length}`)

    if (diffs.different > 0 && showValues) {
      console.log(`\n${baseLite.colors.yellow('First 5 differences:')}`)
      diffs.differences.slice(0, 5).forEach(diff => {
        console.log(`  Key: ${diff.key}`)
        diff.changes.forEach(c => {
          console.log(`    ${c.column}: ${c.table1Value} -> ${c.table2Value}`)
        })
      })
    }
  } else if (format === 'csv') {
    console.log('type,key,column,table1Value,table2Value')
    diffs.differences.forEach(diff => {
      diff.changes.forEach(c => {
        console.log(`difference,${diff.key},${c.column},"${c.table1Value}","${c.table2Value}"`)
      })
    })
    diffs.onlyInTable1.forEach(item => {
      console.log(`onlyInTable1,${item.key},,`)
    })
    diffs.onlyInTable2.forEach(item => {
      console.log(`onlyInTable2,${item.key},,`)
    })
  } else if (format === 'json') {
    console.log(JSON.stringify(diffs, null, 2))
  }
}

/**
 * Output diff results to file
 * @param {string} filePath - Output file path
 * @param {object} diffs - Diff results
 * @param {string} format - Output format
 * @returns {Promise<void>}
 */
async function outputDiffResults(filePath, diffs, format = 'json') {
  const fs = await import('fs')

  if (format === 'json') {
    await fs.promises.writeFile(filePath, JSON.stringify(diffs, null, 2), 'utf8')
  } else if (format === 'csv') {
    let csv = 'type,key,column,table1Value,table2Value\n'
    diffs.differences.forEach(diff => {
      diff.changes.forEach(c => {
        csv += `difference,${diff.key},${c.column},"${c.table1Value}","${c.table2Value}"\n`
      })
    })
    diffs.onlyInTable1.forEach(item => {
      csv += `onlyInTable1,${item.key},,\n`
    })
    diffs.onlyInTable2.forEach(item => {
      csv += `onlyInTable2,${item.key},,\n`
    })
    await fs.promises.writeFile(filePath, csv, 'utf8')
  } else {
    await fs.promises.writeFile(filePath, JSON.stringify(diffs, null, 2), 'utf8')
  }
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
