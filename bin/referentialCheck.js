// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"

export const command = 'referentialCheck'
export const aliases = ['refcheck', 'checkReferential', 'fkcheck']
export const describe = baseLite.bundle.getText("referentialCheck")

export const builder = baseLite.getBuilder({
  table: {
    alias: ['t'],
    type: 'string',
    desc: baseLite.bundle.getText("referentialCheckTable")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("referentialCheckSchema")
  },
  constraints: {
    alias: ['c'],
    type: 'string',
    desc: baseLite.bundle.getText("referentialCheckConstraints")
  },
  mode: {
    alias: ['m'],
    choices: ["check", "report", "repair", "detailed"],
    default: "check",
    type: 'string',
    desc: baseLite.bundle.getText("referentialCheckMode")
  },
  output: {
    alias: ['o'],
    type: 'string',
    desc: baseLite.bundle.getText("referentialCheckOutput")
  },
  format: {
    alias: ['f'],
    choices: ["json", "csv", "summary"],
    default: "summary",
    type: 'string',
    desc: baseLite.bundle.getText("referentialCheckFormat")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 10000,
    desc: baseLite.bundle.getText("referentialCheckLimit")
  },
  timeout: {
    alias: ['to'],
    type: 'number',
    default: 3600,
    desc: baseLite.bundle.getText("referentialCheckTimeout")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})

export let inputPrompts = {
  table: {
    description: baseLite.bundle.getText("referentialCheckTable"),
    type: 'string',
    required: true
  },
  schema: {
    description: baseLite.bundle.getText("referentialCheckSchema"),
    type: 'string',
    required: false
  },
  constraints: {
    description: baseLite.bundle.getText("referentialCheckConstraints"),
    type: 'string',
    required: false,
    ask: () => false
  },
  mode: {
    description: baseLite.bundle.getText("referentialCheckMode"),
    type: 'string',
    required: false,
    ask: () => false
  },
  output: {
    description: baseLite.bundle.getText("referentialCheckOutput"),
    type: 'string',
    required: false,
    ask: () => false
  },
  format: {
    description: baseLite.bundle.getText("referentialCheckFormat"),
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
  base.promptHandler(argv, referentialCheckMain, inputPrompts)
}

/**
 * Verify referential integrity
 * @param {object} prompts - User prompts
 * @returns {Promise<void>}
 */
export async function referentialCheckMain(prompts) {
  const base = await import('../utils/base.js')
  base.debug('referentialCheckMain')

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

    console.log(baseLite.bundle.getText("info.startingReferentialCheck", [table]))

    // Get foreign keys
    const foreignKeys = await getForeignKeys(dbClient, schema, table, dbKind)

    if (foreignKeys.length === 0) {
      console.log(baseLite.bundle.getText("info.noForeignKeys", [table]))
      await dbClient.disconnect()
      if (timeoutHandle) clearTimeout(timeoutHandle)
      return
    }

    // Check referential integrity
    const results = await checkReferentialIntegrity(
      dbClient,
      schema,
      table,
      foreignKeys,
      prompts.limit,
      dbKind,
      prompts.mode
    )

    // Output results
    if (prompts.output) {
      await outputResults(prompts.output, results, prompts.format)
    } else {
      displayResults(results, prompts.format)
    }

    console.log(baseLite.bundle.getText("success.referentialCheckComplete", [
      results.totalForeignKeys,
      results.validConstraints,
      results.violatedConstraints,
      results.totalOrphanedRecords
    ]))

    await dbClient.disconnect()
    if (timeoutHandle) clearTimeout(timeoutHandle)

  } catch (error) {
    console.error(baseLite.bundle.getText("error.referentialCheck", [error.message]))
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
 * Get foreign keys for a table
 * @param {object} dbClient - Database client
 * @param {string|null} schema - Schema name
 * @param {string} table - Table name
 * @param {string} dbKind - Database kind
 * @returns {Promise<Array<object>>}
 */
async function getForeignKeys(dbClient, schema, table, dbKind) {
  const foreignKeys = []

  if (dbKind === 'hana') {
    const query = `
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_SCHEMA_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM SYS.REFERENTIAL_CONSTRAINTS
      WHERE SCHEMA_NAME = ? AND TABLE_NAME = ?
    `
    try {
      const results = await dbClient.execSQL(query, [schema || 'PUBLIC', table.toUpperCase()])
      return results.map(r => ({
        constraintName: r.CONSTRAINT_NAME,
        column: r.COLUMN_NAME,
        refSchema: r.REFERENCED_SCHEMA_NAME,
        refTable: r.REFERENCED_TABLE_NAME,
        refColumn: r.REFERENCED_COLUMN_NAME
      }))
    } catch (err) {
      baseLite.debug(`Error getting foreign keys: ${err.message}`)
      return []
    }
  } else if (dbKind === 'postgres') {
    const query = `
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_schema AS referenced_schema,
        ccu.table_name AS referenced_table,
        ccu.column_name AS referenced_column
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = ?
        AND tc.table_name = ?
    `
    try {
      const results = await dbClient.execSQL(query, [schema || 'public', table.toLowerCase()])
      return results.map(r => ({
        constraintName: r.constraint_name,
        column: r.column_name,
        refSchema: r.referenced_schema,
        refTable: r.referenced_table,
        refColumn: r.referenced_column
      }))
    } catch (err) {
      baseLite.debug(`Error getting foreign keys: ${err.message}`)
      return []
    }
  }

  return foreignKeys
}

/**
 * Check referential integrity
 * @param {object} dbClient - Database client
 * @param {string|null} schema - Schema name
 * @param {string} table - Table name
 * @param {Array<object>} foreignKeys - Foreign keys
 * @param {number} limit - Row limit
 * @param {string} dbKind - Database kind
 * @param {string} mode - Check mode
 * @returns {Promise<object>}
 */
async function checkReferentialIntegrity(dbClient, schema, table, foreignKeys, limit, dbKind, mode) {
  const results = {
    totalForeignKeys: foreignKeys.length,
    validConstraints: 0,
    violatedConstraints: 0,
    totalOrphanedRecords: 0,
    violations: [],
    details: []
  }

  for (const fk of foreignKeys) {
    try {
      // Query to find orphaned records
      const colName = fk.column
      const refSchema = fk.refSchema
      const refTable = fk.refTable
      const refCol = fk.refColumn

      const tableName = formatQualifiedName(schema, table)
      const refTableName = formatQualifiedName(refSchema, refTable)

      let query = `
        SELECT t."${colName}", COUNT(*) as count
        FROM ${tableName} t
        LEFT JOIN ${refTableName} r ON t."${colName}" = r."${refCol}"
        WHERE t."${colName}" IS NOT NULL
          AND r."${refCol}" IS NULL
        GROUP BY t."${colName}"
      `

      if (limit > 0) {
        query += ` LIMIT ${limit}`
      }

      const orphaned = await dbClient.execSQL(query)

      if (orphaned && orphaned.length > 0) {
        results.violatedConstraints++
        results.totalOrphanedRecords += orphaned.reduce((sum, row) => sum + (row.count || 1), 0)

        results.violations.push({
          constraintName: fk.constraintName,
          column: fk.column,
          referencesTable: refTable,
          orphanedRecords: orphaned,
          status: 'VIOLATED'
        })

        if (mode === 'repair') {
          // In repair mode, could delete or flag orphaned records
          baseLite.debug(`Repair mode: Would handle orphaned records for ${fk.constraintName}`)
        }
      } else {
        results.validConstraints++
        results.details.push({
          constraintName: fk.constraintName,
          column: fk.column,
          referencesTable: refTable,
          status: 'OK'
        })
      }
    } catch (err) {
      baseLite.debug(`Error checking constraint ${fk.constraintName}: ${err.message}`)
      results.violations.push({
        constraintName: fk.constraintName,
        error: err.message,
        status: 'ERROR'
      })
    }
  }

  return results
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
 * Output results to file
 * @param {string} filePath - Output file path
 * @param {object} results - Check results
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
    content = 'Constraint,Column,RefTable,Status,OrphanedCount\n'
    for (const violation of results.violations) {
      const orphanCount = violation.orphanedRecords ? violation.orphanedRecords.reduce((sum, r) => sum + (r.count || 1), 0) : 0
      content += `"${violation.constraintName || 'N/A'}","${violation.column || 'N/A'}","${violation.referencesTable || 'N/A'}","${violation.status}","${orphanCount}"\n`
    }
  } else {
    content = formatSummaryReport(results)
  }

  await fs.writeFile(filePath, content)
}

/**
 * Format summary report
 * @param {object} results - Check results
 * @returns {string}
 */
function formatSummaryReport(results) {
  let report = 'Referential Integrity Check Report\n'
  report += '===================================\n\n'
  report += `Total Foreign Keys: ${results.totalForeignKeys}\n`
  report += `Valid Constraints:  ${results.validConstraints}\n`
  report += `Violated Constraints: ${results.violatedConstraints}\n`
  report += `Total Orphaned Records: ${results.totalOrphanedRecords}\n\n`

  if (results.violations.length > 0) {
    report += 'Violations:\n'
    for (const v of results.violations) {
      report += `  ${v.constraintName}: ${v.status}\n`
      if (v.error) {
        report += `    Error: ${v.error}\n`
      } else if (v.orphanedRecords) {
        report += `    Orphaned Records: ${v.orphanedRecords.length}\n`
      }
    }
  }

  return report
}

/**
 * Display results in console
 * @param {object} results - Check results
 * @param {string} format - Display format
 * @returns {void}
 */
function displayResults(results, format) {
  if (format === 'json') {
    console.log(JSON.stringify(results, null, 2))
  } else if (format === 'csv') {
    console.log('Constraint,Column,RefTable,Status,OrphanedCount')
    for (const violation of results.violations) {
      const orphanCount = violation.orphanedRecords ? violation.orphanedRecords.reduce((sum, r) => sum + (r.count || 1), 0) : 0
      console.log(`"${violation.constraintName || 'N/A'}","${violation.column || 'N/A'}","${violation.referencesTable || 'N/A'}","${violation.status}","${orphanCount}"`)
    }
  } else {
    console.log(formatSummaryReport(results))
  }
}
