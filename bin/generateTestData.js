// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'generateTestData'
export const aliases = ['testdata', 'gendata', 'generateData']
export const describe = baseLite.bundle.getText("generateTestData")

const generateTestDataOptions = {
  table: {
    alias: ['t'],
    type: 'string',
    desc: baseLite.bundle.getText("generateTestDataTable")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    desc: baseLite.bundle.getText("generateTestDataSchema")
  },
  rows: {
    alias: ['r'],
    type: 'number',
    default: 100,
    desc: baseLite.bundle.getText("generateTestDataRows")
  },
  locale: {
    alias: ['l'],
    type: 'string',
    default: 'en',
    desc: baseLite.bundle.getText("generateTestDataLocale")
  },
  seed: {
    alias: ['sd'],
    type: 'number',
    desc: baseLite.bundle.getText("generateTestDataSeed")
  },
  format: {
    alias: ['f'],
    choices: ["sql", "csv", "json"],
    default: "sql",
    type: 'string',
    desc: baseLite.bundle.getText("generateTestDataFormat")
  },
  output: {
    alias: ['o'],
    type: 'string',
    desc: baseLite.bundle.getText("generateTestDataOutput")
  },
  realistic: {
    alias: ['x'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("generateTestDataRealistic")
  },
  includeRelations: {
    alias: ['rel'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("generateTestDataIncludeRelations")
  },
  dryRun: {
    alias: ['dr'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("generateTestDataDryRun")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
}

export const builder = (yargs) => yargs.options(baseLite.getBuilder(generateTestDataOptions)).wrap(160).example(
  'hana-cli generateTestData --table myTable --rows 100 --format sql',
  baseLite.bundle.getText("generateTestDataExample")
).epilog(buildDocEpilogue('generateTestData', 'developer-tools', ['codeTemplate', 'import', 'dataProfile']))

export const generateTestDataBuilderOptions = baseLite.getBuilder(generateTestDataOptions)

export const inputPrompts = {
  table: {
    description: baseLite.bundle.getText("generateTestDataTable"),
    type: 'string',
    required: true
  },
  schema: {
    description: baseLite.bundle.getText("generateTestDataSchema"),
    type: 'string',
    required: false,
    ask: () => false
  },
  rows: {
    description: baseLite.bundle.getText("generateTestDataRows"),
    type: 'number',
    required: false,
    ask: () => false
  },
  locale: {
    description: baseLite.bundle.getText("generateTestDataLocale"),
    type: 'string',
    required: false,
    ask: () => false
  },
  format: {
    description: baseLite.bundle.getText("generateTestDataFormat"),
    type: 'string',
    required: false,
    ask: () => false
  },
  output: {
    description: baseLite.bundle.getText("generateTestDataOutput"),
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
  base.promptHandler(argv, generateTestDataMain, inputPrompts, true, true, generateTestDataBuilderOptions)
}

/**
 * Generate realistic test data for database tables
 * @param {object} prompts - User prompts
 * @returns {Promise<void>}
 */
export async function generateTestDataMain(prompts) {
  const base = await import('../utils/base.js')

  try {
    base.setPrompts(prompts)

    // Connect to database
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()

    const dbKind = (dbClient.getKind() || 'hana').toLowerCase()

    // Get schema if not provided
    let schema = prompts.schema
    if (!schema && dbKind !== 'sqlite') {
      const currentSchema = await getCurrentSchema(dbClient, dbKind)
      schema = currentSchema || 'PUBLIC'
    }

    const table = prompts.table
    if (!table) {
      throw new Error(baseLite.bundle.getText("errTableNotFound", [table]))
    }



    // Get table structure
    const tableColumns = await getTableStructure(dbClient, schema, table, dbKind)

    // Generate test data
    const testData = await generateTestDataRows(
      tableColumns,
      prompts.rows,
      prompts.locale,
      prompts.seed,
      prompts.realistic
    )

    // Generate output in requested format
    let output = ''
    if (prompts.format === 'sql') {
      output = generateSQLInserts(schema, table, tableColumns, testData)
    } else if (prompts.format === 'csv') {
      output = generateCSVOutput(tableColumns, testData)
    } else if (prompts.format === 'json') {
      output = JSON.stringify(testData, null, 2)
    }

    // Output results
    if (prompts.output) {
      const fs = await import('fs')
      await fs.promises.writeFile(prompts.output, output, 'utf-8')
      console.log(baseLite.bundle.getText("success.testDataWritten", [prompts.output]))
    } else {
      console.log(output)
    }

    if (prompts.dryRun) {
      console.log(baseLite.bundle.getText("info.dryRunMode"))
    } else {
      console.log(baseLite.bundle.getText("success.testDataGenerated", [prompts.rows, table]))
    }

    await dbClient.disconnect()

  } catch (error) {
    console.error(baseLite.bundle.getText("error.generateTestData", [error.message]))
    process.exit(1)
  }
}

/**
 * Get current schema - helper function
 * @param {object} dbClient - Database client
 * @param {string} dbKind - Database kind
 * @returns {Promise<string>}
 */
async function getCurrentSchema(dbClient, dbKind) {
  const base = await import('../utils/base.js')
  if (dbKind === 'hana') {
    const result = await dbClient.execSQL('SELECT CURRENT_SCHEMA FROM DUMMY')
    return result?.[0]?.CURRENT_SCHEMA || 'PUBLIC'
  }
  return 'public'
}

/**
 * Get table structure with column definitions
 * @param {object} dbClient - Database client
 * @param {string} schema - Schema name
 * @param {string} table - Table name
 * @param {string} dbKind - Database kind
 * @returns {Promise<Array>}
 */
async function getTableStructure(dbClient, schema, table, dbKind) {
  const base = await import('../utils/base.js')
  const query = dbKind === 'hana' 
    ? `SELECT COLUMN_NAME, DATA_TYPE_NAME, IS_NULLABLE, COLUMN_NAME FROM TABLE_COLUMNS WHERE SCHEMA_NAME = '${schema}' AND TABLE_NAME = '${table}'`
    : `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = '${schema}' AND table_name = '${table}'`
  
  return await dbClient.execSQL(query)
}

/**
 * Generate realistic test data rows based on column types
 * @param {Array} columns - Table columns
 * @param {number} rowCount - Number of rows to generate
 * @param {string} locale - Locale for data generation
 * @param {number} seed - Random seed
 * @param {boolean} realistic - Generate realistic data
 * @returns {Promise<Array>}
 */
async function generateTestDataRows(columns, rowCount, locale, seed, realistic) {
  const rows = []
  
  // Set random seed for basic seeding
  if (seed !== undefined) {
    // Simple linear congruential generator for seeding
    let state = seed
    const originalRandom = Math.random
    Math.random = () => {
      state = (state * 9301 + 49297) % 233280
      return state / 233280
    }
  }

  for (let i = 0; i < rowCount; i++) {
    const row = {}
    
    for (const col of columns) {
      row[col.COLUMN_NAME] = generateColumnValue(col, i, locale, realistic)
    }
    
    rows.push(row)
  }

  return rows
}

/**
 * Generate value for a specific column based on its data type
 * @param {object} column - Column definition
 * @param {number} index - Row index
 * @param {string} locale - Locale
 * @param {boolean} realistic - Use realistic data
 * @returns {any}
 */
function generateColumnValue(column, index, locale, realistic) {
  const dataType = (column.DATA_TYPE_NAME || column.data_type || '').toUpperCase()

  if (dataType.includes('VARCHAR') || dataType.includes('NVARCHAR') || dataType.includes('TEXT')) {
    if (realistic) {
      const adjectives = ['quick', 'lazy', 'happy', 'sad', 'bright', 'dark']
      const nouns = ['fox', 'dog', 'cat', 'bird', 'fish', 'elephant']
      return `${adjectives[index % adjectives.length]}_${nouns[index % nouns.length]}_${index}`
    }
    return `value_${index}`
  } else if (dataType.includes('INT') || dataType.includes('DECIMAL') || dataType.includes('NUMERIC')) {
    return Math.floor(Math.random() * 10000) + index
  } else if (dataType.includes('FLOAT') || dataType.includes('DOUBLE')) {
    return Math.random() * 1000 + index
  } else if (dataType.includes('DATE') || dataType.includes('TIMESTAMP')) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 365))
    return date.toISOString().split('T')[0]
  } else if (dataType.includes('BOOLEAN') || dataType === 'BIT') {
    return index % 2 === 0 ? true : false
  }

  return null
}

/**
 * Generate SQL INSERT statements
 * @param {string} schema - Schema name
 * @param {string} table - Table name
 * @param {Array} columns - Column definitions
 * @param {Array} rows - Data rows
 * @returns {string}
 */
function generateSQLInserts(schema, table, columns, rows) {
  let sql = `-- Generated test data for ${schema}.${table}\n`
  sql += `-- Total rows: ${rows.length}\n\n`

  for (const row of rows) {
    const cols = Object.keys(row).join(', ')
    const vals = Object.values(row).map(v => 
      v === null ? 'NULL' : 
      typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : 
      v
    ).join(', ')
    
    sql += `INSERT INTO ${schema}.${table} (${cols}) VALUES (${vals});\n`
  }

  return sql
}

/**
 * Generate CSV output
 * @param {Array} columns - Column definitions
 * @param {Array} rows - Data rows
 * @returns {string}
 */
function generateCSVOutput(columns, rows) {
  const header = columns.map(c => c.COLUMN_NAME || c.column_name).join(',')
  const data = rows.map(row => 
    Object.values(row).map(v => 
      v === null ? '' : 
      typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : 
      v
    ).join(',')
  ).join('\n')

  return `${header}\n${data}`
}

export default { command, aliases, describe, builder, handler }
