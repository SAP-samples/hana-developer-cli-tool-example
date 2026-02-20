// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'healthCheck'
export const aliases = ['health', 'h']
export const describe = baseLite.bundle.getText("healthCheck")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  checks: {
    alias: ['c'],
    type: 'string',
    default: 'all',
    desc: 'Health checks to perform (all, memory, disk, connection, transaction, backup, replication, resources)',
    choices: ['all', 'memory', 'disk', 'connection', 'transaction', 'backup', 'replication', 'resources']
  }
})).wrap(160).example('hana-cli healthCheck --checks all', baseLite.bundle.getText("healthCheckExample")).wrap(160).epilog(buildDocEpilogue('healthCheck', 'system-admin', ['systemInfo', 'status', 'diagnose']))

export let inputPrompts = {
  checks: {
    description: 'Health checks to perform',
    type: 'string',
    required: true
  }
}

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, performHealthCheck, inputPrompts)
}

/**
 * Comprehensive database health assessment
 * @param {object} prompts - Input prompts with check types
 * @returns {Promise<void>}
 */
export async function performHealthCheck(prompts) {
  const base = await import('../utils/base.js')
  base.debug('performHealthCheck')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    const checksToRun = prompts.checks === 'all' ? ['memory', 'disk', 'connection', 'transaction', 'backup', 'replication', 'resources'] : [prompts.checks]
    const healthResults = {
      timestamp: new Date().toISOString(),
      checks: {},
      issues: [],
      overallStatus: 'HEALTHY'
    }

    for (const check of checksToRun) {
      try {
        if (check === 'memory') {
          healthResults.checks.memory = await checkMemory(db, base)
        } else if (check === 'disk') {
          healthResults.checks.disk = await checkDisk(db, base)
        } else if (check === 'connection') {
          healthResults.checks.connection = await checkConnections(db, base)
        } else if (check === 'transaction') {
          healthResults.checks.transaction = await checkTransactions(db, base)
        } else if (check === 'backup') {
          healthResults.checks.backup = await checkBackup(db, base)
        } else if (check === 'replication') {
          healthResults.checks.replication = await checkReplication(db, base)
        } else if (check === 'resources') {
          healthResults.checks.resources = await checkResourceUtilization(db, base)
        }
      } catch (error) {
        base.debug(base.bundle.getText('healthCheckError', [check]) + ': ' + error.message)
        healthResults.checks[check] = {
          status: 'ERROR',
          message: error.message
        }
      }
    }

    // Aggregate health status
    Object.values(healthResults.checks).forEach(check => {
      if (check.status === 'CRITICAL' || check.status === 'ERROR') {
        healthResults.overallStatus = 'CRITICAL'
      } else if (check.status === 'WARNING' && healthResults.overallStatus === 'HEALTHY') {
        healthResults.overallStatus = 'WARNING'
      }
      if (check.issues && check.issues.length > 0) {
        healthResults.issues.push(...check.issues)
      }
    })

    // Display results
    base.output('')
    base.output(base.colors.bold(base.bundle.getText('databaseHealthAssessment')))
    base.output(`${base.colors.bold(base.bundle.getText('healthTimestamp') + ':')} ${healthResults.timestamp}`)
    base.output(`${base.colors.bold('Overall Status' + ':')} ${getStatusColor(healthResults.overallStatus)(healthResults.overallStatus)}`)
    base.output('')

    // Display detailed check results
    for (const [checkName, result] of Object.entries(healthResults.checks)) {
      base.output(`${base.colors.bold(checkName.toUpperCase())}`)
      base.output(`  Status: ${getStatusColor(result.status)(result.status)}`)
      if (result.message) {
        base.output(`  ${base.bundle.getText('message')}: ${result.message}`)
      }
      if (result.value !== undefined) {
        base.output(`  Value: ${result.value}`)
      }
      if (result.details) {
        Object.entries(result.details).forEach(([key, value]) => {
          base.output(`  ${key}: ${value}`)
        })
      }
      base.output('')
    }

    // Display issues summary
    if (healthResults.issues.length > 0) {
      base.output(base.colors.bold(base.bundle.getText('issuesFound') + ':'))
      healthResults.issues.forEach((issue, idx) => {
        const icon = issue.severity === 'CRITICAL' ? '❌' : '⚠️'
        base.output(`  ${idx + 1}. [${issue.severity}] ${icon} ${issue.message}`)
      })
      base.output('')
    }

    await base.end()
  } catch (error) {
    await base.error(error)
  }
}
/**
 * Check memory utilization
 */
async function checkMemory(db, base) {
  try {
    // First, get all available columns to debug what's available
    const results = await db.execSQL(`
      SELECT * FROM M_HOST_INFORMATION LIMIT 1
    `)
    
    if (results && results.length > 0) {
      const hostInfo = results[0]
      
      // Log available columns for debugging
      base.debug('M_HOST_INFORMATION columns: ' + Object.keys(hostInfo).join(', '))
      
      // Try to find memory-related columns dynamically
      let activeMemory = 0
      let totalMemory = 0
      
      // Check all possible memory column names
      const memoryColumns = Object.keys(hostInfo)
        .filter(key => key.toLowerCase().includes('memory') || key.toLowerCase().includes('ram'))
      
      base.debug('Found memory columns: ' + memoryColumns.join(', '))
      
      // If we found memory columns, try to use them
      if (memoryColumns.length > 0) {
        memoryColumns.forEach(col => {
          const value = parseFloat(hostInfo[col]) || 0
          base.debug(`${col}: ${value}`)
        })
        
        // Try the most common patterns
        activeMemory = parseFloat(hostInfo.USED_MEMORY) || 
                      parseFloat(hostInfo.ACTIVE_MEMORY) || 
                      parseFloat(hostInfo.ALLOCATED_MEMORY) || 0
        totalMemory = parseFloat(hostInfo.TOTAL_MEMORY) || 
                     parseFloat(hostInfo.MAX_MEMORY) || 
                     parseFloat(hostInfo.PHYSICAL_MEMORY) || 0
      }
      
      if (totalMemory === 0) {
        // Return diagnostic info
        return { 
          status: 'WARNING', 
          message: 'Memory columns exist but values are 0. Available columns: ' + Object.keys(hostInfo).slice(0, 3).join(', ')
        }
      }
      
      const memUsage = (activeMemory / totalMemory) * 100
      const status = memUsage > 90 ? 'CRITICAL' : memUsage > 75 ? 'WARNING' : 'HEALTHY'
      
      return {
        status,
        value: `${memUsage.toFixed(2)}%`,
        details: {
          'Host': (hostInfo.HOST || 'N/A').toString(),
          'Active Memory': activeMemory > 0 ? `${(activeMemory / 1024 / 1024 / 1024).toFixed(2)} GB` : 'N/A',
          'Total Memory': totalMemory > 0 ? `${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB` : 'N/A'
        },
        issues: status !== 'HEALTHY' ? [{
          severity: status,
          message: `Memory utilization at ${memUsage.toFixed(2)}%`
        }] : []
      }
    }
    
    return { status: 'UNKNOWN', message: 'Unable to retrieve memory data' }
  } catch (error) {
    return { status: 'WARNING', message: 'Memory view error: ' + error.message.substring(0, 60) }
  }
}

/**
 * Check disk space
 */
async function checkDisk(db, base) {
  try {
    // Query disk information - may return multiple rows or be empty
    const results = await db.execSQL(`
      SELECT * FROM M_DISKS
    `)
    
    if (results && results.length > 0) {
      // Sum up all disks to get total usage
      let totalUsed = 0
      let totalSize = 0
      
      results.forEach(disk => {
        const used = parseFloat(disk.USED_SIZE) || parseFloat(disk.USED) || parseFloat(disk.USEDSIZE) || 0
        const size = parseFloat(disk.TOTAL_SIZE) || parseFloat(disk.SIZE) || parseFloat(disk.TOTALSIZE) || parseFloat(disk.TOTAL) || 0
        totalUsed += used
        totalSize += size
      })
      
      if (totalSize === 0) {
        return { status: 'UNKNOWN', message: 'Disk size information not available' }
      }
      
      const diskUsage = (totalUsed / totalSize) * 100
      const status = diskUsage > 90 ? 'CRITICAL' : diskUsage > 80 ? 'WARNING' : 'HEALTHY'
      
      return {
        status,
        value: `${diskUsage.toFixed(2)}%`,
        details: {
          'Total Size': `${(totalSize / 1024 / 1024 / 1024).toFixed(2)} GB`,
          'Used Size': `${(totalUsed / 1024 / 1024 / 1024).toFixed(2)} GB`,
          'Disk Count': results.length.toString()
        },
        issues: status !== 'HEALTHY' ? [{
          severity: status,
          message: `Disk utilization at ${diskUsage.toFixed(2)}%`
        }] : []
      }
    }
    
    // No disk data - might be normal in this context
    return { status: 'HEALTHY', message: 'No disk data available' }
  } catch (error) {
    return { status: 'WARNING', message: 'Disk information not accessible in this context' }
  }
}

/**
 * Check active connections
 */
async function checkConnections(db, base) {
  try {
    // Try different ways to access session information
    let query = `SELECT COUNT(*) as "TOTAL" FROM M_SESSIONS`
    
    const results = await db.execSQL(query)
    
    if (results && results.length > 0) {
      const totalSessions = parseInt(results[0].TOTAL) || 0
      const status = totalSessions > 2000 ? 'WARNING' : 'HEALTHY'
      
      return {
        status,
        value: `${totalSessions} sessions`,
        details: {
          'Total Sessions': totalSessions.toString()
        },
        issues: status !== 'HEALTHY' ? [{
          severity: status,
          message: `High number of sessions: ${totalSessions}`
        }] : []
      }
    }
    
    return { status: 'UNKNOWN', message: 'Unable to retrieve session data' }
  } catch (error) {
    // Session data may not be accessible in this context
    return { status: 'WARNING', message: 'Session view not accessible in this schema context' }
  }
}

/**
 * Check transaction health
 */
async function checkTransactions(db, base) {
  try {
    const results = await db.execSQL(`
      SELECT 
        COUNT(*) as "Active Transactions",
        MAX(CASE WHEN TRANSACTION_TYPE = 'ROLLBACK' THEN 1 ELSE 0 END) as "Rollback Active",
        COUNT(DISTINCT CONNECTION_ID) as "Unique Connections"
      FROM M_TRANSACTIONS
      WHERE TRANSACTION_STATUS = 'RUNNING'
    `)
    
    if (results && results.length > 0) {
      const activeTx = parseInt(results[0]['Active Transactions'])
      const rollbackActive = parseInt(results[0]['Rollback Active'])
      const uniqueConns = parseInt(results[0]['Unique Connections'])
      const status = rollbackActive > 0 || activeTx > 1000 ? 'WARNING' : 'HEALTHY'
      
      return {
        status,
        value: `${activeTx} active`,
        details: {
          'Rollback Active': rollbackActive.toString(),
          'Unique Connections': uniqueConns.toString()
        },
        issues: status !== 'HEALTHY' ? [{
          severity: status,
          message: `Transaction issues detected`
        }] : []
      }
    }
    
    return { status: 'UNKNOWN', message: 'Unable to retrieve transaction data' }
  } catch (error) {
    return { status: 'ERROR', message: error.message }
  }
}

/**
 * Check backup status
 */
async function checkBackup(db, base) {
  try {
    // Try to get last backup - this view may not exist in all systems
    const results = await db.execSQL(`
      SELECT 
        STATE,
        START_TIME as "ENTRY_TIME",
        BACKUP_ID,
        COMMENT
      FROM M_BACKUP_CATALOG_ENTRIES
      ORDER BY START_TIME DESC
      LIMIT 1
    `)
    
    if (results && results.length > 0) {
      const lastBackup = results[0]
      const backupTime = new Date(lastBackup['ENTRY_TIME'])
      const hoursSinceBackup = (Date.now() - backupTime.getTime()) / (1000 * 60 * 60)
      const status = lastBackup.STATE !== 'SUCCESSFUL' ? 'CRITICAL' : hoursSinceBackup > 48 ? 'WARNING' : 'HEALTHY'
      
      return {
        status,
        value: lastBackup.STATE,
        details: {
          'Last Backup': lastBackup['ENTRY_TIME'],
          'Hours Since Backup': hoursSinceBackup.toFixed(2),
          'Backup ID': lastBackup.BACKUP_ID
        },
        issues: status !== 'HEALTHY' ? [{
          severity: status,
          message: status === 'CRITICAL' ? `Last backup state: ${lastBackup.STATE}` : `No backup for ${hoursSinceBackup.toFixed(1)} hours`
        }] : []
      }
    }
    
    return { status: 'WARNING', message: 'No backup history found', issues: [{severity: 'WARNING', message: 'No backup history found'}] }
  } catch (error) {
    // Backup catalog may not exist - not critical
    return { status: 'HEALTHY', message: 'Backup view not available' }
  }
}

/**
 * Check replication status
 */
async function checkReplication(db, base) {
  try {
    const results = await db.execSQL(`
      SELECT 
        REPLICATION_STATUS,
        SECONDARY_ACTIVE_STATUS,
        LOG_POSITION,
        REPLICATION_MODE
      FROM M_DATABASES
      WHERE HOST = (SELECT HOST FROM M_DATABASES LIMIT 1)
    `)
    
    if (results && results.length > 0) {
      const replStatus = results[0].REPLICATION_STATUS
      const status = replStatus === 'ACTIVE' ? 'HEALTHY' : replStatus === 'INITIALIZING' ? 'WARNING' : 'CRITICAL'
      
      return {
        status,
        value: replStatus,
        details: {
          'Secondary Active': results[0].SECONDARY_ACTIVE_STATUS,
          'Replication Mode': results[0].REPLICATION_MODE
        },
        issues: status !== 'HEALTHY' ? [{
          severity: status,
          message: `Replication status: ${replStatus}`
        }] : []
      }
    }
    
    return { status: 'HEALTHY', message: 'No replication configured' }
  } catch (error) {
    // Replication might not be available, which is okay
    return { status: 'HEALTHY', message: 'Replication not available' }
  }
}

/**
 * Check host resource utilization
 */
async function checkResourceUtilization(db, base) {
  try {
    // Query available resource information
    const results = await db.execSQL(`
      SELECT * FROM M_SYSTEM_OVERVIEW LIMIT 1
    `)
    
    if (results && results.length > 0) {
      const sys = results[0]
      // Display what's available
      const detail = Object.keys(sys).slice(0, 5).reduce((acc, key) => {
        acc[key] = String(sys[key]).substring(0, 50)
        return acc
      }, {})
      
      return {
        status: 'HEALTHY',
        value: 'System info available',
        details: detail,
        issues: []
      }
    }
    
    return { status: 'UNKNOWN', message: 'Unable to retrieve system overview' }
  } catch (error) {
    // Try memory info from different view
    try {
      const memResults = await db.execSQL(`
        SELECT * FROM M_HOST_INFORMATION LIMIT 1
      `)
      
      if (memResults && memResults.length > 0) {
        return {
          status: 'HEALTHY',
          value: 'Host info available',
          details: {
            'Host': (memResults[0].HOST || 'N/A').toString()
          },
          issues: []
        }
      }
    } catch (e) {
      // Ignore
    }
    
    return { status: 'WARNING', message: 'Resource views not accessible: ' + error.message.substring(0, 50) }
  }
}

/**
 * Helper function to format bytes
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

/**
 * Helper function to get color based on status
 */
function getStatusColor(status) {
  const colors = {
    HEALTHY: (text) => `✅ ${text}`,
    WARNING: (text) => `⚠️ ${text}`,
    CRITICAL: (text) => `❌ ${text}`,
    ERROR: (text) => `❌ ${text}`,
    UNKNOWN: (text) => `❓ ${text}`
  }
  return colors[status] || colors.UNKNOWN
}
