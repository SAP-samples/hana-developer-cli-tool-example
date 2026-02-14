// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"
import ExcelJS from 'exceljs'
import { parse } from 'csv-parse'

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
  batchSize: {
    alias: ['b', 'BatchSize'],
    type: 'number',
    default: 1000,
    desc: baseLite.bundle.getText("importBatchSize")
  },
  worksheet: {
    alias: ['w', 'Worksheet'],
    type: 'number',
    default: 1,
    desc: baseLite.bundle.getText("importWorksheet")
  },
  startRow: {
    alias: ['sr', 'StartRow'],
    type: 'number',
    default: 1,
    desc: baseLite.bundle.getText("importStartRow")
  },
  skipEmptyRows: {
    alias: ['se', 'SkipEmptyRows'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("importSkipEmptyRows")
  },
  excelCacheMode: {
    alias: ['ec', 'ExcelCacheMode'],
    choices: ["cache", "emit", "ignore"],
    default: "cache",
    type: 'string',
    desc: baseLite.bundle.getText("importExcelCacheMode")
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
  batchSize: {
    description: baseLite.bundle.getText("importBatchSize"),
    type: 'number',
    required: false,
    ask: () => {
      return false
    }
  },
  worksheet: {
    description: baseLite.bundle.getText("importWorksheet"),
    type: 'number',
    required: false,
    ask: () => {
      return false
    }
  },
  startRow: {
    description: baseLite.bundle.getText("importStartRow"),
    type: 'number',
    required: false,
    ask: () => {
      return false
    }
  },
  skipEmptyRows: {
    description: baseLite.bundle.getText("importSkipEmptyRows"),
    type: 'boolean',
    required: false,
    ask: () => {
      return false
    }
  },
  excelCacheMode: {
    description: baseLite.bundle.getText("importExcelCacheMode"),
    type: 'string',
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

const DEFAULT_BATCH_SIZE = 1000
const MAX_ERROR_DETAILS = 100

/**
 * Normalize header values from files
 * @param {any} value - Header value
 * @param {number} index - Column index
 * @returns {string} Normalized header name
 */
function normalizeHeaderValue(value, index) {
  const raw = value === null || value === undefined ? '' : String(value)
  const trimmed = raw.replace(/^\uFEFF/, '').trim()
  return trimmed || `Column ${index + 1}`
}

/**
 * Validate file path and ensure the file exists
 * @param {string} filePath - Path to file
 * @returns {Promise<string>} Resolved file path
 */
async function validateFilePath(filePath) {
  const { default: fs } = await import('fs')
  const { default: path } = await import('path')

  if (!filePath || typeof filePath !== 'string' || filePath.includes('\0')) {
    throw new Error(baseLite.bundle.getText("errInvalidFilePath", [filePath]))
  }

  const resolvedPath = path.resolve(filePath)
  try {
    const stats = await fs.promises.stat(resolvedPath)
    if (!stats.isFile()) {
      throw new Error(baseLite.bundle.getText("errFileNotFound", [resolvedPath]))
    }
  } catch (error) {
    throw new Error(baseLite.bundle.getText("errFileNotFound", [resolvedPath]))
  }
  return resolvedPath
}

/**
 * Create CSV record iterator using streaming parser
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<{iterator: AsyncGenerator<object>, getColumns: () => Array<string>}>}
 */
async function createCsvRecordIterator(filePath) {
  const { default: fs } = await import('fs')
  const resolvedPath = await validateFilePath(filePath)

  let columns = null
  const parser = parse({
    bom: true,
    relax_quotes: false,
    trim: true,
    skip_empty_lines: true,
    relax_column_count: true,
    columns: (header) => {
      columns = header.map((value, index) => normalizeHeaderValue(value, index))
      return columns
    }
  })

  const stream = fs.createReadStream(resolvedPath)
  stream.on('error', (error) => parser.destroy(error))

  const iterator = (async function* () {
    for await (const record of stream.pipe(parser)) {
      yield record
    }
  })()

  return { iterator, getColumns: () => columns }
}

/**
 * Normalize Excel cell values
 * @param {any} cellValue - ExcelJS cell value
 * @returns {any} Normalized value
 */
function normalizeExcelCellValue(cellValue) {
  if (cellValue === null || cellValue === undefined) {
    return null
  }
  if (cellValue instanceof Date) {
    return cellValue
  }
  if (typeof cellValue === 'object') {
    if (Object.prototype.hasOwnProperty.call(cellValue, 'text')) {
      return cellValue.text
    }
    if (Object.prototype.hasOwnProperty.call(cellValue, 'richText')) {
      return cellValue.richText.map(part => part.text).join('')
    }
    if (Object.prototype.hasOwnProperty.call(cellValue, 'formula') && Object.prototype.hasOwnProperty.call(cellValue, 'result')) {
      return cellValue.result
    }
    if (Object.prototype.hasOwnProperty.call(cellValue, 'hyperlink') && Object.prototype.hasOwnProperty.call(cellValue, 'text')) {
      return cellValue.text
    }
    return cellValue.result ?? cellValue.text ?? cellValue
  }
  return cellValue
}

/**
 * Create Excel record iterator using streaming reader
 * @param {string} filePath - Path to Excel file
 * @param {object} options - Excel reading options
 * @param {number} [options.worksheet] - Worksheet number to read (1-based)
 * @param {number} [options.startRow] - Starting row number (1-based, row 1 is header by default)
 * @param {boolean} [options.skipEmptyRows] - Skip rows with all empty values
 * @param {'cache'|'emit'|'ignore'} [options.cacheMode] - Shared strings cache mode
 * @returns {Promise<{iterator: AsyncGenerator<object>, getColumns: () => Array<string>}>}
 */
async function createExcelRecordIterator(filePath, options) {
  const resolvedPath = await validateFilePath(filePath)
  const targetWorksheet = options?.worksheet || 1
  const startRow = options?.startRow || 1
  const skipEmptyRows = options?.skipEmptyRows !== false // default true
  /** @type {'cache'|'emit'|'ignore'} */
  const cacheMode = options?.cacheMode || 'cache'

  const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(resolvedPath, {
    entries: 'emit',
    worksheets: 'emit',
    sharedStrings: cacheMode,
    styles: cacheMode === 'cache' ? 'cache' : 'ignore'
  })

  let columns = null
  let currentWorksheetCount = 0

  const iterator = (async function* () {
    for await (const worksheetReader of workbookReader) {
      currentWorksheetCount++
      const worksheetId = /** @type {any} */ (worksheetReader)?.id
      
      // Skip worksheets until we reach the target one
      if (worksheetId && worksheetId !== targetWorksheet && currentWorksheetCount !== targetWorksheet) {
        continue
      }

      for await (const row of worksheetReader) {
        // Handle header row based on startRow setting
        if (row.number === startRow) {
          const values = Array.isArray(row.values) ? row.values.slice(1) : []
          columns = values.map((value, index) => normalizeHeaderValue(value, index))
          continue
        }

        // Skip rows before the startRow
        if (row.number < startRow) {
          continue
        }

        if (!columns) {
          continue
        }

        const values = Array.isArray(row.values) ? row.values : []
        const record = {}
        columns.forEach((header, index) => {
          record[header] = normalizeExcelCellValue(values[index + 1])
        })

        // Check if row has any non-empty values
        const hasData = Object.values(record).some(v => v !== null && v !== undefined && v !== '')
        
        if (!skipEmptyRows || hasData) {
          yield record
        }
      }
      break // Only process the first matching worksheet
    }
  })()

  return { iterator, getColumns: () => columns }
}

/**
 * Determine if identifier is quoted
 * @param {string} identifier - SQL identifier
 * @returns {boolean}
 */
function isQuotedIdentifier(identifier) {
  return identifier.length >= 2 && identifier.startsWith('"') && identifier.endsWith('"')
}

/**
 * Unquote an identifier, validating escaped quotes
 * @param {string} identifier - Quoted identifier
 * @returns {string|null}
 */
function unquoteIdentifier(identifier) {
  if (!isQuotedIdentifier(identifier)) {
    return null
  }
  const inner = identifier.slice(1, -1)
  let result = ''
  for (let i = 0; i < inner.length; i++) {
    const char = inner[i]
    if (char === '"') {
      if (inner[i + 1] === '"') {
        result += '"'
        i++
      } else {
        return null
      }
    } else if (char === '\n' || char === '\r' || char === '\0') {
      return null
    } else {
      result += char
    }
  }
  return result
}

/**
 * Validate SQL identifier (unquoted form)
 * @param {string} identifier - SQL identifier to validate
 * @returns {boolean} True if valid
 */
function isValidSQLIdentifier(identifier) {
  if (!identifier || typeof identifier !== 'string') {
    return false
  }
  // Allow alphanumeric, underscore, and specific special chars, but prevent SQL injection
  // HANA allows up to 127 characters for identifiers
  const validPattern = /^[A-Za-z_][A-Za-z0-9_$#]{0,126}$/
  return validPattern.test(identifier) && !identifier.includes('--') && !identifier.includes('/*')
}

/**
 * Normalize identifier for database kind
 * @param {string} identifier - Identifier value
 * @param {string} dbKind - Database kind
 * @param {boolean} wasQuoted - Whether input was quoted
 * @returns {string}
 */
function normalizeIdentifierForDb(identifier, dbKind, wasQuoted) {
  if (wasQuoted) {
    return identifier
  }
  if (dbKind === 'hana') {
    return identifier.toUpperCase()
  }
  if (dbKind === 'postgres') {
    return identifier.toLowerCase()
  }
  return identifier
}

/**
 * Parse and validate identifier input
 * @param {string} identifier - Identifier input
 * @param {string} dbKind - Database kind
 * @returns {{name: string, quoted: boolean}}
 */
function parseIdentifier(identifier, dbKind) {
  if (!identifier || typeof identifier !== 'string') {
    return { name: '', quoted: false }
  }
  const trimmed = identifier.trim()
  if (isQuotedIdentifier(trimmed)) {
    const unquoted = unquoteIdentifier(trimmed)
    if (unquoted === null || unquoted === '') {
      return { name: '', quoted: false }
    }
    return { name: normalizeIdentifierForDb(unquoted, dbKind, true), quoted: true }
  }
  if (!isValidSQLIdentifier(trimmed)) {
    return { name: '', quoted: false }
  }
  return { name: normalizeIdentifierForDb(trimmed, dbKind, false), quoted: false }
}

/**
 * Split qualified name into parts, respecting quoted identifiers
 * @param {string} input - Qualified identifier
 * @returns {Array<string>}
 */
function splitQualifiedName(input) {
  const parts = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    const nextChar = input[i + 1]
    if (char === '"') {
      current += char
      if (inQuotes && nextChar === '"') {
        current += nextChar
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (char === '.' && !inQuotes) {
      parts.push(current)
      current = ''
      continue
    }
    current += char
  }
  if (current) {
    parts.push(current)
  }
  return parts
}

/**
 * Parse qualified table input
 * @param {string} input - Qualified table name
 * @param {string} dbKind - Database kind
 * @returns {{schema: string|null, table: string}}
 */
function parseQualifiedTableName(input, dbKind) {
  const parts = splitQualifiedName(input)
  if (parts.length === 2) {
    const schemaInfo = parseIdentifier(parts[0], dbKind)
    const tableInfo = parseIdentifier(parts[1], dbKind)
    if (!schemaInfo.name || !tableInfo.name) {
      return { schema: null, table: '' }
    }
    return {
      schema: schemaInfo.name || null,
      table: tableInfo.name
    }
  }
  if (parts.length === 1) {
    const tableInfo = parseIdentifier(parts[0], dbKind)
    return { schema: null, table: tableInfo.name }
  }
  return { schema: null, table: '' }
}

/**
 * Quote SQL identifier safely
 * @param {string} identifier - Identifier value
 * @returns {string}
 */
function quoteIdentifier(identifier) {
  return `"${String(identifier).replace(/"/g, '""')}"`
}

/**
 * Format qualified table name
 * @param {string|null} schema - Schema name
 * @param {string} table - Table name
 * @returns {string}
 */
function formatQualifiedName(schema, table) {
  if (schema) {
    return `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`
  }
  return quoteIdentifier(table)
}

/**
 * Resolve current schema for database kind
 * @param {object} dbClient - Database client
 * @param {string} dbKind - Database kind
 * @returns {Promise<string|null>}
 */
async function getCurrentSchema(dbClient, dbKind) {
  if (dbKind === 'postgres') {
    const result = await dbClient.execSQL('SELECT current_schema() AS CURRENT_SCHEMA')
    return result?.[0]?.CURRENT_SCHEMA ?? result?.[0]?.current_schema ?? null
  }
  if (dbKind === 'sqlite') {
    return null
  }
  const result = await dbClient.execSQL('SELECT CURRENT_SCHEMA FROM DUMMY')
  return result?.[0]?.CURRENT_SCHEMA ?? null
}

/**
 * Validate required columns are present in mapping
 * @param {Object} columnMapping - Mapping of file columns to table columns
 * @param {Object} tableMetadata - Table metadata
 */
function validateRequiredColumns(columnMapping, tableMetadata) {
  const mappedColumns = new Set(Object.values(columnMapping))
  const missingRequired = Object.entries(tableMetadata.columns)
    .filter(([columnName, info]) => !info.nullable && !mappedColumns.has(columnName) && (info.defaultValue === null || info.defaultValue === undefined))
    .map(([columnName]) => columnName)

  if (missingRequired.length > 0) {
    throw new Error(`Missing required columns: ${missingRequired.join(', ')}`)
  }
}

/**
 * Normalize value for database parameter binding
 * @param {any} value - Value to normalize
 * @returns {any}
 */
function normalizeValueForDb(value) {
  if (value === null || value === undefined) {
    return null
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0
  }
  return value
}

/**
 * Get table metadata from database
 * @param {object} dbClient - Database client instance
 * @param {string} schema - Schema name
 * @param {string} table - Table name
 * @returns {Promise<Object>} Table metadata with columns
 */
async function getTableMetadata(dbClient, schema, table, dbKind) {
  const base = await import('../utils/base.js')

  if (!table) {
    throw new Error(baseLite.bundle.getText("errInvalidTable", [table]))
  }

  const normalizedKind = (dbKind || '').toLowerCase()
  let query = ''
  let params = []

  if (normalizedKind === 'postgres') {
    query = `
      SELECT 
        column_name AS COLUMN_NAME,
        ordinal_position AS POSITION,
        data_type AS DATA_TYPE,
        is_nullable AS NULLABLE,
        column_default AS DEFAULT_VALUE
      FROM information_schema.columns
      WHERE table_schema = ?
      AND table_name = ?
      ORDER BY ordinal_position
    `
    params = [schema, table]
  } else if (normalizedKind === 'sqlite') {
    query = `
      SELECT 
        name AS COLUMN_NAME,
        (cid + 1) AS POSITION,
        type AS DATA_TYPE,
        notnull AS NOTNULL,
        dflt_value AS DEFAULT_VALUE
      FROM pragma_table_info(?)
      ORDER BY cid
    `
    params = [table]
  } else {
    if (!schema) {
      throw new Error(baseLite.bundle.getText("errInvalidSchema", [schema]))
    }
    query = `
      SELECT 
        COLUMN_NAME, 
        POSITION, 
        DATA_TYPE,
        NULLABLE,
        DEFAULT_VALUE
      FROM SYS.TABLE_COLUMNS 
      WHERE SCHEMA_NAME = ? 
      AND TABLE_NAME = ?
      ORDER BY POSITION
    `
    params = [schema, table]
  }

  const columns = await dbClient.execSQL(query, params)

  if (!columns || columns.length === 0) {
    throw new Error(baseLite.bundle.getText("errTableNotFound", [schema || '', table]))
  }

  const normalizedColumns = columns.reduce((acc, col) => {
    const columnName = col.COLUMN_NAME ?? col.column_name ?? col.name
    const position = Number(col.POSITION ?? col.ordinal_position ?? col.position ?? col.cid ?? 0) || 0
    const dataType = col.DATA_TYPE ?? col.data_type ?? col.type ?? ''
    const defaultValue = col.DEFAULT_VALUE ?? col.column_default ?? col.dflt_value

    let nullable = true
    if (typeof col.NULLABLE === 'string') {
      nullable = col.NULLABLE.toUpperCase() === 'TRUE' || col.NULLABLE.toUpperCase() === 'YES'
    } else if (typeof col.NOTNULL === 'number') {
      nullable = col.NOTNULL === 0
    } else if (typeof col.notnull === 'number') {
      nullable = col.notnull === 0
    } else if (typeof col.IS_NULLABLE === 'string') {
      nullable = col.IS_NULLABLE.toUpperCase() === 'YES'
    }

    acc[columnName] = {
      position,
      dataType,
      nullable,
      defaultValue
    }
    return acc
  }, {})

  base.debug(baseLite.bundle.getText("debug.tableColumnsLoaded", [columns.length]))
  return {
    schema,
    table,
    columns: normalizedColumns
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
  const tableColumnsUpper = new Map(tableColumns.map(col => [col.toUpperCase(), col]))
  const tableColumnsExact = new Set(tableColumns)
  const mapping = {}

  if (matchMode === 'order') {
    // Match by position order
    fileColumns.forEach((fileCol, index) => {
      if (index < tableColumns.length) {
        const normalizedFileCol = typeof fileCol === 'string' ? fileCol.trim() : String(fileCol)
        mapping[normalizedFileCol] = tableColumns[index]
      }
    })
  } else if (matchMode === 'name' || matchMode === 'auto') {
    // Try to match by name (case-insensitive)
    fileColumns.forEach((fileCol) => {
      const normalizedFileCol = typeof fileCol === 'string' ? fileCol.trim() : String(fileCol)
      const unquotedFileCol = isQuotedIdentifier(normalizedFileCol) ? (unquoteIdentifier(normalizedFileCol) ?? normalizedFileCol) : normalizedFileCol
      const exactMatch = tableColumnsExact.has(unquotedFileCol) ? unquotedFileCol : null
      const match = exactMatch || tableColumnsUpper.get(unquotedFileCol.toUpperCase())
      if (match) {
        mapping[normalizedFileCol] = match
      } else if (matchMode === 'auto') {
        // In auto mode, if no name match, use position
        const fileIndex = fileColumns.indexOf(fileCol)
        if (fileIndex < tableColumns.length) {
          mapping[normalizedFileCol] = tableColumns[fileIndex]
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
      // Check if column is nullable
      if (!columnInfo.nullable) {
        throw new Error(`Column ${tableCol} is NOT NULL but received empty value`)
      }
      converted[tableCol] = null
      continue
    }

    const dataType = String(columnInfo.dataType || '').toUpperCase()

    try {
      switch (true) {
        case dataType.includes('INT'): {
          const parsed = typeof value === 'number' ? value : parseInt(String(value).trim(), 10)
          if (isNaN(parsed)) {
            throw new Error(`Invalid integer value for column ${tableCol}: ${value}`)
          }
          converted[tableCol] = parsed
          break
        }
        case dataType.includes('DECIMAL') || dataType.includes('NUMERIC') || dataType.includes('REAL') || dataType.includes('DOUBLE'): {
          const parsed = typeof value === 'number' ? value : parseFloat(String(value).trim())
          if (isNaN(parsed)) {
            throw new Error(`Invalid numeric value for column ${tableCol}: ${value}`)
          }
          converted[tableCol] = parsed
          break
        }
        case dataType.includes('BOOLEAN'):
          if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase()
            if (['true', '1', 'yes', 'y', 't'].includes(normalized)) {
              converted[tableCol] = true
            } else if (['false', '0', 'no', 'n', 'f'].includes(normalized)) {
              converted[tableCol] = false
            } else {
              throw new Error(`Invalid boolean value for column ${tableCol}: ${value}`)
            }
          } else {
            converted[tableCol] = Boolean(value)
          }
          break
        case dataType.includes('DATE'): {
          if (value instanceof Date) {
            converted[tableCol] = isNaN(value.getTime()) ? null : value
          } else {
            const parsed = new Date(String(value))
            if (isNaN(parsed.getTime())) {
              throw new Error(`Invalid date value for column ${tableCol}: ${value}`)
            }
            converted[tableCol] = parsed
          }
          break
        }
        case dataType.includes('TIMESTAMP'): {
          if (value instanceof Date) {
            converted[tableCol] = isNaN(value.getTime()) ? null : value
          } else {
            const parsed = new Date(String(value))
            if (isNaN(parsed.getTime())) {
              throw new Error(`Invalid timestamp value for column ${tableCol}: ${value}`)
            }
            converted[tableCol] = parsed
          }
          break
        }
        default:
          converted[tableCol] = String(value)
      }
    } catch (error) {
      // Re-throw validation errors
      throw error
    }
  }

  return converted
}

/**
 * Build INSERT statement for a single record
 * @param {string} schema - Schema name
 * @param {string} table - Table name
 * @param {object} record - Data record with converted types
 * @returns {{sql: string, values: Array<any>}} INSERT SQL statement and values
 */
function buildInsertStatement(schema, table, record) {
  return buildBatchInsertStatement(schema, table, [record])
}

/**
 * Build batch INSERT statement for multiple records
 * @param {string} schema - Schema name
 * @param {string} table - Table name
 * @param {Array<object>} records - Array of data records with converted types
 * @returns {{sql: string, values: Array<any>}} Batch INSERT SQL statement and values
 */
function buildBatchInsertStatement(schema, table, records) {
  if (!records || records.length === 0) {
    throw new Error('No records provided for batch insert')
  }

  const columns = Object.keys(records[0])
  const values = []

  const valuesClause = records.map(record => {
    const rowPlaceholders = columns.map(col => {
      values.push(normalizeValueForDb(record[col]))
      return '?'
    })
    return `(${rowPlaceholders.join(', ')})`
  }).join(', ')

  const qualifiedName = formatQualifiedName(schema, table)
  const columnsClause = columns.map(col => quoteIdentifier(col)).join(', ')
  const sql = `INSERT INTO ${qualifiedName} (${columnsClause}) VALUES ${valuesClause}`

  return { sql, values }
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
    // Connect to database
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()

    const dbKind = (dbClient.getKind() || 'hana').toLowerCase()

    // Parse table name (format: schema.table or just table)
    const parsedTable = parseQualifiedTableName(prompts.table, dbKind)
    let schema = parsedTable.schema
    let table = parsedTable.table

    if (!table) {
      throw new Error(baseLite.bundle.getText("errInvalidTableFormat", [prompts.table]))
    }

    if (!schema && dbKind !== 'sqlite') {
      const currentSchema = await getCurrentSchema(dbClient, dbKind)
      if (!currentSchema) {
        throw new Error(baseLite.bundle.getText("errNoSchemaSpecified"))
      }
      schema = currentSchema
    }

    if (dbKind === 'sqlite' && schema) {
      base.debug(`Ignoring schema for sqlite: ${schema}`)
      schema = null
    }

    // Read file data as stream
    base.debug(baseLite.bundle.getText("debug.readingFile", [prompts.filename]))
    const iteratorInfo = prompts.output === 'excel'
      ? await createExcelRecordIterator(prompts.filename, {
          worksheet: prompts.worksheet || 1,
          startRow: prompts.startRow || 1,
          skipEmptyRows: prompts.skipEmptyRows !== false,
          cacheMode: prompts.excelCacheMode || 'cache'
        })
      : await createCsvRecordIterator(prompts.filename)

    const recordIterator = iteratorInfo.iterator

    // Get table metadata
    const tableMetadata = await getTableMetadata(dbClient, schema, table, dbKind)
    base.debug(baseLite.bundle.getText("debug.tableMetadataLoaded"))

    // Start transaction
    base.debug(baseLite.bundle.getText("debug.startingTransaction"))
    const beginStatement = dbKind === 'hana' ? 'BEGIN TRANSACTION' : 'BEGIN'
    await dbClient.execSQL(beginStatement)

    // Initialize counters outside try block for access after transaction
    let successCount = 0
    let errorCount = 0
    let rowsProcessed = 0
    const errors = []
    let BATCH_SIZE = DEFAULT_BATCH_SIZE

    try {
      // Truncate table if requested
      if (prompts.truncate) {
        base.debug(baseLite.bundle.getText("debug.truncatingTable"))
        const truncateStatement = dbKind === 'sqlite'
          ? `DELETE FROM ${formatQualifiedName(schema, table)}`
          : `TRUNCATE TABLE ${formatQualifiedName(schema, table)}`
        await dbClient.execSQL(truncateStatement)
        console.log(baseLite.bundle.getText("tablesTruncated", [table]))
      }

      // Insert data in batches for better performance
      base.debug(baseLite.bundle.getText("debug.startingImport"))
      BATCH_SIZE = prompts.batchSize || DEFAULT_BATCH_SIZE
      
      // Validate batch size
      if (BATCH_SIZE < 1 || BATCH_SIZE > 10000) {
        throw new Error(`Batch size must be between 1 and 10000, got: ${BATCH_SIZE}`)
      }
      
      base.debug(`Using batch size: ${BATCH_SIZE}`)

      let fileColumns = null
      let columnMapping = null
      const batch = []

      const addError = (row, message) => {
        errorCount++
        if (errors.length < MAX_ERROR_DETAILS) {
          errors.push({ row, error: message })
        }
      }

      const insertBatchRecursive = async (batchItems) => {
        if (!batchItems || batchItems.length === 0) {
          return
        }
        try {
          const { sql, values } = buildBatchInsertStatement(schema, table, batchItems.map(item => item.record))
          await dbClient.execSQL(sql, values)
          successCount += batchItems.length
          base.debug(baseLite.bundle.getText("debug.batchInserted", [batchItems.length, successCount]))
        } catch (error) {
          base.debug(baseLite.bundle.getText("debug.batchFailed", [error.message]))
          if (batchItems.length === 1) {
            addError(batchItems[0].originalIndex, error.message)
            base.debug(baseLite.bundle.getText("debug.rowInsertFailed", [batchItems[0].originalIndex, error.message]))
            return
          }
          const mid = Math.ceil(batchItems.length / 2)
          await insertBatchRecursive(batchItems.slice(0, mid))
          await insertBatchRecursive(batchItems.slice(mid))
        }
      }

      for await (const record of recordIterator) {
        rowsProcessed++

        if (!fileColumns) {
          fileColumns = Object.keys(record)
          columnMapping = matchColumns(fileColumns, tableMetadata, prompts.matchMode)
          base.debug(baseLite.bundle.getText("debug.columnsMatched", [Object.keys(columnMapping).length]))

          if (Object.keys(columnMapping).length === 0) {
            throw new Error(baseLite.bundle.getText("errNoColumnsMatched"))
          }
          validateRequiredColumns(columnMapping, tableMetadata)
        }

        try {
          const convertedRecord = convertDataTypes(record, columnMapping, tableMetadata)
          batch.push({ record: convertedRecord, originalIndex: rowsProcessed })
        } catch (error) {
          addError(rowsProcessed, error.message)
          base.debug(baseLite.bundle.getText("debug.rowValidationFailed", [rowsProcessed, error.message]))
        }

        if (batch.length >= BATCH_SIZE) {
          await insertBatchRecursive(batch.splice(0, batch.length))
        }
      }

      if (batch.length > 0) {
        await insertBatchRecursive(batch)
      }

      if (rowsProcessed === 0) {
        base.error(baseLite.bundle.getText("errNoDataInFile"))
        await dbClient.execSQL('ROLLBACK')
        await dbClient.disconnect()
        return { success: false, rowsProcessed: 0 }
      }

      // Commit transaction
      await dbClient.execSQL('COMMIT')
      base.debug(baseLite.bundle.getText("debug.transactionCommitted"))
    } catch (error) {
      // Rollback on error
      base.debug(baseLite.bundle.getText("debug.rollingBack"))
      await dbClient.execSQL('ROLLBACK')
      throw error
    }

    await dbClient.disconnect()

    // Display results
    const result = {
      success: errorCount === 0,
      rowsProcessed: rowsProcessed,
      rowsInserted: successCount,
      rowsWithErrors: errorCount,
      table: schema ? `${schema}.${table}` : table,
      matchMode: prompts.matchMode,
      truncated: prompts.truncate || false,
      batchSize: BATCH_SIZE
    }
    
    // Add Excel-specific info if applicable
    if (prompts.output === 'excel') {
      result.excelWorksheet = prompts.worksheet || 1
      result.excelStartRow = prompts.startRow || 1
      result.excelSkipEmptyRows = prompts.skipEmptyRows !== false
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
