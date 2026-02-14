// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"
import ExcelJS from 'exceljs'

export const command = 'import'
export const aliases = ['imp', 'uploadData', 'uploaddata']
export const describe = baseLite.bundle.getText("import")

export const builder = baseLite.getBuilder({
  filename: {
    alias: ['n', 'Filename'],
    type: 'string',
    desc: baseLite.bundle.getText("importFilename")
  },
  table: {
    alias: ['t', 'Table'],
    type: 'string',
    desc: baseLite.bundle.getText("importTable")
  },
  output: {
    alias: ['o', 'Output'],
    choices: ["csv", "excel"],
    default: "csv",
    type: 'string',
    desc: baseLite.bundle.getText("importOutputFormat")
  },
  matchMode: {
    alias: ['m', 'MatchMode'],
    choices: ["order", "name", "auto"],
    default: "auto",
    type: 'string',
    desc: baseLite.bundle.getText("importMatchMode")
  },
  truncate: {
    alias: ['tr', 'Truncate'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("importTruncate")
  },
  profile: {
    alias: ['p', 'Profile'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})

export let inputPrompts = {
  filename: {
    description: baseLite.bundle.getText("importFilename"),
    type: 'string',
    required: true
  },
  table: {
    description: baseLite.bundle.getText("importTable"),
    type: 'string',
    required: true
  },
  output: {
    description: baseLite.bundle.getText("importOutputFormat"),
    type: 'string',
    required: true
  },
  matchMode: {
    description: baseLite.bundle.getText("importMatchMode"),
    type: 'string',
    required: true
  },
  truncate: {
    description: baseLite.bundle.getText("importTruncate"),
    type: 'boolean',
    required: false,
    ask: () => {
      return false
    }
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
  base.promptHandler(argv, importData, inputPrompts)
}

/**
 * Parse CSV content into records
 * @param {string} content - CSV content
 * @returns {Array<Object>} Array of data rows
 */
function parseCSVContent(content) {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length === 0) {
    return []
  }

  // Parse header
  const headers = parseCSVLine(lines[0])
  const records = []

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length > 0 && values.some(v => v.trim())) { // Skip empty rows
      const record = {}
      headers.forEach((header, index) => {
        record[header.trim()] = values[index] ? values[index].trim() : ''
      })
      records.push(record)
    }
  }

  return records
}

/**
 * Parse a single CSV line respecting quoted values
 * @param {string} line - CSV line to parse
 * @returns {Array<string>} Array of values
 */
function parseCSVLine(line) {
  const values = []
  let current = ''
  let insideQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes
      }
    } else if (char === ',' && !insideQuotes) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }

  values.push(current)
  return values
}

/**
 * Read CSV file and return data rows
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Array<Object>>} Array of data rows
 */
async function readCSVFile(filePath) {
  const base = await import('../utils/base.js')
  const { default: fs } = await import('fs')

  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(baseLite.bundle.getText("errFileNotFound", [filePath]))
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const records = parseCSVContent(fileContent)

    base.debug(baseLite.bundle.getText("debug.csvRecordsLoaded", [records.length]))
    return records
  } catch (error) {
    throw new Error(baseLite.bundle.getText("errCSVRead", [error.message]))
  }
}

/**
 * Read Excel file and return data rows
 * @param {string} filePath - Path to Excel file
 * @returns {Promise<Array<Object>>} Array of data rows
 */
async function readExcelFile(filePath) {
  const base = await import('../utils/base.js')
  const { default: fs } = await import('fs')

  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(baseLite.bundle.getText("errFileNotFound", [filePath]))
    }

    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filePath)
    const worksheet = workbook.getWorksheet(1)

    if (!worksheet) {
      throw new Error(baseLite.bundle.getText("errNoWorksheet"))
    }

    const records = []
    const headerRow = worksheet.getRow(1)
    const headers = []

    // Extract headers from first row
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      headers[colNumber - 1] = cell.value ? String(cell.value).trim() : `Column ${colNumber}`
    })

    // Extract data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        const record = {}
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const header = headers[colNumber - 1]
          record[header] = cell.value
        })
        // Only add if row is not empty
        if (Object.values(record).some(v => v !== null && v !== undefined)) {
          records.push(record)
        }
      }
    })

    base.debug(baseLite.bundle.getText("debug.excelRecordsLoaded", [records.length]))
    return records
  } catch (error) {
    throw new Error(baseLite.bundle.getText("errExcelRead", [error.message]))
  }
}

/**
 * Get table metadata from database
 * @param {object} dbClient - Database client instance
 * @param {string} schema - Schema name
 * @param {string} table - Table name
 * @returns {Promise<Object>} Table metadata with columns
 */
async function getTableMetadata(dbClient, schema, table) {
  const base = await import('../utils/base.js')

  // Query to get table columns
  const query = `
    SELECT 
      COLUMN_NAME, 
      POSITION, 
      DATA_TYPE,
      NULLABLE
    FROM SYS.TABLE_COLUMNS 
    WHERE SCHEMA_NAME = '${schema}' 
    AND TABLE_NAME = '${table}'
    ORDER BY POSITION
  `

  const columns = await dbClient.execSQL(query)

  if (!columns || columns.length === 0) {
    throw new Error(baseLite.bundle.getText("errTableNotFound", [schema, table]))
  }

  base.debug(baseLite.bundle.getText("debug.tableColumnsLoaded", [columns.length]))
  return {
    schema,
    table,
    columns: columns.reduce((acc, col) => {
      acc[col.COLUMN_NAME] = {
        position: col.POSITION,
        dataType: col.DATA_TYPE,
        nullable: col.NULLABLE === 'TRUE'
      }
      return acc
    }, {})
  }
}

/**
 * Match file columns to table columns
 * @param {Array<string>} fileColumns - Column names from file
 * @param {Object} tableMetadata - Table metadata with columns
 * @param {string} matchMode - Matching mode: 'order', 'name', or 'auto'
 * @returns {Object} Mapping of file columns to table columns
 */
function matchColumns(fileColumns, tableMetadata, matchMode) {
  const tableColumns = Object.keys(tableMetadata.columns)
  const mapping = {}

  if (matchMode === 'order') {
    // Match by position order
    fileColumns.forEach((fileCol, index) => {
      if (index < tableColumns.length) {
        mapping[fileCol] = tableColumns[index]
      }
    })
  } else if (matchMode === 'name' || matchMode === 'auto') {
    // Try to match by name (case-insensitive)
    fileColumns.forEach((fileCol) => {
      const match = tableColumns.find(
        tableCol => tableCol.toUpperCase() === fileCol.toUpperCase()
      )
      if (match) {
        mapping[fileCol] = match
      } else if (matchMode === 'auto') {
        // In auto mode, if no name match, use position
        const fileIndex = fileColumns.indexOf(fileCol)
        if (fileIndex < tableColumns.length) {
          mapping[fileCol] = tableColumns[fileIndex]
        }
      }
    })
  }

  return mapping
}

/**
 * Convert and validate data based on column data types
 * @param {object} record - Data record
 * @param {Object} columnMapping - Mapping of file columns to table columns
 * @param {Object} tableMetadata - Table metadata with data types
 * @returns {object} Converted record with values
 */
function convertDataTypes(record, columnMapping, tableMetadata) {
  const converted = {}

  for (const [fileCol, tableCol] of Object.entries(columnMapping)) {
    const value = record[fileCol]
    const columnInfo = tableMetadata.columns[tableCol]

    if (value === null || value === undefined || value === '') {
      converted[tableCol] = null
      continue
    }

    const dataType = columnInfo.dataType.toUpperCase()

    try {
      switch (true) {
        case dataType.includes('INT'):
          converted[tableCol] = parseInt(value, 10)
          break
        case dataType.includes('DECIMAL') || dataType.includes('NUMERIC') || dataType.includes('REAL') || dataType.includes('DOUBLE'):
          converted[tableCol] = parseFloat(value)
          break
        case dataType.includes('BOOLEAN'):
          if (typeof value === 'string') {
            converted[tableCol] = value.toLowerCase() === 'true' || value === '1'
          } else {
            converted[tableCol] = Boolean(value)
          }
          break
        case dataType.includes('DATE'):
          if (value instanceof Date) {
            converted[tableCol] = value
          } else {
            converted[tableCol] = new Date(value)
          }
          break
        case dataType.includes('TIMESTAMP'):
          if (value instanceof Date) {
            converted[tableCol] = value
          } else {
            converted[tableCol] = new Date(value)
          }
          break
        default:
          converted[tableCol] = String(value)
      }
    } catch (error) {
      converted[tableCol] = String(value)
    }
  }

  return converted
}

/**
 * Build INSERT statement for a single record
 * @param {string} schema - Schema name
 * @param {string} table - Table name
 * @param {object} record - Data record with converted types
 * @returns {string} INSERT SQL statement
 */
function buildInsertStatement(schema, table, record) {
  const columns = Object.keys(record)
  const values = columns.map(col => {
    const val = record[col]
    if (val === null || val === undefined) {
      return 'NULL'
    }
    if (typeof val === 'string') {
      return `'${val.replace(/'/g, "''")}'`
    }
    if (val instanceof Date) {
      return `'${val.toISOString()}'`
    }
    return String(val)
  })

  return `INSERT INTO "${schema}"."${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')})`
}

/**
 * Import data from file into database table
 * @param {object} prompts - Input prompts with filename, table, output format, etc
 * @returns {Promise<object>} Import result summary
 */
export async function importData(prompts) {
  const base = await import('../utils/base.js')
  base.debug('importData')

  try {
    base.setPrompts(prompts)
    const { default: path } = await import('path')

    // Parse table name (format: schema.table or just table)
    const tableParts = prompts.table.split('.')
    let schema, table
    if (tableParts.length === 2) {
      schema = tableParts[0]
      table = tableParts[1]
    } else {
      schema = 'UNKNOWN'
      table = tableParts[0]
    }

    // Resolve file path
    const resolvedPath = path.resolve(prompts.filename)

    // Read file data
    base.debug(baseLite.bundle.getText("debug.readingFile", [resolvedPath]))
    let fileData = []
    if (prompts.output === 'excel') {
      fileData = await readExcelFile(resolvedPath)
    } else {
      fileData = await readCSVFile(resolvedPath)
    }

    if (fileData.length === 0) {
      base.error(baseLite.bundle.getText("errNoDataInFile"))
      return { success: false, rowsProcessed: 0 }
    }

    base.debug(baseLite.bundle.getText("debug.dataLoaded", [fileData.length]))

    // Connect to database
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()

    // Get table metadata
    const tableMetadata = await getTableMetadata(dbClient, schema, table)
    base.debug(baseLite.bundle.getText("debug.tableMetadataLoaded"))

    // Match columns
    const fileColumns = Object.keys(fileData[0])
    const columnMapping = matchColumns(fileColumns, tableMetadata, prompts.matchMode)
    base.debug(baseLite.bundle.getText("debug.columnsMatched", [Object.keys(columnMapping).length]))

    // Validate that at least some columns were matched
    if (Object.keys(columnMapping).length === 0) {
      await dbClient.disconnect()
      base.error(baseLite.bundle.getText("errNoColumnsMatched"))
      return { success: false, rowsProcessed: 0 }
    }

    // Truncate table if requested
    if (prompts.truncate) {
      base.debug(baseLite.bundle.getText("debug.truncatingTable"))
      await dbClient.execSQL(`TRUNCATE TABLE "${schema}"."${table}"`)
      console.log(baseLite.bundle.getText("tablesTruncated", [table]))
    }

    // Insert data
    base.debug(baseLite.bundle.getText("debug.startingImport"))
    let successCount = 0
    let errorCount = 0
    const errors = []

    for (const record of fileData) {
      try {
        const convertedRecord = convertDataTypes(record, columnMapping, tableMetadata)
        const insertStatement = buildInsertStatement(schema, table, convertedRecord)
        await dbClient.execSQL(insertStatement)
        successCount++
      } catch (error) {
        errorCount++
        errors.push({
          row: successCount + errorCount,
          error: error.message
        })
        base.debug(baseLite.bundle.getText("debug.rowInsertFailed", [successCount + errorCount, error.message]))
      }
    }

    await dbClient.disconnect()

    // Display results
    const result = {
      success: errorCount === 0,
      rowsProcessed: fileData.length,
      rowsInserted: successCount,
      rowsWithErrors: errorCount,
      table: `${schema}.${table}`,
      matchMode: prompts.matchMode,
      truncated: prompts.truncate || false
    }

    console.log(`\n${baseLite.bundle.getText("importSummary")}`)
    base.outputTableFancy([result])

    if (errorCount > 0 && errors.length > 0) {
      console.log(`\n${baseLite.bundle.getText("importErrors")}`)
      console.log(JSON.stringify(errors.slice(0, 10), null, 2))
      if (errors.length > 10) {
        console.log(`... and ${errors.length - 10} more errors`)
      }
    }

    return result
  } catch (error) {
    await base.error(error)
    return { success: false, rowsProcessed: 0 }
  }
}
