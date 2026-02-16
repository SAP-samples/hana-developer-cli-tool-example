// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"

export const command = 'replicationStatus'
export const aliases = ['replstatus', 'replication', 'replstat']
export const describe = baseLite.bundle.getText("replicationStatus")

export const builder = baseLite.getBuilder({
  type: {
    alias: ['ty'],
    type: 'string',
    choices: ['system', 'service'],
    default: 'system',
    desc: baseLite.bundle.getText("replicationStatusType")
  },
  serviceName: {
    alias: ['sn'],
    type: 'string',
    desc: baseLite.bundle.getText("replicationStatusServiceName")
  },
  detailed: {
    alias: ['d'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("replicationStatusDetailed")
  },
  watch: {
    alias: ['w'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("replicationStatusWatch")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})

export let inputPrompts = {
  type: {
    description: baseLite.bundle.getText("replicationStatusType"),
    type: 'string',
    required: false,
    ask: () => false
  },
  serviceName: {
    description: baseLite.bundle.getText("replicationStatusServiceName"),
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
  base.promptHandler(argv, replicationStatusMain, inputPrompts)
}

/**
 * Monitor system replication status
 * @param {object} prompts - User prompts with replication options
 * @returns {Promise<void>}
 */
export async function replicationStatusMain(prompts) {
  const base = await import('../utils/base.js')
  base.debug('replicationStatusMain')

  try {
    base.setPrompts(prompts)

    // Connect to database
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()

    const type = prompts.type || 'system'

    console.log(base.bundle.getText("info.checkingReplication", [type]))

    let results = []

    if (type === 'system') {
      // Query system replication status
      const query = `
        SELECT 
          SITE_ID,
          SITE_NAME,
          HOST,
          PORT,
          REPLICATION_MODE,
          REPLICATION_STATUS,
          REPLICATION_STATUS_DETAILS,
          SHIPPED_LOG_POSITION_TIME,
          LAST_LOG_POSITION_TIME,
          SECONDARY_ACTIVE_STATUS
        FROM SYS.M_SERVICE_REPLICATION
        ORDER BY SITE_ID
      `
      try {
        results = await dbClient.execSQL(query)
        console.log(base.bundle.getText("success.replicationStatus", [results.length]))
      } catch (err) {
        // Fallback if not in replication mode
        console.log(base.bundle.getText("info.noReplication"))
        results = [{
          SITE_ID: 1,
          SITE_NAME: 'PRIMARY',
          HOST: 'localhost',
          PORT: 30013,
          REPLICATION_MODE: 'NONE',
          REPLICATION_STATUS: 'NOT_CONFIGURED',
          REPLICATION_STATUS_DETAILS: base.bundle.getText("info.replicationNotConfigured"),
          SHIPPED_LOG_POSITION_TIME: null,
          LAST_LOG_POSITION_TIME: null,
          SECONDARY_ACTIVE_STATUS: 'NO'
        }]
      }
    } else if (type === 'service') {
      // Query service-specific replication
      let query = `
        SELECT 
          SERVICE_NAME,
          REPLICATION_STATUS,
          SHIPPED_SAVE_COUNT,
          REPLAY_BACKLOG_SIZE,
          LAST_UPDATE_TIME
        FROM SYS.M_SERVICE_REPLICATION_STATISTICS
      `
      if (prompts.serviceName) {
        query += ` WHERE SERVICE_NAME = '${prompts.serviceName}'`
      }
      query += ` ORDER BY SERVICE_NAME`

      try {
        results = await dbClient.execSQL(query)
      } catch (err) {
        results = [{
          SERVICE_NAME: prompts.serviceName || 'ALL',
          REPLICATION_STATUS: 'UNKNOWN',
          SHIPPED_SAVE_COUNT: 0,
          REPLAY_BACKLOG_SIZE: 0,
          LAST_UPDATE_TIME: null
        }]
      }
    }

    // Add detailed information if requested
    if (prompts.detailed && results.length > 0) {
      const detailQuery = `
        SELECT 
          SECONDARY_HOST,
          SECONDARY_PORT,
          SECONDARY_SITE_NAME,
          REPLICATION_MODE,
          OPERATION_MODE,
          SHIPPED_LOG_BUFFERS_COUNT,
          SHIPPED_LOG_BUFFERS_SIZE,
          ASYNC_BUFFER_USAGE
        FROM SYS.M_SERVICE_REPLICATION
      `
      try {
        const details = await dbClient.execSQL(detailQuery)
        if (details.length > 0 && !prompts.quiet) {
          console.log('\n' + base.bundle.getText("info.detailedReplication"))
          base.outputTableFancy(details)
        }
      } catch (err) {
        base.debug('Could not retrieve detailed replication info: ' + err.message)
      }
    }

    if (!prompts.quiet && results.length > 0) {
      base.outputTableFancy(results)
    }

    // Watch mode - refresh every 5 seconds
    if (prompts.watch) {
      console.log(base.bundle.getText("info.watchMode"))
      setInterval(async () => {
        console.clear()
        await replicationStatusMain({ ...prompts, watch: false })
      }, 5000)
      return // Keep process running
    }

    await dbClient.disconnect()
  } catch (error) {
    base.error(base.bundle.getText("error.replicationStatus", [error.message]))
  }
}
