// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'alerts'
export const aliases = ['a', 'alert']
export const describe = baseLite.bundle.getText("alerts")

export const builder = baseLite.getBuilder({
  limit: {
    alias: ['l', 'Limit'],
    type: 'number',
    default: 100,
    desc: baseLite.bundle.getText("limit")
  },
  severity: {
    alias: ['s', 'Severity'],
    type: 'string',
    default: 'all',
    choices: ['all', 'CRITICAL', 'WARNING', 'INFO'],
    desc: baseLite.bundle.getText("alertSeverity")
  },
  acknowledge: {
    alias: ['ack'],
    type: 'string',
    desc: 'Acknowledge alert by ID'
  },
  delete: {
    alias: ['del'],
    type: 'string',
    desc: 'Delete alert by ID'
  }
})

export let inputPrompts = {
  limit: {
    description: baseLite.bundle.getText("limit"),
    type: 'number',
    required: true
  },
  severity: {
    description: baseLite.bundle.getText("alertSeverity"),
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
  
  // Handle acknowledge or delete operations
  if (argv.acknowledge) {
    base.setPrompts({})
    await acknowledgeAlert(argv.acknowledge)
    return
  }

  if (argv.delete) {
    base.setPrompts({})
    await deleteAlert(argv.delete)
    return
  }

  base.promptHandler(argv, listAlerts, inputPrompts)
}

/**
 * List and manage database alerts
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export async function listAlerts(prompts) {
  const base = await import('../utils/base.js')
  base.debug('listAlerts')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    try {
      const limit = base.validateLimit(prompts.limit)
      const severity = prompts.severity === 'all' ? '%' : prompts.severity

      let query = `
        SELECT 
          MESSAGE_ID as "Alert ID",
          MESSAGE_CODE as "Code",
          SEVERITY,
          ALERT_RATING as "Rating",
          DESCRIPTION,
          INSERT_TIME as "Timestamp",
          IS_ACKNOWLEDGED as "Acknowledged",
          RECOMMENDED_ACTION as "Recommended Action",
          COMPONENT
        FROM M_ALERTS
        WHERE SEVERITY LIKE ?
        ORDER BY INSERT_TIME DESC
      `

      if (limit && base.sqlInjection.isAcceptableParameter(limit.toString())) {
        query += ` LIMIT ${limit.toString()}`
      }

      let results = await db.statementExecPromisified(
        await db.preparePromisified(query),
        [severity]
      )

      // Get alert summary
      let summaryQuery = `
        SELECT 
          SEVERITY,
          COUNT(*) as "Count",
          COUNT(CASE WHEN IS_ACKNOWLEDGED = 'TRUE' THEN 1 END) as "Acknowledged"
        FROM M_ALERTS
        GROUP BY SEVERITY
        ORDER BY 
          CASE WHEN SEVERITY = 'CRITICAL' THEN 1
             WHEN SEVERITY = 'WARNING' THEN 2
             WHEN SEVERITY = 'INFO' THEN 3
             ELSE 4 END
    `

    const summaryResults = await db.execSQL(summaryQuery)

    if (!results || results.length === 0) {
      base.output(base.bundle.getText('noAlertsFound'))
      if (summaryResults && summaryResults.length > 0) {
        base.output('')
        base.output(base.bundle.getText('alertsByProperty') + ':')
        base.outputTableFancy(summaryResults)
      }
      await base.end()
      return
    }

    base.output('')
    base.output(base.colors.bold(base.bundle.getText('databaseAlertsHeader')))
    base.output(`${base.bundle.getText('total')}: ${results.length}`)
    base.output('')

    // Display summary
    if (summaryResults && summaryResults.length > 0) {
      base.output(base.colors.bold(base.bundle.getText('alertsByProperty') + ':'))
      base.outputTableFancy(summaryResults)
      base.output('')
    }

    // Display alert details
    const displayResults = results.map(row => ({
      'ID': row['Alert ID'],
      'Severity': row.SEVERITY,
      'Code': row.Code,
      'Rating': row.Rating,
      'Component': row.COMPONENT,
      'Timestamp': row.Timestamp,
      'Ack': row.Acknowledged
    }))

    base.outputTableFancy(displayResults)

    base.output('')
    base.output(base.bundle.getText('alertDetailsHeader') + ':')
    results.forEach((alert, idx) => {
      base.output(`${idx + 1}. [${alert.SEVERITY}] ${alert.DESCRIPTION}`)
      if (alert['Recommended Action']) {
        base.output(`   ${base.bundle.getText('action')}: ${alert['Recommended Action']}`)
      }
      base.output(`   ID: ${alert['Alert ID']}`)
      base.output('')
    })

    base.output('To acknowledge an alert: hana-cli alerts --acknowledge <alert_id>')
    base.output('To delete an alert: hana-cli alerts --delete <alert_id>')
    base.output('')

    await base.end()
    } catch (innerError) {
      // M_ALERTS view not accessible in this HDI container context
      base.output(base.bundle.getText('databaseAlertsHeader'))
      base.output('')
      base.output(base.colors.yellow('⚠️  Database alerts are not accessible from this schema context.'))
      base.output('This command requires access to system monitoring views (M_ALERTS) which are')
      base.output('not available in HDI container schemas. Connect to the SYSTEMDB to view alerts.')
      base.output('')
      await base.end()
    }
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Acknowledge an alert
 * @param {string} alertId - Alert ID to acknowledge
 * @returns {Promise<void>}
 */
async function acknowledgeAlert(alertId) {
  const base = await import('../utils/base.js')
  base.debug(`acknowledgeAlert: ${alertId}`)
  try {
    const db = await base.createDBConnection()

    try {
      // Get alert details
      const getAlertQuery = `
        SELECT 
          MESSAGE_ID as "Alert ID",
          SEVERITY,
          DESCRIPTION,
          IS_ACKNOWLEDGED as "Acknowledged"
        FROM M_ALERTS
        WHERE MESSAGE_ID = ?
      `

      const alertDetails = await db.statementExecPromisified(
        await db.preparePromisified(getAlertQuery),
        [alertId]
      )

      if (!alertDetails || alertDetails.length === 0) {
        base.output(base.colors.red(base.bundle.getText('alertNotFoundMsg', [alertId])))
        await base.end()
        return
      }

      const alert = alertDetails[0]

      base.output('')
      base.output(base.colors.bold(base.bundle.getText('alertDetailsHeader') + ':'))
      base.output(`  ${base.bundle.getText('alertSeverity')}: ${alert.SEVERITY}`)
      base.output(`  ${base.bundle.getText('description')}: ${alert.DESCRIPTION}`)
      base.output(`  ${base.bundle.getText('currentStatus')}: ${alert['Acknowledged']}`)
      base.output('')

      // Acknowledge the alert
      try {
        const updateQuery = `
          UPDATE M_ALERTS 
          SET IS_ACKNOWLEDGED = 'TRUE'
          WHERE MESSAGE_ID = ?
        `

        await db.statementExecPromisified(
          await db.preparePromisified(updateQuery),
          [alertId]
        )

        base.output(base.colors.green(`✓ ${base.bundle.getText('alertAcknowledgedMsg', [alertId])}`))
        await base.end()
      } catch (updateError) {
        base.debug(`Acknowledge failed: ${updateError.message}`)
        base.output(base.colors.yellow(`⚠ Warning: Unable to acknowledge alert. ${updateError.message}`))
        await base.end()
      }
    } catch (alertError) {
      // M_ALERTS not accessible
      base.output(base.colors.yellow('⚠️  Database alerts are not accessible from this schema context.'))
      base.output('This command requires system level access which is not available in HDI containers.')
      await base.end()
    }
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Delete an alert
 * @param {string} alertId - Alert ID to delete
 * @returns {Promise<void>}
 */
async function deleteAlert(alertId) {
  const base = await import('../utils/base.js')
  base.debug(`deleteAlert: ${alertId}`)
  try {
    const db = await base.createDBConnection()

    try {
      // Get alert details first
      const getAlertQuery = `
        SELECT 
          MESSAGE_ID as "Alert ID",
          SEVERITY,
          DESCRIPTION
        FROM M_ALERTS
        WHERE MESSAGE_ID = ?
      `

      const alertDetails = await db.statementExecPromisified(
        await db.preparePromisified(getAlertQuery),
        [alertId]
      )

      if (!alertDetails || alertDetails.length === 0) {
        base.output(base.colors.red(`Alert with ID ${alertId} not found.`))
        await base.end()
        return
      }

      const alert = alertDetails[0]

      base.output('')
      base.output(base.colors.bold('Alert Details:'))
      base.output(`  Severity: ${alert.SEVERITY}`)
      base.output(`  Description: ${alert.DESCRIPTION}`)
      base.output('')

      // Delete the alert
      try {
        const deleteQuery = `
          DELETE FROM M_ALERTS 
          WHERE MESSAGE_ID = ?
        `

        await db.statementExecPromisified(
          await db.preparePromisified(deleteQuery),
          [alertId]
        )

        base.output(base.colors.green(`✓ ${base.bundle.getText('alertDeletedMsg', [alertId])}`))
        await base.end()
      } catch (deleteError) {
        base.debug(`Delete failed: ${deleteError.message}`)
        base.output(base.colors.yellow(`⚠ Warning: Unable to delete alert. ${deleteError.message}`))
        await base.end()
      }
    } catch (alertError) {
      // M_ALERTS not accessible
      base.output(base.colors.yellow('⚠️  Database alerts are not accessible from this schema context.'))
      base.output('This command requires system level access which is not available in HDI containers.')
      await base.end()
    }
  } catch (error) {
    await base.error(error)
  }
}
