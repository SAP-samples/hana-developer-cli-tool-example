// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as fs from 'fs'
import * as path from 'path'
import { homedir } from 'os'

export const command = 'backup [target] [name]'
export const aliases = ['bkp', 'createBackup']
export const describe = baseLite.bundle.getText("backup")

export const builder = baseLite.getBuilder({
  target: {
    alias: ['tgt', 'Target'],
    type: 'string',
    desc: baseLite.bundle.getText("backupTarget")
  },
  name: {
    alias: ['n', 'Name'],
    type: 'string',
    desc: baseLite.bundle.getText("backupName")
  },
  backupType: {
    alias: ['type', 'Type'],
    choices: ["table", "schema", "database"],
    default: "table",
    type: 'string',
    desc: baseLite.bundle.getText("backupType")
  },
  format: {
    alias: ['f', 'Format'],
    choices: ["csv", "binary", "parquet"],
    default: "csv",
    type: 'string',
    desc: baseLite.bundle.getText("backupFormat")
  },
  destination: {
    alias: ['dest', 'Destination'],
    type: 'string',
    desc: baseLite.bundle.getText("backupDestination")
  },
  compress: {
    alias: ['c', 'Compress'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("backupCompress")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  withData: {
    alias: ['wd', 'WithData'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("backupWithData")
  },
  overwrite: {
    alias: ['ow', 'Overwrite'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("backupOverwrite")
  }
})

export let inputPrompts = {
  target: {
    description: baseLite.bundle.getText("backupTarget"),
    type: 'string',
    required: true
  },
  name: {
    description: baseLite.bundle.getText("backupName"),
    type: 'string',
    required: false
  },
  backupType: {
    description: baseLite.bundle.getText("backupType"),
    type: 'string',
    required: true
  },
  format: {
    description: baseLite.bundle.getText("backupFormat"),
    type: 'string',
    required: false
  },
  destination: {
    description: baseLite.bundle.getText("backupDestination"),
    type: 'string',
    required: false
  },
  compress: {
    description: baseLite.bundle.getText("backupCompress"),
    type: 'boolean',
    required: false
  },
  schema: {
    description: baseLite.bundle.getText("schema"),
    type: 'string',
    required: false
  },
  withData: {
    description: baseLite.bundle.getText("backupWithData"),
    type: 'boolean',
    required: false
  },
  overwrite: {
    description: baseLite.bundle.getText("backupOverwrite"),
    type: 'boolean',
    required: false
  }
}

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, createBackup, inputPrompts)
}

/**
 * Create backup of database object(s)
 * @param {object} prompts - Input prompts with backup configuration
 * @returns {Promise<object>} - Backup metadata
 */
export async function createBackup(prompts) {
  const base = await import('../utils/base.js')
  const dbClientModule = await import("../utils/database/index.js")
  const dbClientClass = dbClientModule.default

  try {
    base.debug('createBackup')
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()
    const db = dbClient.getDB()

    // Determine schema
    const schema = prompts.schema === '**CURRENT_SCHEMA**' 
      ? await base.dbClass.schemaCalc(prompts, db)
      : prompts.schema

    // Generate backup name if not provided
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const backupName = prompts.name || `${prompts.target}_${timestamp}`
    
    // Determine destination directory
    const defaultBackupDir = path.join(homedir(), '.hana-cli', 'backups')
    const backupDir = prompts.destination || defaultBackupDir
    
    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const backupPath = path.join(backupDir, `${backupName}.backup`)
    
    // Check if backup already exists
    if (fs.existsSync(backupPath) && !prompts.overwrite) {
      throw new Error(base.bundle.getText("backupExists", [backupPath]))
    }

    let backupMetadata = {
      name: backupName,
      timestamp: new Date().toISOString(),
      type: prompts.backupType,
      target: prompts.target,
      schema: schema,
      format: prompts.format,
      compressed: prompts.compress,
      withData: prompts.withData,
      path: backupPath,
      status: 'in_progress'
    }

    console.log(base.bundle.getText("backupStarting", [prompts.backupType, prompts.target]))

    // Perform backup based on type
    switch (prompts.backupType) {
      case 'table':
        await backupTable(db, schema, prompts.target, backupPath, prompts)
        break
      case 'schema':
        await backupSchema(db, schema, backupPath, prompts)
        break
      case 'database':
        await backupDatabase(db, backupPath, prompts)
        break
    }

    backupMetadata.status = 'completed'
    backupMetadata.completedAt = new Date().toISOString()

    // Save metadata file
    const metadataPath = `${backupPath}.meta.json`
    fs.writeFileSync(metadataPath, JSON.stringify(backupMetadata, null, 2))

    console.log(base.bundle.getText("backupCompleted", [backupPath]))
    base.outputTable([backupMetadata])

    await dbClient.disconnect()
    return backupMetadata

  } catch (error) {
    console.error(base.bundle.getText("backupFailed", [error.message]))
    throw error
  }
}

/**
 * Backup a single table
 * @param {object} db - Database connection
 * @param {string} schema - Schema name
 * @param {string} tableName - Table name
 * @param {string} backupPath - Backup file path
 * @param {object} options - Backup options
 */
async function backupTable(db, schema, tableName, backupPath, options) {
  const base = await import('../utils/base.js')
  
  // Get table metadata
  const tableMetaQuery = `
    SELECT COLUMN_NAME, DATA_TYPE_NAME, LENGTH, SCALE, IS_NULLABLE, DEFAULT_VALUE
    FROM TABLE_COLUMNS 
    WHERE SCHEMA_NAME = ? AND TABLE_NAME = ?
    ORDER BY POSITION
  `
  const tableMetadata = await db.statementExecPromisified(
    await db.preparePromisified(tableMetaQuery), 
    [schema, tableName]
  )

  let backupData = {
    metadata: {
      schema: schema,
      table: tableName,
      columns: tableMetadata,
      format: options.format
    },
    data: []
  }

  // Export data if requested
  if (options.withData) {
    const dataQuery = `SELECT * FROM "${schema}"."${tableName}"`
    backupData.data = await db.statementExecPromisified(
      await db.preparePromisified(dataQuery), 
      []
    )
    console.log(base.bundle.getText("backupRecordsExported", [backupData.data.length]))
  }

  // Write backup file based on format
  if (options.format === 'csv') {
    await writeCSVBackup(backupPath, backupData, options.compress)
  } else {
    // For binary format, use JSON
    const content = options.compress 
      ? await compressData(JSON.stringify(backupData))
      : JSON.stringify(backupData, null, 2)
    fs.writeFileSync(backupPath, content)
  }
}

/**
 * Backup entire schema
 * @param {object} db - Database connection
 * @param {string} schema - Schema name
 * @param {string} backupPath - Backup file path
 * @param {object} options - Backup options
 */
async function backupSchema(db, schema, backupPath, options) {
  const base = await import('../utils/base.js')
  
  // Get all tables in schema
  const tablesQuery = `
    SELECT TABLE_NAME 
    FROM TABLES 
    WHERE SCHEMA_NAME = ?
    ORDER BY TABLE_NAME
  `
  const tables = await db.statementExecPromisified(
    await db.preparePromisified(tablesQuery), 
    [schema]
  )

  console.log(base.bundle.getText("backupSchemaTablesFound", [tables.length, schema]))

  let schemaBackup = {
    schema: schema,
    tables: []
  }

  // Backup each table
  for (const table of tables) {
    console.log(base.bundle.getText("backupTableProgress", [table.TABLE_NAME]))
    
    const tableBackupPath = `${backupPath}_${table.TABLE_NAME}`
    await backupTable(db, schema, table.TABLE_NAME, tableBackupPath, options)
    schemaBackup.tables.push({
      name: table.TABLE_NAME,
      backupPath: tableBackupPath
    })
  }

  // Write schema manifest
  fs.writeFileSync(`${backupPath}.manifest.json`, JSON.stringify(schemaBackup, null, 2))
}

/**
 * Backup entire database (metadata only - full database backup requires SYSTEM privileges)
 * @param {object} db - Database connection
 * @param {string} backupPath - Backup file path
 * @param {object} options - Backup options
 */
async function backupDatabase(db, backupPath, options) {
  const base = await import('../utils/base.js')
  
  console.log(base.bundle.getText("backupDatabaseWarning"))
  
  // Get database metadata
  const dbInfoQuery = `SELECT * FROM M_DATABASE`
  const dbInfo = await db.statementExecPromisified(
    await db.preparePromisified(dbInfoQuery), 
    []
  )

  // Get all schemas
  const schemasQuery = `
    SELECT SCHEMA_NAME 
    FROM SCHEMAS 
    WHERE SCHEMA_OWNER != 'SYS' 
    ORDER BY SCHEMA_NAME
  `
  const schemas = await db.statementExecPromisified(
    await db.preparePromisified(schemasQuery), 
    []
  )

  console.log(base.bundle.getText("backupDatabaseSchemasFound", [schemas.length]))

  let databaseBackup = {
    database: dbInfo,
    schemas: []
  }

  // Note: Full database backup requires SYSTEM user privileges
  // This creates a logical backup of accessible schemas
  for (const schemaRow of schemas) {
    const schemaName = schemaRow.SCHEMA_NAME
    console.log(base.bundle.getText("backupSchemaProgress", [schemaName]))
    
    const schemaBackupPath = `${backupPath}_${schemaName}`
    try {
      await backupSchema(db, schemaName, schemaBackupPath, options)
      databaseBackup.schemas.push({
        name: schemaName,
        backupPath: schemaBackupPath,
        status: 'completed'
      })
    } catch (error) {
      console.warn(base.bundle.getText("backupSchemaSkipped", [schemaName, error.message]))
      databaseBackup.schemas.push({
        name: schemaName,
        status: 'failed',
        error: error.message
      })
    }
  }

  // Write database manifest
  fs.writeFileSync(`${backupPath}.manifest.json`, JSON.stringify(databaseBackup, null, 2))
}

/**
 * Write backup data to CSV format
 * @param {string} backupPath - Backup file path
 * @param {object} backupData - Backup data with metadata and rows
 * @param {boolean} compress - Whether to compress the output
 */
async function writeCSVBackup(backupPath, backupData, compress) {
  const json2csv = /** @type {any} */ (await import('@json2csv/node'))
  const { Parser } = json2csv
  
  // Create CSV from data
  const parser = new Parser()
  const csv = parser.parse(backupData.data)
  
  // Write metadata as separate JSON file
  fs.writeFileSync(`${backupPath}.meta.json`, JSON.stringify(backupData.metadata, null, 2))
  
  // Write CSV data
  const csvPath = backupPath.replace('.backup', '.csv')
  fs.writeFileSync(csvPath, csv)
  
  if (compress) {
    // Compress CSV file (simple implementation - could use zlib for actual compression)
    const { gzip } = await import('zlib')
    const { promisify } = await import('util')
    const gzipAsync = promisify(gzip)
    const compressed = await gzipAsync(csv)
    fs.writeFileSync(`${csvPath}.gz`, compressed)
    fs.unlinkSync(csvPath) // Remove uncompressed version
  }
}

/**
 * Compress data using gzip
 * @param {string} data - Data to compress
 * @returns {Promise<Buffer>} - Compressed data
 */
async function compressData(data) {
  const { gzip } = await import('zlib')
  const { promisify } = await import('util')
  const gzipAsync = promisify(gzip)
  return await gzipAsync(data)
}
