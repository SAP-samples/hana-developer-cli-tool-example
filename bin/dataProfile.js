// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'dataProfile'
export const aliases = ['prof', 'profileData', 'dataStats']
export const describe = baseLite.bundle.getText("dataProfile")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  table: {
    alias: ['t'],
    type: 'string',
    desc: baseLite.bundle.getText("dataProfileTable")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("dataProfileSchema")
  },
  columns: {
    alias: ['c'],
    type: 'string',
    desc: baseLite.bundle.getText("dataProfileColumns")
  },
  output: {
    alias: ['o'],
    type: 'string',
    desc: baseLite.bundle.getText("dataProfileOutput")
  },
  format: {
    alias: ['f'],
    choices: ["json", "csv", "summary"],
    default: "summary",
    type: 'string',
    desc: baseLite.bundle.getText("dataProfileFormat")
  },
  nullAnalysis: {
    alias: ['na'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("dataProfileNullAnalysis")
  },
  cardinalityAnalysis: {
    alias: ['ca'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("dataProfileCardinalityAnalysis")
  },
  statisticalAnalysis: {
    alias: ['sa'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("dataProfileStatisticalAnalysis")
  },
  patternAnalysis: {
    alias: ['pa'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("dataProfilePatternAnalysis")
  },
  sampleSize: {
    alias: ['ss'],
    type: 'number',
    default: 10000,
    desc: baseLite.bundle.getText("dataProfileSampleSize")
  },
  timeout: {
    alias: ['to'],
    type: 'number',
    default: 3600,
    desc: baseLite.bundle.getText("dataProfileTimeout")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})).wrap(160).example(
  'hana-cli dataProfile --table myTable --format summary',
  baseLite.bundle.getText("dataProfileExample")
).epilog(buildDocEpilogue('dataProfile', 'data-tools', ['dataValidator', 'duplicateDetection']))

export let inputPrompts = {
  table: {
    description: baseLite.bundle.getText("dataProfileTable"),
    type: 'string',
    required: true
  },
  schema: {
    description: baseLite.bundle.getText("dataProfileSchema"),
    type: 'string',
    required: false
  },
  columns: {
    description: baseLite.bundle.getText("dataProfileColumns"),
    type: 'string',
    required: false,
    ask: () => false
  },
  output: {
    description: baseLite.bundle.getText("dataProfileOutput"),
    type: 'string',
    required: false,
    ask: () => false
  },
  format: {
    description: baseLite.bundle.getText("dataProfileFormat"),
    type: 'string',
    required: false,
    ask: () => false
  },
  nullAnalysis: {
    description: baseLite.bundle.getText("dataProfileNullAnalysis"),
    type: 'boolean',
    required: false,
    ask: () => false
  },
  cardinalityAnalysis: {
    description: baseLite.bundle.getText("dataProfileCardinalityAnalysis"),
    type: 'boolean',
    required: false,
    ask: () => false
  },
  statisticalAnalysis: {
    description: baseLite.bundle.getText("dataProfileStatisticalAnalysis"),
    type: 'boolean',
    required: false,
    ask: () => false
  },
  patternAnalysis: {
    description: baseLite.bundle.getText("dataProfilePatternAnalysis"),
    type: 'boolean',
    required: false,
    ask: () => false
  },
  sampleSize: {
    description: baseLite.bundle.getText("dataProfileSampleSize"),
    type: 'number',
    required: false,
    ask: () => false
  },
  timeout: {
    description: baseLite.bundle.getText("dataProfileTimeout"),
    type: 'number',
    required: false,
    ask: () => false
  },
  profile: {
    description: baseLite.bundle.getText("profile"),
    type: 'string',
    required: false,
    ask: () => { }
  },
  debug: {
    description: baseLite.bundle.getText("debug"),
    type: 'boolean',
    required: false,
    ask: () => false
  },
  disableVerbose: {
    description: baseLite.bundle.getText("disableVerbose"),
    type: 'boolean',
    required: false,
    ask: () => false
  },
  admin: {
    description: baseLite.bundle.getText("admin"),
    type: 'boolean',
    required: false,
    ask: () => false
  },
  conn: {
    description: baseLite.bundle.getText("connFile"),
    type: 'string',
    required: false,
    ask: () => false
  }
}

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
  await base.promptHandler(argv, dataProfileMain, inputPrompts, true, false)
}

/**
 * Generate data quality metrics and statistics
 * @param {object} prompts - User prompts
 * @returns {Promise<void>}
 */
export async function dataProfileMain(prompts) {
  const base = await import('../utils/base.js')

  let dbClient = null
  let timeoutHandle = null

  try {
    base.setPrompts(prompts)
    base.debug('dataProfileMain')

    // Set operation timeout
    timeoutHandle = prompts.timeout > 0
      ? setTimeout(() => process.exit(1), prompts.timeout * 1000)
      : null

    // Connect to database
    dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()

    const dbKind = (dbClient.getKind() || 'hana').toLowerCase()

    // Get schema if not provided
    let schema = prompts.schema
    // Handle the **CURRENT_SCHEMA** placeholder
    if (!schema || schema === '**CURRENT_SCHEMA**') {
      if (dbKind !== 'sqlite') {
        schema = await getCurrentSchema(dbClient, dbKind)
      }
    }

    const table = prompts.table
    if (!table) {
      throw new Error(`Table not found: ${table}`)
    }

    console.log(`Starting data profile analysis for table: ${table}`)

    // Get table columns
    const columns = await getTableColumns(dbClient, schema, table, dbKind)

    // Filter columns if specified
    let profileColumns = columns
    if (prompts.columns) {
      const selected = prompts.columns.split(',').map(c => c.trim()).filter(c => c)
      profileColumns = columns.filter(c => selected.includes(c))
    }

    // Generate profile
    const profile = await generateDataProfile(
      dbClient,
      schema,
      table,
      profileColumns,
      prompts,
      dbKind
    )

    // Output results
    // Check if output value is actually a format type (json, csv, summary)
    const formatTypes = ['json', 'csv', 'summary']
    if (prompts.output && formatTypes.includes(prompts.output.toLowerCase())) {
      // User specified format using --output instead of --format
      displayProfile(profile, prompts.output.toLowerCase())
    } else if (prompts.output) {
      // User specified a file path for output
      await outputProfile(prompts.output, profile, prompts.format)
    } else {
      // No file specified, display to console with specified format
      displayProfile(profile, prompts.format)
    }

    console.log(`Data profile complete for table ${table}. Rows: ${profile.rowCount}, Columns: ${profile.columnCount}`)

    await dbClient.disconnect()
    if (timeoutHandle) clearTimeout(timeoutHandle)

  } catch (error) {
    const errorMsg = `Data profile error: ${error.message}`
    console.error(errorMsg)
    base.debug(error)
    if (timeoutHandle) clearTimeout(timeoutHandle)
    if (dbClient) {
      try {
        await dbClient.disconnect()
      } catch (e) {
        // Ignore disconnect errors
      }
    }
    process.exit(1)
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
 * Generate data profile for table
 * @param {object} dbClient - Database client
 * @param {string|null} schema - Schema name
 * @param {string} table - Table name
 * @param {Array<string>} columns - Columns to profile
 * @param {object} options - Profiling options
 * @param {string} dbKind - Database kind
 * @returns {Promise<object>}
 */
async function generateDataProfile(dbClient, schema, table, columns, options, dbKind) {
  const profile = {
    table,
    schema: schema || 'N/A',
    rowCount: 0,
    columnCount: columns.length,
    columns: {},
    metadata: {
      profiledAt: new Date().toISOString(),
      nullAnalysis: options.nullAnalysis,
      cardinalityAnalysis: options.cardinalityAnalysis,
      statisticalAnalysis: options.statisticalAnalysis
    }
  }

  try {
    // Get row count
    const tableName = formatQualifiedName(schema, table)
    const countQuery = `SELECT COUNT(*) as COUNT FROM ${tableName}`
    const countResult = await dbClient.execSQL(countQuery)
    profile.rowCount = countResult[0]?.COUNT || 0

    // Profile each column
    for (const column of columns) {
      profile.columns[column] = await profileColumn(
        dbClient,
        schema,
        table,
        column,
        options,
        dbKind
      )
    }

  } catch (error) {
    baseLite.debug(`Error generating profile: ${error.message}`)
    throw error
  }

  return profile
}

/**
 * Profile individual column
 * @param {object} dbClient - Database client
 * @param {string|null} schema - Schema name
 * @param {string} table - Table name
 * @param {string} column - Column name
 * @param {object} options - Profiling options
 * @param {string} dbKind - Database kind
 * @returns {Promise<object>}
 */
async function profileColumn(dbClient, schema, table, column, options, dbKind) {
  const profile = {
    name: column,
    type: 'UNKNOWN'
  }

  try {
    const tableName = formatQualifiedName(schema, table)
    const colQuoted = `"${column}"`

    // NULL analysis
    if (options.nullAnalysis) {
      const nullQuery = `SELECT COUNT(*) as NULL_COUNT FROM ${tableName} WHERE ${colQuoted} IS NULL`
      const result = await dbClient.execSQL(nullQuery)
      profile.nullCount = result[0]?.NULL_COUNT || 0
      profile.nullPercentage = (profile.nullCount / (options.rowCount || 1)) * 100
    }

    // Cardinality analysis
    if (options.cardinalityAnalysis) {
      const cardQuery = `SELECT COUNT(DISTINCT ${colQuoted}) as DISTINCT_COUNT FROM ${tableName}`
      const result = await dbClient.execSQL(cardQuery)
      profile.distinctCount = result[0]?.DISTINCT_COUNT || 0
    }

    // Statistical analysis
    if (options.statisticalAnalysis) {
      const statsQuery = `SELECT 
                            MIN(${colQuoted}) as MIN_VALUE,
                            MAX(${colQuoted}) as MAX_VALUE,
                            AVG(CAST(${colQuoted} AS NUMERIC)) as AVG_VALUE
                          FROM ${tableName} WHERE ${colQuoted} IS NOT NULL`
      try {
        const result = await dbClient.execSQL(statsQuery)
        if (result && result[0]) {
          profile.minValue = result[0].MIN_VALUE
          profile.maxValue = result[0].MAX_VALUE
          profile.avgValue = result[0].AVG_VALUE
        }
      } catch (error) {
        baseLite.debug(`Statistical analysis not available for column: ${column}`)
      }
    }

    // Length analysis for string columns
    if (options.patternAnalysis) {
      const lenQuery = `SELECT 
                          MIN(LENGTH(CAST(${colQuoted} AS VARCHAR))) as MIN_LEN,
                          MAX(LENGTH(CAST(${colQuoted} AS VARCHAR))) as MAX_LEN,
                          AVG(LENGTH(CAST(${colQuoted} AS VARCHAR))) as AVG_LEN
                        FROM ${tableName} WHERE ${colQuoted} IS NOT NULL`
      try {
        const result = await dbClient.execSQL(lenQuery)
        if (result && result[0]) {
          profile.minLength = result[0].MIN_LEN
          profile.maxLength = result[0].MAX_LEN
          profile.avgLength = result[0].AVG_LEN
        }
      } catch (error) {
        baseLite.debug(`Pattern analysis not available for column: ${column}`)
      }
    }

    // Get top values
    const topQuery = `SELECT ${colQuoted} as VALUE, COUNT(*) as COUNT FROM ${tableName} 
                      WHERE ${colQuoted} IS NOT NULL 
                      GROUP BY ${colQuoted} 
                      ORDER BY COUNT DESC LIMIT 5`
    try {
      const result = await dbClient.execSQL(topQuery)
      profile.topValues = result.map(r => ({
        value: r.VALUE,
        count: r.COUNT
      }))
    } catch (error) {
      baseLite.debug(`Top values analysis not available for column: ${column}`)
      profile.topValues = []
    }

  } catch (error) {
    baseLite.debug(`Error profiling column ${column}: ${error.message}`)
  }

  return profile
}

/**
 * Display profile in console
 * @param {object} profile - Profile data
 * @param {string} format - Display format
 * @returns {void}
 */
function displayProfile(profile, format = 'summary') {
  if (format === 'summary') {
    console.log(`\n${baseLite.colors.cyan('Table Data Profile')}\n`)
    console.log(`Table: ${profile.table}`)
    console.log(`Schema: ${profile.schema}`)
    console.log(`Rows: ${profile.rowCount}`)
    console.log(`Columns: ${profile.columnCount}`)

    console.log(`\n${baseLite.colors.green('Column Profiles:')}`)
    for (const [colName, colProfile] of Object.entries(profile.columns)) {
      console.log(`\n  ${colName}:`)
      console.log(`    Null Count: ${colProfile.nullCount || 0}`)
      console.log(`    Distinct: ${colProfile.distinctCount || 0}`)
      if (colProfile.minValue !== undefined) {
        console.log(`    Min: ${colProfile.minValue}`)
      }
      if (colProfile.maxValue !== undefined) {
        console.log(`    Max: ${colProfile.maxValue}`)
      }
      if (colProfile.topValues && colProfile.topValues.length > 0) {
        console.log(`    Top Values: ${colProfile.topValues.slice(0, 3).map(v => v.value).join(', ')}`)
      }
    }
  } else if (format === 'csv') {
    console.log('column,type,nullCount,distinctCount,minValue,maxValue')
    for (const [colName, colProfile] of Object.entries(profile.columns)) {
      console.log(`${colName},,${colProfile.nullCount || 0},${colProfile.distinctCount || 0},,`)
    }
  } else if (format === 'json') {
    console.log(JSON.stringify(profile, null, 2))
  }
}

/**
 * Output profile to file
 * @param {string} filePath - Output file path
 * @param {object} profile - Profile data
 * @param {string} format - Output format
 * @returns {Promise<void>}
 */
async function outputProfile(filePath, profile, format = 'json') {
  const fs = await import('fs')

  if (format === 'json') {
    await fs.promises.writeFile(filePath, JSON.stringify(profile, null, 2), 'utf8')
  } else if (format === 'csv') {
    let csv = 'column,nullCount,distinctCount,minValue,maxValue,topValues\n'
    for (const [colName, colProfile] of Object.entries(profile.columns)) {
      const topVals = colProfile.topValues ? colProfile.topValues.map(v => v.value).join(';') : ''
      csv += `${colName},${colProfile.nullCount || 0},${colProfile.distinctCount || 0},,,"${topVals}"\n`
    }
    await fs.promises.writeFile(filePath, csv, 'utf8')
  } else {
    await fs.promises.writeFile(filePath, JSON.stringify(profile, null, 2), 'utf8')
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
