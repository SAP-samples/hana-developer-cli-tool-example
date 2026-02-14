// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as fs from 'fs'
import * as path from 'path'
import { homedir } from 'os'

export const command = 'restore [backupFile]'
export const aliases = ['rst', 'restoreBackup']
export const describe = baseLite.bundle.getText("restore")

export const builder = baseLite.getBuilder({
  backupFile: {
    alias: ['bf', 'BackupFile'],
    type: 'string',
    desc: baseLite.bundle.getText("restoreBackupFile")
  },
  target: {
    alias: ['tgt', 'Target'],
    type: 'string',
    desc: baseLite.bundle.getText("restoreTarget")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    desc: baseLite.bundle.getText("schema")
  },
  overwrite: {
    alias: ['ow', 'Overwrite'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("restoreOverwrite")
  },
  dropExisting: {
    alias: ['de', 'DropExisting'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("restoreDropExisting")
  },
  continueOnError: {
    alias: ['coe', 'ContinueOnError'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("restoreContinueOnError")
  },
  batchSize: {
    alias: ['b', 'BatchSize'],
    type: 'number',
    default: 1000,
    desc: baseLite.bundle.getText("restoreBatchSize")
  },
  dryRun: {
    alias: ['dr', 'DryRun'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("restoreDryRun")
  }
})

export let inputPrompts = {
  backupFile: {
    description: baseLite.bundle.getText("restoreBackupFile"),
    type: 'string',
    required: true
  },
  target: {
    description: baseLite.bundle.getText("restoreTarget"),
    type: 'string',
    required: false
  },
  schema: {
    description: baseLite.bundle.getText("schema"),
    type: 'string',
    required: false
  },
  overwrite: {
    description: baseLite.bundle.getText("restoreOverwrite"),
    type: 'boolean',
    required: false
  },
  dropExisting: {
    description: baseLite.bundle.getText("restoreDropExisting"),
    type: 'boolean',
    required: false
  },
  continueOnError: {
    description: baseLite.bundle.getText("restoreContinueOnError"),
    type: 'boolean',
    required: false
  },
  batchSize: {
    description: baseLite.bundle.getText("restoreBatchSize"),
    type: 'number',
    required: false
  },
  dryRun: {
    description: baseLite.bundle.getText("restoreDryRun"),
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
  base.promptHandler(argv, restoreBackup, inputPrompts)
}

/**
 * Restore database object(s) from backup
 * @param {object} prompts - Input prompts with restore configuration
 * @returns {Promise<object>} - Restore result
 */
export async function restoreBackup(prompts) {
  const base = await import('../utils/base.js')
  const dbClientModule = await import("../utils/database/index.js")
  const dbClientClass = dbClientModule.default

  try {
    base.debug('restoreBackup')
    
    // Resolve backup file path
    let backupPath = prompts.backupFile
    if (!path.isAbsolute(backupPath)) {
      const defaultBackupDir = path.join(homedir(), '.hana-cli', 'backups')
      backupPath = path.join(defaultBackupDir, backupPath)
    }

    // Check if backup file exists
    if (!fs.existsSync(backupPath)) {
      throw new Error(base.bundle.getText("restoreFileNotFound", [backupPath]))
    }

    // Load backup metadata
    const metadataPath = `${backupPath}.meta.json`
    let metadata = null
    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
    }

    console.log(base.bundle.getText("restoreStarting", [backupPath]))

    if (prompts.dryRun) {
      console.log(base.bundle.getText("restoreDryRunMode"))
      if (metadata) {
        console.log(`\n${base.bundle.getText("restoreMetadata")}:`)
        base.outputTable([metadata])
      }
      return { status: 'dry-run', metadata }
    }

    // Connect to database
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()
    const db = dbClient.getDB()

    let result
    if (metadata) {
      // Restore based on backup type
      switch (metadata.type) {
        case 'table':
          result = await restoreTable(db, backupPath, metadata, prompts)
          break
        case 'schema':
          result = await restoreSchema(db, backupPath, metadata, prompts)
          break
        case 'database':
          result = await restoreDatabase(db, backupPath, metadata, prompts)
          break
        default:
          throw new Error(base.bundle.getText("restoreUnknownType", [metadata.type]))
      }
    } else {
      // Try to restore without metadata
      console.warn(base.bundle.getText("restoreNoMetadata"))
      result = await restoreTable(db, backupPath, null, prompts)
    }

    console.log(base.bundle.getText("restoreCompleted"))
    base.outputTable([result])

    await dbClient.disconnect()
    return result

  } catch (error) {
    console.error(base.bundle.getText("restoreFailed", [error.message]))
    throw error
  }
}

/**
 * Restore a single table
 * @param {object} db - Database connection
 * @param {string} backupPath - Backup file path
 * @param {object} metadata - Backup metadata
 * @param {object} options - Restore options
 * @returns {Promise<object>} - Restore result
 */
async function restoreTable(db, backupPath, metadata, options) {
  const base = await import('../utils/base.js')
  
  let backupData
  const csvPath = backupPath.replace('.backup', '.csv')
  const csvGzPath = `${csvPath}.gz`

  // Load backup data
  if (fs.existsSync(csvGzPath)) {
    // Decompress and load CSV
    const { gunzip } = await import('zlib')
    const { promisify } = await import('util')
    const gunzipAsync = promisify(gunzip)
    const compressed = fs.readFileSync(csvGzPath)
    const decompressed = await gunzipAsync(compressed)
    backupData = { data: parseCSV(decompressed.toString()) }
  } else if (fs.existsSync(csvPath)) {
    // Load uncompressed CSV
    const csvContent = fs.readFileSync(csvPath, 'utf8')
    backupData = { data: parseCSV(csvContent) }
  } else if (fs.existsSync(backupPath)) {
    // Load JSON backup
    const content = fs.readFileSync(backupPath, 'utf8')
    backupData = JSON.parse(content)
  } else {
    throw new Error(base.bundle.getText("restoreDataNotFound", [backupPath]))
  }

  // Determine target schema and table
  const targetSchema = options.schema || (metadata ? metadata.schema : null)
  const targetTable = options.target || (metadata ? metadata.table : null)

  if (!targetSchema || !targetTable) {
    throw new Error(base.bundle.getText("restoreTargetRequired"))
  }

  console.log(base.bundle.getText("restoreTableTarget", [targetSchema, targetTable]))

  // Check if table exists
  const checkTableQuery = `
    SELECT COUNT(*) as COUNT 
    FROM TABLES 
    WHERE SCHEMA_NAME = ? AND TABLE_NAME = ?
  `
  const tableExists = await db.statementExecPromisified(
    await db.preparePromisified(checkTableQuery),
    [targetSchema, targetTable]
  )

  if (tableExists[0].COUNT > 0) {
    if (options.dropExisting) {
      console.log(base.bundle.getText("restoreDroppingTable", [targetTable]))
      await db.statementExecPromisified(
        await db.preparePromisified(`DROP TABLE "${targetSchema}"."${targetTable}"`),
        []
      )
    } else if (!options.overwrite) {
      throw new Error(base.bundle.getText("restoreTableExists", [targetTable]))
    }
  }

  // Create table if it doesn't exist and we have metadata
  if (metadata && metadata.columns && tableExists[0].COUNT === 0) {
    console.log(base.bundle.getText("restoreCreatingTable", [targetTable]))
    const createTableSQL = generateCreateTableSQL(targetSchema, targetTable, metadata.columns)
    await db.statementExecPromisified(await db.preparePromisified(createTableSQL), [])
  }

  // Insert data
  let recordsInserted = 0
  if (backupData.data && backupData.data.length > 0) {
    console.log(base.bundle.getText("restoreInsertingRecords", [backupData.data.length]))
    
    // Truncate if overwrite is enabled
    if (options.overwrite && tableExists[0].COUNT > 0) {
      await db.statementExecPromisified(
        await db.preparePromisified(`TRUNCATE TABLE "${targetSchema}"."${targetTable}"`),
        []
      )
    }

    // Insert in batches
    const columns = Object.keys(backupData.data[0])
    const placeholders = columns.map(() => '?').join(', ')
    const insertSQL = `INSERT INTO "${targetSchema}"."${targetTable}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`
    const insertStmt = await db.preparePromisified(insertSQL)

    for (let i = 0; i < backupData.data.length; i += options.batchSize) {
      const batch = backupData.data.slice(i, i + options.batchSize)
      for (const row of batch) {
        try {
          const values = columns.map(col => row[col])
          await db.statementExecPromisified(insertStmt, values)
          recordsInserted++
        } catch (error) {
          if (!options.continueOnError) {
            throw error
          }
          console.warn(base.bundle.getText("restoreRecordFailed", [i, error.message]))
        }
      }
      console.log(base.bundle.getText("restoreProgress", [recordsInserted, backupData.data.length]))
    }
  }

  return {
    status: 'completed',
    schema: targetSchema,
    table: targetTable,
    recordsInserted: recordsInserted,
    completedAt: new Date().toISOString()
  }
}

/**
 * Restore entire schema
 * @param {object} db - Database connection
 * @param {string} backupPath - Backup file path
 * @param {object} metadata - Backup metadata
 * @param {object} options - Restore options
 * @returns {Promise<object>} - Restore result
 */
async function restoreSchema(db, backupPath, metadata, options) {
  const base = await import('../utils/base.js')
  
  // Load schema manifest
  const manifestPath = `${backupPath}.manifest.json`
  if (!fs.existsSync(manifestPath)) {
    throw new Error(base.bundle.getText("restoreManifestNotFound", [manifestPath]))
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const targetSchema = options.schema || manifest.schema

  console.log(base.bundle.getText("restoreSchemaStarting", [manifest.tables.length, targetSchema]))

  let results = []
  for (const tableInfo of manifest.tables) {
    console.log(base.bundle.getText("restoreTableProgress", [tableInfo.name]))
    
    try {
      const tableBackupPath = tableInfo.backupPath
      const tableMetadataPath = `${tableBackupPath}.meta.json`
      const tableMetadata = fs.existsSync(tableMetadataPath)
        ? JSON.parse(fs.readFileSync(tableMetadataPath, 'utf8'))
        : null

      const result = await restoreTable(db, tableBackupPath, tableMetadata, {
        ...options,
        schema: targetSchema,
        target: tableInfo.name
      })
      results.push({ table: tableInfo.name, status: 'completed', ...result })
    } catch (error) {
      if (!options.continueOnError) {
        throw error
      }
      console.warn(base.bundle.getText("restoreTableSkipped", [tableInfo.name, error.message]))
      results.push({ table: tableInfo.name, status: 'failed', error: error.message })
    }
  }

  return {
    status: 'completed',
    schema: targetSchema,
    tablesRestored: results.filter(r => r.status === 'completed').length,
    tablesFailed: results.filter(r => r.status === 'failed').length,
    results: results
  }
}

/**
 * Restore entire database
 * @param {object} db - Database connection
 * @param {string} backupPath - Backup file path
 * @param {object} metadata - Backup metadata
 * @param {object} options - Restore options
 * @returns {Promise<object>} - Restore result
 */
async function restoreDatabase(db, backupPath, metadata, options) {
  const base = await import('../utils/base.js')
  
  // Load database manifest
  const manifestPath = `${backupPath}.manifest.json`
  if (!fs.existsSync(manifestPath)) {
    throw new Error(base.bundle.getText("restoreManifestNotFound", [manifestPath]))
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  
  console.log(base.bundle.getText("restoreDatabaseStarting", [manifest.schemas.length]))

  let results = []
  for (const schemaInfo of manifest.schemas) {
    if (schemaInfo.status === 'failed') {
      console.log(base.bundle.getText("restoreSchemaSkipped", [schemaInfo.name, 'Schema was not backed up']))
      continue
    }

    console.log(base.bundle.getText("restoreSchemaProgress", [schemaInfo.name]))
    
    try {
      const schemaBackupPath = schemaInfo.backupPath
      const schemaMetadata = { schema: schemaInfo.name }
      
      const result = await restoreSchema(db, schemaBackupPath, schemaMetadata, {
        ...options,
        schema: schemaInfo.name
      })
      results.push({ schema: schemaInfo.name, status: 'completed', ...result })
    } catch (error) {
      if (!options.continueOnError) {
        throw error
      }
      console.warn(base.bundle.getText("restoreSchemaFailed", [schemaInfo.name, error.message]))
      results.push({ schema: schemaInfo.name, status: 'failed', error: error.message })
    }
  }

  return {
    status: 'completed',
    schemasRestored: results.filter(r => r.status === 'completed').length,
    schemasFailed: results.filter(r => r.status === 'failed').length,
    results: results
  }
}

/**
 * Generate CREATE TABLE SQL from column metadata
 * @param {string} schema - Schema name
 * @param {string} tableName - Table name
 * @param {Array} columns - Column metadata array
 * @returns {string} - CREATE TABLE SQL statement
 */
function generateCreateTableSQL(schema, tableName, columns) {
  const columnDefs = columns.map(col => {
    let def = `"${col.COLUMN_NAME}" ${col.DATA_TYPE_NAME}`
    
    if (col.LENGTH) {
      def += `(${col.LENGTH}`
      if (col.SCALE) {
        def += `,${col.SCALE}`
      }
      def += ')'
    }
    
    if (col.IS_NULLABLE === 'FALSE') {
      def += ' NOT NULL'
    }
    
    if (col.DEFAULT_VALUE) {
      def += ` DEFAULT ${col.DEFAULT_VALUE}`
    }
    
    return def
  }).join(', ')

  return `CREATE TABLE "${schema}"."${tableName}" (${columnDefs})`
}

/**
 * Parse CSV content to array of objects
 * @param {string} csvContent - CSV content
 * @returns {Array} - Array of row objects
 */
function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim())
  if (lines.length === 0) return []
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index]
    })
    rows.push(row)
  }
  
  return rows
}
