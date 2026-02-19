// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"
import ExcelJS from 'exceljs'

export const command = 'export'
export const aliases = ['exp', 'downloadData', 'downloaddata']
export const describe = baseLite.bundle.getText("export")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  table: {
    alias: ['t'],
    type: 'string',
    desc: baseLite.bundle.getText("exportTable")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("exportSchema")
  },
  output: {
    alias: ['o'],
    type: 'string',
    desc: baseLite.bundle.getText("exportOutput")
  },
  format: {
    alias: ['f'],
    choices: ["csv", "excel", "json"],
    default: "csv",
    type: 'string',
    desc: baseLite.bundle.getText("exportFormat")
  },
  where: {
    alias: ['w'],
    type: 'string',
    desc: baseLite.bundle.getText("exportWhere")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    desc: baseLite.bundle.getText("exportLimit")
  },
  orderby: {
    alias: ['ob'],
    type: 'string',
    desc: baseLite.bundle.getText("exportOrderBy")
  },
  columns: {
    alias: ['c'],
    type: 'string',
    desc: baseLite.bundle.getText("exportColumns")
  },
  delimiter: {
    alias: ['d'],
    type: 'string',
    default: ',',
    desc: baseLite.bundle.getText("exportDelimiter")
  },
  includeHeaders: {
    alias: ['ih'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("exportIncludeHeaders")
  },
  nullValue: {
    alias: ['nv'],
    type: 'string',
    default: '',
    desc: baseLite.bundle.getText("exportNullValue")
  },
  maxRows: {
    alias: ['mr'],
    type: 'number',
    default: 1000000,
    desc: baseLite.bundle.getText("exportMaxRows")
  },
  timeout: {
    alias: ['to'],
    type: 'number',
    default: 3600,
    desc: baseLite.bundle.getText("exportTimeout")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})).example(
  'hana-cli export --table myTable --format csv',
  baseLite.bundle.getText("exportExample")
)

export let inputPrompts = {
  table: {
    description: baseLite.bundle.getText("exportTable"),
    type: 'string',
    required: true
  },
  schema: {
    description: baseLite.bundle.getText("exportSchema"),
    type: 'string',
    required: false
  },
  output: {
    description: baseLite.bundle.getText("exportOutput"),
    type: 'string',
    required: true
  },
  format: {
    description: baseLite.bundle.getText("exportFormat"),
    type: 'string',
    required: true
  },
  where: {
    description: baseLite.bundle.getText("exportWhere"),
    type: 'string',
    required: false,
    ask: () => false
  },
  limit: {
    description: baseLite.bundle.getText("exportLimit"),
    type: 'number',
    required: false,
    ask: () => false
  },
  orderby: {
    description: baseLite.bundle.getText("exportOrderBy"),
    type: 'string',
    required: false,
    ask: () => false
  },
  columns: {
    description: baseLite.bundle.getText("exportColumns"),
    type: 'string',
    required: false,
    ask: () => false
  },
  delimiter: {
    description: baseLite.bundle.getText("exportDelimiter"),
    type: 'string',
    required: false,
    ask: () => false
  },
  includeHeaders: {
    description: baseLite.bundle.getText("exportIncludeHeaders"),
    type: 'boolean',
    required: false,
    ask: () => false
  },
  nullValue: {
    description: baseLite.bundle.getText("exportNullValue"),
    type: 'string',
    required: false,
    ask: () => false
  },
  maxRows: {
    description: baseLite.bundle.getText("exportMaxRows"),
    type: 'number',
    required: false,
    default: 1000000,
    ask: () => false
  },
  timeout: {
    description: baseLite.bundle.getText("exportTimeout"),
    type: 'number',
    required: false,
    default: 3600,
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
  await base.promptHandler(argv, exportData, inputPrompts, true, false)
}

/**
 * Export data from table to file
 * @param {object} prompts - User prompts with table, output, and format options
 * @returns {Promise<void>}
 */
export async function exportData(prompts) {
  const base = await import('../utils/base.js')
  base.debug('exportData')

  let dbClient = null
  let timeoutHandle = null

  try {
    base.setPrompts(prompts)

    // Set operation timeout
    const abortController = new AbortController()
    timeoutHandle = prompts.timeout > 0
      ? setTimeout(() => abortController.abort(), prompts.timeout * 1000)
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
        if (!schema && dbKind === 'hana') {
          throw new Error('No schema specified')
        }
      }
    }

    const table = prompts.table
    if (!table) {
      throw new Error(`Table not found: ${table}`)
    }

    // Parse column list if provided
    let columnList = '*'
    if (prompts.columns && prompts.columns.trim()) {
      columnList = prompts.columns
    }

    // Build SELECT query
    let query = `SELECT ${columnList} FROM ${formatQualifiedName(schema, table)}`

    // Add WHERE clause if provided
    if (prompts.where && prompts.where.trim()) {
      query += ` WHERE ${prompts.where}`
    }

    // Add ORDER BY clause if provided
    if (prompts.orderby && prompts.orderby.trim()) {
      query += ` ORDER BY ${prompts.orderby}`
    }

    // Add LIMIT clause if provided or max rows
    const limit = prompts.limit || prompts.maxRows || 1000000
    if (limit > 0) {
      query += ` LIMIT ${limit}`
    }

    base.debug(`Export query: ${query}`)
    console.log(`Starting export for table: ${table}`)

    // Execute query
    const startTime = Date.now()
    const rows = await dbClient.execSQL(query)

    if (!rows || rows.length === 0) {
      console.log('No data to export')
      await dbClient.disconnect()
      if (timeoutHandle) clearTimeout(timeoutHandle)
      return
    }

    // Determine output filename if not provided
    let outputFile = prompts.output
    if (!outputFile) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const ext = prompts.format === 'excel' ? 'xlsx' : prompts.format === 'json' ? 'json' : 'csv'
      outputFile = `${table}_${timestamp}.${ext}`
    }

    base.debug(`Output file: ${outputFile}`)

    // Check if output file already exists and prompt for confirmation
    const fs = await import('fs')
    if (fs.existsSync(outputFile)) {
      console.log(`File ${outputFile} already exists.`)
      const confirmOverwrite = await promptForConfirmation('Do you want to overwrite it? (yes/no): ')
      if (!confirmOverwrite) {
        console.log('Export cancelled.')
        await dbClient.disconnect()
        if (timeoutHandle) clearTimeout(timeoutHandle)
        return
      }
    }

    // Export based on format
    if (prompts.format === 'json') {
      await exportJSON(outputFile, rows, prompts.nullValue)
    } else if (prompts.format === 'excel') {
      await exportExcel(outputFile, table, rows, prompts.nullValue)
    } else {
      await exportCSV(outputFile, rows, prompts.delimiter, prompts.includeHeaders, prompts.nullValue)
    }

    const elapsed = Date.now() - startTime
    const elapsedSeconds = (elapsed / 1000).toFixed(2)

    console.log(`Export complete: ${rows.length} rows exported to ${outputFile} (${elapsedSeconds}s)`)

    await dbClient.disconnect()
    if (timeoutHandle) clearTimeout(timeoutHandle)

  } catch (error) {
    const errorMsg = `Export error: ${error.message}`
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
 * Export rows to CSV file
 * @param {string} filePath - Output file path
 * @param {Array<object>} rows - Data rows to export
 * @param {string} delimiter - CSV delimiter
 * @param {boolean} includeHeaders - Whether to include header row
 * @param {string} nullValue - Value to use for NULL cells
 * @returns {Promise<void>}
 */
async function exportCSV(filePath, rows, delimiter = ',', includeHeaders = true, nullValue = '') {
  const fs = await import('fs')
  const base = await import('../utils/base.js')

  if (!rows || rows.length === 0) {
    base.debug('No rows to export')
    return
  }

  try {
    const headers = Object.keys(rows[0])
    let csvContent = ''

    // Add headers
    if (includeHeaders) {
      csvContent += headers.map(h => escapeCSVField(String(h))).join(delimiter) + '\n'
    }

    // Add rows
    for (const row of rows) {
      const values = headers.map(header => {
        const value = row[header]
        const stringValue = value === null || value === undefined ? nullValue : String(value)
        return escapeCSVField(stringValue)
      })
      csvContent += values.join(delimiter) + '\n'
    }

    await fs.promises.writeFile(filePath, csvContent, 'utf8')
    base.debug(`CSV file written: ${filePath}`)

  } catch (error) {
    throw new Error(`File write error for ${filePath}: ${error.message}`)
  }
}

/**
 * Escape CSV field value
 * @param {string} field - Field value
 * @returns {string}
 */
function escapeCSVField(field) {
  if (!field) return ''
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"` // Escape quotes by doubling them
  }
  return field
}

/**
 * Export rows to Excel file
 * @param {string} filePath - Output file path
 * @param {string} sheetName - Worksheet name
 * @param {Array<object>} rows - Data rows to export
 * @param {string} nullValue - Value to use for NULL cells
 * @returns {Promise<void>}
 */
async function exportExcel(filePath, sheetName, rows, nullValue = '') {
  const base = await import('../utils/base.js')

  if (!rows || rows.length === 0) {
    base.debug('No rows to export')
    return
  }

  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(sheetName.substring(0, 31)) // Excel sheet name limit

    const headers = Object.keys(rows[0])
    
    // Add headers
    const headerRow = worksheet.addRow(headers)
    headerRow.font = { bold: true }
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } }

    // Add rows
    for (const row of rows) {
      const values = headers.map(header => {
        const value = row[header]
        return value === null || value === undefined ? nullValue : value
      })
      worksheet.addRow(values)
    }

    // Auto-fit columns
    headers.forEach((header, index) => {
      const column = worksheet.getColumn(index + 1)
      let maxLength = header.length
      for (const row of worksheet.getSheetValues().slice(1)) {
        if (row[index + 1]) {
          maxLength = Math.max(maxLength, String(row[index + 1]).length)
        }
      }
      column.width = Math.min(maxLength + 2, 50)
    })

    await workbook.xlsx.writeFile(filePath)
    base.debug(`Excel file written: ${filePath}`)

  } catch (error) {
    throw new Error(`File write error for ${filePath}: ${error.message}`)
  }
}

/**
 * Export rows to JSON file
 * @param {string} filePath - Output file path
 * @param {Array<object>} rows - Data rows to export
 * @param {string} nullValue - Value to use for NULL cells (not used for JSON)
 * @returns {Promise<void>}
 */
async function exportJSON(filePath, rows, nullValue = '') {
  const fs = await import('fs')
  const base = await import('../utils/base.js')

  if (!rows || rows.length === 0) {
    base.debug('No rows to export')
    return
  }

  try {
    // Convert null values
    const processedRows = rows.map(row => {
      const processed = {}
      for (const [key, value] of Object.entries(row)) {
        processed[key] = value === null || value === undefined ? null : value
      }
      return processed
    })

    const jsonContent = JSON.stringify(processedRows, null, 2)
    await fs.promises.writeFile(filePath, jsonContent, 'utf8')
    base.debug(`JSON file written: ${filePath}`)

  } catch (error) {
    throw new Error(`File write error for ${filePath}: ${error.message}`)
  }
}

/**
 * Prompt user for confirmation (yes/no)
 * @param {string} message - Prompt message
 * @returns {Promise<boolean>}
 */
async function promptForConfirmation(message) {
  const readline = await import('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close()
      const normalized = (answer || '').toLowerCase().trim()
      resolve(normalized === 'yes' || normalized === 'y')
    })
  })
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
