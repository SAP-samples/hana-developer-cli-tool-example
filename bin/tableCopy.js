// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"

export const command = 'tableCopy'
export const aliases = ['tablecopy', 'copyTable', 'copytable']
export const describe = baseLite.bundle.getText("tableCopy")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  sourceTable: {
    alias: ['st'],
    type: 'string',
    desc: baseLite.bundle.getText("tableCopySourceTable")
  },
  targetTable: {
    alias: ['tt'],
    type: 'string',
    desc: baseLite.bundle.getText("tableCopyTargetTable")
  },
  sourceSchema: {
    alias: ['ss'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("tableCopySourceSchema")
  },
  targetSchema: {
    alias: ['ts'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("tableCopyTargetSchema")
  },
  structureOnly: {
    alias: ['so'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("tableCopyStructureOnly")
  },
  dataOnly: {
    alias: ['do'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("tableCopyDataOnly")
  },
  where: {
    alias: ['w'],
    type: 'string',
    desc: baseLite.bundle.getText("tableCopyWhere")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    desc: baseLite.bundle.getText("tableCopyLimit")
  },
  batchSize: {
    alias: ['b', 'batch'],
    type: 'number',
    default: 1000,
    desc: baseLite.bundle.getText("tableCopyBatchSize")
  },
  dryRun: {
    alias: ['dr', 'preview'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("dryRun")
  },
  timeout: {
    alias: ['to'],
    type: 'number',
    default: 3600,
    desc: baseLite.bundle.getText("tableCopyTimeout")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})).example('hana-cli tableCopy --sourceTable src_table --targetTable tgt_table --batchSize 1000', baseLite.bundle.getText("tableCopyExample"))

export let inputPrompts = {
  sourceTable: {
    description: baseLite.bundle.getText("tableCopySourceTable"),
    type: 'string',
    required: true
  },
  targetTable: {
    description: baseLite.bundle.getText("tableCopyTargetTable"),
    type: 'string',
    required: true
  },
  sourceSchema: {
    description: baseLite.bundle.getText("tableCopySourceSchema"),
    type: 'string',
    required: false
  },
  targetSchema: {
    description: baseLite.bundle.getText("tableCopyTargetSchema"),
    type: 'string',
    required: false
  },
  structureOnly: {
    description: baseLite.bundle.getText("tableCopyStructureOnly"),
    type: 'boolean',
    required: false,
    ask: () => false
  },
  dataOnly: {
    description: baseLite.bundle.getText("tableCopyDataOnly"),
    type: 'boolean',
    required: false,
    ask: () => false
  },
  profile: {
    description: baseLite.bundle.getText("profile"),
    type: 'string',
    required: false,
    ask: () => { }
  },
  dryRun: {
    description: baseLite.bundle.getText("dryRun"),
    type: 'boolean',
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
  base.promptHandler(argv, tableCopyMain, inputPrompts)
}

/**
 * Copy table structure and/or data
 * @param {object} prompts - User prompts with copy options
 * @returns {Promise<void>}
 */
export async function tableCopyMain(prompts) {
  const base = await import('../utils/base.js')
  base.debug('tableCopyMain')

  try {
    base.setPrompts(prompts)

    // Set operation timeout
    const timeoutHandle = prompts.timeout > 0
      ? setTimeout(() => process.exit(1), prompts.timeout * 1000)
      : null

    // Connect to database
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()

    // Get current schema if using **CURRENT_SCHEMA**
    let sourceSchema = prompts.sourceSchema
    let targetSchema = prompts.targetSchema

    if (sourceSchema === '**CURRENT_SCHEMA**') {
      const result = await dbClient.execSQL("SELECT CURRENT_SCHEMA FROM DUMMY")
      sourceSchema = result?.[0]?.CURRENT_SCHEMA || 'PUBLIC'
    }

    if (targetSchema === '**CURRENT_SCHEMA**') {
      const result = await dbClient.execSQL("SELECT CURRENT_SCHEMA FROM DUMMY")
      targetSchema = result?.[0]?.CURRENT_SCHEMA || sourceSchema
    }

    const sourceTable = prompts.sourceTable
    const targetTable = prompts.targetTable

    console.log(base.bundle.getText("info.startingTableCopy", [
      `${sourceSchema}.${sourceTable}`,
      `${targetSchema}.${targetTable}`
    ]))

    // Check if source table exists
    const tableCheckQuery = `
      SELECT TABLE_NAME 
      FROM SYS.TABLES 
      WHERE SCHEMA_NAME = ? AND TABLE_NAME = ?
    `
    const sourceExists = await dbClient.execSQL(tableCheckQuery, [sourceSchema, sourceTable])
    
    if (sourceExists.length === 0) {
      throw new Error(base.bundle.getText("error.sourceTableNotFound", [sourceSchema, sourceTable]))
    }

    let structureCopied = false
    let rowsCopied = 0

    // Copy structure (unless dataOnly mode)
    if (!prompts.dataOnly) {
      console.log(base.bundle.getText("info.copyingStructure"))

      // Check if target table exists
      const targetExists = await dbClient.execSQL(tableCheckQuery, [targetSchema, targetTable])
      
      if (targetExists.length > 0) {
        console.log(base.bundle.getText("info.targetTableExists", [targetSchema, targetTable]))
        
        if (prompts.structureOnly) {
          throw new Error(base.bundle.getText("error.targetTableAlreadyExists"))
        }
      } else {
        // Create table structure
        const createStmt = `CREATE TABLE "${targetSchema}"."${targetTable}" LIKE "${sourceSchema}"."${sourceTable}"`
        await dbClient.execSQL(createStmt)
        structureCopied = true
        console.log(base.bundle.getText("success.structureCopied"))
      }
    }

    // Copy data (unless structureOnly mode)
    if (!prompts.structureOnly) {
      console.log(base.bundle.getText("info.copyingData"))

      // Build SELECT query with optional WHERE and LIMIT
      let selectQuery = `SELECT * FROM "${sourceSchema}"."${sourceTable}"`
      
      if (prompts.where) {
        selectQuery += ` WHERE ${prompts.where}`
      }
      
      if (prompts.limit) {
        selectQuery += ` LIMIT ${prompts.limit}`
      }

      // Get source data
      const sourceData = await dbClient.execSQL(selectQuery)
      console.log(base.bundle.getText("info.rowsRead", [sourceData.length]))

      if (sourceData.length > 0) {
        // Get column names
        const columnsQuery = `
          SELECT COLUMN_NAME 
          FROM SYS.TABLE_COLUMNS 
          WHERE SCHEMA_NAME = ? AND TABLE_NAME = ?
          ORDER BY POSITION
        `
        const columns = await dbClient.execSQL(columnsQuery, [sourceSchema, sourceTable])
        const columnNames = columns.map(c => c.COLUMN_NAME)

        // Insert data in batches
        const batchSize = prompts.batchSize || 1000
        const totalRows = sourceData.length
        let processedRows = 0

        for (let i = 0; i < totalRows; i += batchSize) {
          const batch = sourceData.slice(i, Math.min(i + batchSize, totalRows))
          
          // Build INSERT statement
          const columnList = columnNames.map(c => `"${c}"`).join(', ')
          const valuePlaceholders = columnNames.map(() => '?').join(', ')
          const insertStmt = `INSERT INTO "${targetSchema}"."${targetTable}" (${columnList}) VALUES (${valuePlaceholders})`

          // Insert batch
          for (const row of batch) {
            const values = columnNames.map(col => row[col])
            await dbClient.execSQL(insertStmt, values)
            processedRows++
          }

          console.log(base.bundle.getText("info.processedRows", [processedRows, totalRows]))
        }

        rowsCopied = processedRows
        console.log(base.bundle.getText("success.dataCopied", [rowsCopied]))
      }
    }

    console.log(base.bundle.getText("success.tableCopyComplete", [
      sourceTable,
      targetTable,
      rowsCopied
    ]))

    if (timeoutHandle) clearTimeout(timeoutHandle)

    if (!prompts.quiet) {
      const summary = [{
        SOURCE: `${sourceSchema}.${sourceTable}`,
        TARGET: `${targetSchema}.${targetTable}`,
        STRUCTURE_COPIED: structureCopied ? 'YES' : 'NO',
        ROWS_COPIED: rowsCopied,
        MODE: prompts.structureOnly ? 'STRUCTURE_ONLY' : 
              prompts.dataOnly ? 'DATA_ONLY' : 'BOTH',
        WHERE_FILTER: prompts.where || 'NONE',
        LIMIT_APPLIED: prompts.limit || 'NONE'
      }]
      base.outputTableFancy(summary)
    }

    await dbClient.disconnect()
  } catch (error) {
    base.error(base.bundle.getText("error.tableCopy", [error.message]))
  }
}
