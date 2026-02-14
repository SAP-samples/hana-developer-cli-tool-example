// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'backupStatus'
export const aliases = ['bstatus', 'backupstate', 'bkpstatus']
export const describe = baseLite.bundle.getText("backupStatus")

export const builder = baseLite.getBuilder({
  catalogOnly: {
    alias: ['co', 'CatalogOnly'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("backupStatusCatalogOnly")
  },
  limit: {
    alias: ['l', 'Limit'],
    type: 'number',
    default: 20,
    desc: baseLite.bundle.getText("limit")
  },
  backupType: {
    alias: ['type', 'Type'],
    choices: ["complete", "data", "log", "incremental", "differential", "all"],
    default: "all",
    type: 'string',
    desc: baseLite.bundle.getText("backupStatusType")
  },
  status: {
    alias: ['st', 'Status'],
    choices: ["successful", "running", "failed", "canceled", "all"],
    default: "all",
    type: 'string',
    desc: baseLite.bundle.getText("backupStatusState")
  },
  days: {
    alias: ['d', 'Days'],
    type: 'number',
    default: 7,
    desc: baseLite.bundle.getText("backupStatusDays")
  }
})

export let inputPrompts = {
  catalogOnly: {
    description: baseLite.bundle.getText("backupStatusCatalogOnly"),
    type: 'boolean',
    required: false
  },
  limit: {
    description: baseLite.bundle.getText("limit"),
    type: 'number',
    required: false
  },
  backupType: {
    description: baseLite.bundle.getText("backupStatusType"),
    type: 'string',
    required: false
  },
  status: {
    description: baseLite.bundle.getText("backupStatusState"),
    type: 'string',
    required: false
  },
  days: {
    description: baseLite.bundle.getText("backupStatusDays"),
    type: 'number',
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
  base.promptHandler(argv, getBackupStatus, inputPrompts)
}

/**
 * Get backup and recovery status from database
 * @param {object} prompts - Input prompts with status query configuration
 * @returns {Promise<object>} - Backup status information
 */
export async function getBackupStatus(prompts) {
  const base = await import('../utils/base.js')
  const dbClientModule = await import("../utils/database/index.js")
  const dbClientClass = dbClientModule.default

  try {
    base.debug('getBackupStatus')
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()
    const db = dbClient.getDB()

    console.log(base.bundle.getText("backupStatusChecking"))

    // Query backup catalog
    let backupCatalogQuery = `
      SELECT 
        BACKUP_ID,
        ENTRY_TYPE_NAME,
        SYS_START_TIME,
        SYS_END_TIME,
        STATE_NAME,
        COMMENT,
        MESSAGE,
        BACKUP_SIZE,
        BACKUP_SIZE_COMPRESSED,
        DESTINATION_TYPE_NAME
      FROM M_BACKUP_CATALOG
      WHERE SYS_START_TIME >= ADD_DAYS(CURRENT_TIMESTAMP, -${prompts.days})
    `

    // Add type filter
    if (prompts.backupType && prompts.backupType !== 'all') {
      const typeMap = {
        'complete': 'complete data backup',
        'data': 'data backup',
        'log': 'log backup',
        'incremental': 'incremental',
        'differential': 'differential'
      }
      const typeFilter = typeMap[prompts.backupType] || prompts.backupType
      backupCatalogQuery += ` AND ENTRY_TYPE_NAME LIKE '%${typeFilter}%'`
    }

    // Add status filter
    if (prompts.status && prompts.status !== 'all') {
      backupCatalogQuery += ` AND STATE_NAME = '${prompts.status}'`
    }

    backupCatalogQuery += ` ORDER BY SYS_START_TIME DESC`
    
    if (prompts.limit) {
      backupCatalogQuery += ` LIMIT ${prompts.limit}`
    }

    const backupCatalog = await db.statementExecPromisified(
      await db.preparePromisified(backupCatalogQuery),
      []
    )

    // Get backup progress for running backups
    const progressQuery = `
      SELECT 
        HOST,
        PORT,
        BACKUP_ID,
        SERVICE_NAME,
        STATE_NAME,
        START_TIME,
        COMMENT,
        PROGRESS_PERCENTAGE,
        ACTIVE_PHASE,
        CURRENT_SIZE,
        EXPECTED_SIZE
      FROM M_BACKUP_PROGRESS
      WHERE STATE_NAME = 'running'
    `

    let backupProgress = []
    try {
      backupProgress = await db.statementExecPromisified(
        await db.preparePromisified(progressQuery),
        []
      )
    } catch (error) {
      // M_BACKUP_PROGRESS might not be accessible
      console.warn(base.bundle.getText("backupStatusProgressUnavailable"))
    }

    // Get backup configuration
    let backupConfig = []
    try {
      const configQuery = `
        SELECT 
          KEY,
          VALUE,
          LAYER_NAME,
          SECTION
        FROM M_INIFILE_CONTENTS
        WHERE FILE_NAME = 'global.ini'
          AND SECTION = 'backup'
      `
      backupConfig = await db.statementExecPromisified(
        await db.preparePromisified(configQuery),
        []
      )
    } catch (error) {
      console.warn(base.bundle.getText("backupStatusConfigUnavailable"))
    }

    // Get last successful backup
    const lastSuccessfulQuery = `
      SELECT 
        MAX(SYS_END_TIME) as LAST_SUCCESSFUL_BACKUP,
        ENTRY_TYPE_NAME
      FROM M_BACKUP_CATALOG
      WHERE STATE_NAME = 'successful'
      GROUP BY ENTRY_TYPE_NAME
    `

    let lastSuccessful = []
    try {
      lastSuccessful = await db.statementExecPromisified(
        await db.preparePromisified(lastSuccessfulQuery),
        []
      )
    } catch (error) {
      console.warn(base.bundle.getText("backupStatusLastSuccessfulUnavailable"))
    }

    // Format and display results
    console.log(`\n${base.bundle.getText("backupStatusSummary")}`)
    console.log('='.repeat(80))

    // Display last successful backups
    if (lastSuccessful.length > 0) {
      console.log(`\n${base.bundle.getText("backupStatusLastSuccessful")}:`)
      const lastSuccessfulFormatted = lastSuccessful.map(b => ({
        TYPE: b.ENTRY_TYPE_NAME,
        LAST_BACKUP: b.LAST_SUCCESSFUL_BACKUP ? new Date(b.LAST_SUCCESSFUL_BACKUP).toLocaleString() : 'Never'
      }))
      base.outputTableFancy(lastSuccessfulFormatted)
    }

    // Display running backups
    if (backupProgress.length > 0) {
      console.log(`\n${base.bundle.getText("backupStatusRunning", [backupProgress.length])}:`)
      const progressFormatted = backupProgress.map(p => ({
        BACKUP_ID: p.BACKUP_ID,
        SERVICE: p.SERVICE_NAME,
        PHASE: p.ACTIVE_PHASE,
        PROGRESS: `${p.PROGRESS_PERCENTAGE}%`,
        SIZE: formatBytes(p.CURRENT_SIZE || 0),
        EXPECTED: formatBytes(p.EXPECTED_SIZE || 0),
        STARTED: p.START_TIME ? new Date(p.START_TIME).toLocaleString() : '-'
      }))
      base.outputTableFancy(progressFormatted)
    } else {
      console.log(`\n${base.bundle.getText("backupStatusNoRunning")}`)
    }

    // Display recent backups
    if (backupCatalog.length > 0) {
      console.log(`\n${base.bundle.getText("backupStatusRecent", [backupCatalog.length])}:`)
      const catalogFormatted = backupCatalog.map(b => ({
        BACKUP_ID: b.BACKUP_ID,
        TYPE: b.ENTRY_TYPE_NAME,
        START_TIME: b.SYS_START_TIME ? new Date(b.SYS_START_TIME).toLocaleString() : '-',
        END_TIME: b.SYS_END_TIME ? new Date(b.SYS_END_TIME).toLocaleString() : '-',
        STATUS: b.STATE_NAME,
        SIZE: formatBytes(b.BACKUP_SIZE || 0),
        COMPRESSED: formatBytes(b.BACKUP_SIZE_COMPRESSED || 0),
        DESTINATION: b.DESTINATION_TYPE_NAME,
        MESSAGE: b.MESSAGE ? (b.MESSAGE.length > 50 ? b.MESSAGE.substring(0, 50) + '...' : b.MESSAGE) : '-'
      }))
      base.outputTableFancy(catalogFormatted)
    } else {
      console.log(`\n${base.bundle.getText("backupStatusNoRecent")}`)
    }

    // Display backup configuration if not catalog-only
    if (!prompts.catalogOnly && backupConfig.length > 0) {
      console.log(`\n${base.bundle.getText("backupStatusConfiguration")}:`)
      const configFormatted = backupConfig.map(c => ({
        KEY: c.KEY,
        VALUE: c.VALUE,
        LAYER: c.LAYER_NAME
      }))
      base.outputTableFancy(configFormatted)
    }

    console.log('\n' + '='.repeat(80))

    // Return summary
    const summary = {
      lastSuccessful: lastSuccessful,
      runningBackups: backupProgress.length,
      recentBackups: backupCatalog.length,
      successfulBackups: backupCatalog.filter(b => b.STATE_NAME === 'successful').length,
      failedBackups: backupCatalog.filter(b => b.STATE_NAME === 'failed').length,
      configuration: backupConfig
    }

    await dbClient.disconnect()
    return summary

  } catch (error) {
    console.error(base.bundle.getText("backupStatusFailed", [error.message]))
    // Provide helpful message if user lacks privileges
    if (error.message.includes('insufficient privilege')) {
      console.log('\n' + base.bundle.getText("backupStatusPrivilegeNote"))
    }
    throw error
  }
}

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
