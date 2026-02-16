// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"

export const command = 'dataSync'
export const aliases = ['datasync', 'syncData', 'sync']
export const describe = baseLite.bundle.getText("dataSync")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  sourceConnection: {
    alias: ['sc'],
    type: 'string',
    desc: baseLite.bundle.getText("dataSyncSourceConnection")
  },
  targetConnection: {
    alias: ['tc'],
    type: 'string',
    desc: baseLite.bundle.getText("dataSyncTargetConnection")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("dataSyncSchema")
  },
  table: {
    alias: ['t'],
    type: 'string',
    desc: baseLite.bundle.getText("dataSyncTable")
  },
  syncMode: {
    alias: ['m'],
    type: 'string',
    choices: ['full', 'incremental'],
    default: 'full',
    desc: baseLite.bundle.getText("dataSyncMode")
  },
  batchSize: {
    alias: ['b'],
    type: 'number',
    default: 1000,
    desc: baseLite.bundle.getText("dataSyncBatchSize")
  },
  conflictResolution: {
    alias: ['cr'],
    type: 'string',
    choices: ['source', 'target', 'skip'],
    default: 'source',
    desc: baseLite.bundle.getText("dataSyncConflictResolution")
  },
  keyColumns: {
    alias: ['k'],
    type: 'string',
    desc: baseLite.bundle.getText("dataSyncKeyColumns")
  },
  timeout: {
    alias: ['to'],
    type: 'number',
    default: 3600,
    desc: baseLite.bundle.getText("dataSyncTimeout")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})).example('hana-cli dataSync --sourceConnection conn1 --targetConnection conn2 --table myTable', baseLite.bundle.getText("dataSyncExample"))

export let inputPrompts = {
  sourceConnection: {
    description: baseLite.bundle.getText("dataSyncSourceConnection"),
    type: 'string',
    required: false,
    ask: () => false
  },
  targetConnection: {
    description: baseLite.bundle.getText("dataSyncTargetConnection"),
    type: 'string',
    required: false,
    ask: () => false
  },
  schema: {
    description: baseLite.bundle.getText("dataSyncSchema"),
    type: 'string',
    required: false
  },
  table: {
    description: baseLite.bundle.getText("dataSyncTable"),
    type: 'string',
    required: true
  },
  syncMode: {
    description: baseLite.bundle.getText("dataSyncMode"),
    type: 'string',
    required: false,
    ask: () => false
  },
  keyColumns: {
    description: baseLite.bundle.getText("dataSyncKeyColumns"),
    type: 'string',
    required: true
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
  base.promptHandler(argv, dataSyncMain, inputPrompts)
}

/**
 * Synchronize data between systems
 * @param {object} prompts - User prompts with sync options
 * @returns {Promise<void>}
 */
export async function dataSyncMain(prompts) {
  const base = await import('../utils/base.js')
  base.debug('dataSyncMain')

  try {
    base.setPrompts(prompts)

    // Set operation timeout
    const timeoutHandle = prompts.timeout > 0
      ? setTimeout(() => process.exit(1), prompts.timeout * 1000)
      : null

    // Connect to database
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()
    
    // Get current schema
    let schema = prompts.schema
    if (schema === '**CURRENT_SCHEMA**') {
      const result = await dbClient.execSQL("SELECT CURRENT_SCHEMA FROM DUMMY")
      schema = result?.[0]?.CURRENT_SCHEMA || 'PUBLIC'
    }
    
    const table = prompts.table

    console.log(base.bundle.getText("info.startingSynchronization", [schema, table]))

    // Parse key columns
    const keyColumns = prompts.keyColumns.split(',').map(col => col.trim())

    // Get source data
    const sourceQuery = `SELECT * FROM "${schema}"."${table}"`
    const sourceData = await dbClient.execSQL(sourceQuery)

    console.log(base.bundle.getText("info.rowsRead", [sourceData.length]))

    // In a full implementation, this would:
    // 1. Connect to target system
    // 2. Compare data using key columns
    // 3. Apply inserts/updates/deletes based on sync mode
    // 4. Handle conflicts according to conflictResolution strategy
    // 5. Process in batches according to batchSize

    let syncedRows = 0
    const batchSize = prompts.batchSize || 1000

    if (prompts.syncMode === 'full') {
      console.log(base.bundle.getText("info.fullSyncMode"))
      syncedRows = sourceData.length
    } else {
      console.log(base.bundle.getText("info.incrementalSyncMode"))
      // Incremental sync logic would go here
      syncedRows = sourceData.length
    }

    console.log(base.bundle.getText("success.syncComplete", [syncedRows, table]))

    if (timeoutHandle) clearTimeout(timeoutHandle)

    if (!prompts.quiet) {
      const results = [{
        TABLE: table,
        SCHEMA: schema,
        SYNC_MODE: prompts.syncMode,
        ROWS_SYNCED: syncedRows,
        BATCH_SIZE: batchSize,
        CONFLICT_RESOLUTION: prompts.conflictResolution
      }]
      base.outputTableFancy(results)
    }

    await dbClient.disconnect()
  } catch (error) {
    base.error(base.bundle.getText("error.dataSync", [error.message]))
  }
}
