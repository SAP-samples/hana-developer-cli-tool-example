// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'diagnose'
export const aliases = ['diag']
export const describe = baseLite.bundle.getText("diagnose")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  checks: {
    alias: ['c'],
    type: 'string',
    default: 'all',
    desc: baseLite.bundle.getText("checks")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 50,
    desc: baseLite.bundle.getText("limit")
  }
})).example('hana-cli diagnose --checks all', baseLite.bundle.getText("diagnoseExample"))

export let inputPrompts = {
  checks: {
    description: baseLite.bundle.getText("checks"),
    type: 'string',
    required: false
  },
  limit: {
    description: baseLite.bundle.getText("limit"),
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
  base.promptHandler(argv, runDiagnostics, inputPrompts)
}

/**
 * Run comprehensive system diagnostics
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export async function runDiagnostics(prompts) {
  const base = await import('../utils/base.js')
  base.debug('runDiagnostics')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    try {
      const limit = base.validateLimit(prompts.limit)
      const checksFilter = prompts.checks || 'all'
      const checksArray = checksFilter.toLowerCase().split(',').map(c => c.trim())
      const runAll = checksArray.includes('all')

      let issues = []
      let warnings = []

      base.output('')
      base.output(base.colors.bold(base.bundle.getText('diagnosticsHeader')))
      base.output('')

      // Check 1: Services Status
      if (runAll || checksArray.includes('services')) {
        base.output(base.colors.cyan('► ' + base.bundle.getText('checkingServices')))
        try {
          const servicesQuery = `
            SELECT 
              HOST,
              PORT,
              SERVICE_NAME,
              ACTIVE_STATUS,
              DETAIL
            FROM SYS.M_SERVICES
            WHERE ACTIVE_STATUS != 'YES'
          `
          const servicesResults = await db.execSQL(servicesQuery)
          
          if (servicesResults && servicesResults.length > 0) {
            issues.push({
              category: base.bundle.getText('servicesStatus'),
              severity: 'critical',
              count: servicesResults.length,
              message: base.bundle.getText('inactiveServicesFound')
            })
            base.output(base.colors.red(`  ✗ ${servicesResults.length} ${base.bundle.getText('inactiveServicesFound')}`))
          } else {
            base.output(base.colors.green(`  ✓ ${base.bundle.getText('allServicesActive')}`))
          }
        } catch (err) {
          base.output(base.colors.yellow(`  ⚠ ${base.bundle.getText('checkSkipped')}: ${err.message}`))
        }
      }

      // Check 2: Memory Usage
      if (runAll || checksArray.includes('memory')) {
        base.output(base.colors.cyan('► ' + base.bundle.getText('checkingMemory')))
        try {
          const memoryQuery = `
            SELECT 
              HOST,
              INSTANCE_TOTAL_MEMORY_USED_SIZE,
              INSTANCE_TOTAL_MEMORY_ALLOCATED_SIZE,
              ROUND(INSTANCE_TOTAL_MEMORY_USED_SIZE / INSTANCE_TOTAL_MEMORY_ALLOCATED_SIZE * 100, 2) AS "Memory Usage %"
            FROM SYS.M_HOST_INFORMATION
            WHERE INSTANCE_TOTAL_MEMORY_ALLOCATED_SIZE > 0
          `
          const memoryResults = await db.execSQL(memoryQuery)
          
          let highMemory = false
          if (memoryResults && memoryResults.length > 0) {
            memoryResults.forEach(row => {
              const usagePercent = row['Memory Usage %']
              if (usagePercent > 90) {
                highMemory = true
                issues.push({
                  category: base.bundle.getText('memoryUsage'),
                  severity: 'critical',
                  count: 1,
                  message: `${row.HOST}: ${usagePercent}% ${base.bundle.getText('memoryUsed')}`
                })
              } else if (usagePercent > 80) {
                warnings.push({
                  category: base.bundle.getText('memoryUsage'),
                  severity: 'warning',
                  count: 1,
                  message: `${row.HOST}: ${usagePercent}% ${base.bundle.getText('memoryUsed')}`
                })
              }
            })
          }
          
          if (highMemory) {
            base.output(base.colors.red(`  ✗ ${base.bundle.getText('highMemoryUsage')}`))
          } else if (warnings.some(w => w.category === base.bundle.getText('memoryUsage'))) {
            base.output(base.colors.yellow(`  ⚠ ${base.bundle.getText('moderateMemoryUsage')}`))
          } else {
            base.output(base.colors.green(`  ✓ ${base.bundle.getText('memoryUsageNormal')}`))
          }
        } catch (err) {
          base.output(base.colors.yellow(`  ⚠ ${base.bundle.getText('checkSkipped')}: ${err.message}`))
        }
      }

      // Check 3: Critical Alerts
      if (runAll || checksArray.includes('alerts')) {
        base.output(base.colors.cyan('► ' + base.bundle.getText('checkingAlerts')))
        try {
          const alertsQuery = `
            SELECT 
              COUNT(*) AS "Critical Count"
            FROM SYS.M_ALERTS
            WHERE SEVERITY = 'CRITICAL'
          `
          const alertsResults = await db.execSQL(alertsQuery)
          
          if (alertsResults && alertsResults.length > 0 && alertsResults[0]['Critical Count'] > 0) {
            const criticalCount = alertsResults[0]['Critical Count']
            issues.push({
              category: base.bundle.getText('activeAlerts'),
              severity: 'critical',
              count: criticalCount,
              message: base.bundle.getText('criticalAlertsFound')
            })
            base.output(base.colors.red(`  ✗ ${criticalCount} ${base.bundle.getText('criticalAlertsFound')}`))
          } else {
            base.output(base.colors.green(`  ✓ ${base.bundle.getText('noCriticalAlerts')}`))
          }
        } catch (err) {
          base.output(base.colors.yellow(`  ⚠ ${base.bundle.getText('checkSkipped')}: ${err.message}`))
        }
      }

      // Check 4: Lock Count
      if (runAll || checksArray.includes('locks')) {
        base.output(base.colors.cyan('► ' + base.bundle.getText('checkingLocks')))
        try {
          const locksQuery = `
            SELECT 
              COUNT(*) AS "Lock Count"
            FROM SYS.M_LOCKS
          `
          const locksResults = await db.execSQL(locksQuery)
          
          if (locksResults && locksResults.length > 0) {
            const lockCount = locksResults[0]['Lock Count']
            if (lockCount > 100) {
              warnings.push({
                category: base.bundle.getText('lockCount'),
                severity: 'warning',
                count: lockCount,
                message: base.bundle.getText('highLockCount')
              })
              base.output(base.colors.yellow(`  ⚠ ${lockCount} ${base.bundle.getText('activeLocks')}`))
            } else {
              base.output(base.colors.green(`  ✓ ${lockCount} ${base.bundle.getText('activeLocks')}`))
            }
          }
        } catch (err) {
          base.output(base.colors.yellow(`  ⚠ ${base.bundle.getText('checkSkipped')}: ${err.message}`))
        }
      }

      // Check 5: Last Backup
      if (runAll || checksArray.includes('backup')) {
        base.output(base.colors.cyan('► ' + base.bundle.getText('checkingBackup')))
        try {
          const backupQuery = `
            SELECT 
              MAX(SYS_END_TIME) AS "Last Backup"
            FROM SYS.M_BACKUP_CATALOG
            WHERE STATE_NAME = 'successful'
              AND ENTRY_TYPE_NAME = 'complete data backup'
          `
          const backupResults = await db.execSQL(backupQuery)
          
          if (backupResults && backupResults.length > 0 && backupResults[0]['Last Backup']) {
            const lastBackup = new Date(backupResults[0]['Last Backup'])
            const now = new Date()
            const hoursSinceBackup = (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60)
            
            if (hoursSinceBackup > 48) {
              warnings.push({
                category: base.bundle.getText('lastBackup'),
                severity: 'warning',
                count: 1,
                message: `${Math.floor(hoursSinceBackup)} ${base.bundle.getText('hoursSinceLastBackup')}`
              })
              base.output(base.colors.yellow(`  ⚠ ${base.bundle.getText('lastBackupOld')}: ${Math.floor(hoursSinceBackup)} ${base.bundle.getText('hoursAgo')}`))
            } else {
              base.output(base.colors.green(`  ✓ ${base.bundle.getText('recentBackupFound')}: ${Math.floor(hoursSinceBackup)} ${base.bundle.getText('hoursAgo')}`))
            }
          } else {
            warnings.push({
              category: base.bundle.getText('lastBackup'),
              severity: 'warning',
              count: 1,
              message: base.bundle.getText('noBackupFound')
            })
            base.output(base.colors.yellow(`  ⚠ ${base.bundle.getText('noBackupFound')}`))
          }
        } catch (err) {
          base.output(base.colors.yellow(`  ⚠ ${base.bundle.getText('checkSkipped')}: ${err.message}`))
        }
      }

      // Summary
      base.output('')
      base.output(base.colors.bold(base.bundle.getText('diagnosticsSummary')))
      base.output('')

      if (issues.length === 0 && warnings.length === 0) {
        base.output(base.colors.green('✓ ' + base.bundle.getText('systemHealthy')))
      } else {
        if (issues.length > 0) {
          base.output(base.colors.red(`✗ ${issues.length} ${base.bundle.getText('criticalIssuesFound')}`))
          issues.forEach(issue => {
            base.output(base.colors.red(`  • ${issue.category}: ${issue.message}`))
          })
        }
        if (warnings.length > 0) {
          base.output(base.colors.yellow(`⚠ ${warnings.length} ${base.bundle.getText('warningsFound')}`))
          warnings.forEach(warning => {
            base.output(base.colors.yellow(`  • ${warning.category}: ${warning.message}`))
          })
        }
      }

      base.output('')
      await base.end()
    } catch (innerError) {
      if (innerError.message && innerError.message.includes('Could not find table')) {
        base.output(base.colors.yellow('⚠️  ' + base.bundle.getText('viewNotAccessible')))
      } else {
        throw innerError
      }
      await base.end()
    }
  } catch (error) {
    await base.error(error)
  }
}
