// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'deadlocks'
export const aliases = ['deadlock', 'dl']
export const describe = baseLite.bundle.getText("deadlocks")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  limit: {
    alias: ['l'],
    type: 'number',
    default: 50,
    desc: baseLite.bundle.getText("limit")
  }
})).wrap(160).example(
  'hana-cli deadlocks --limit 50',
  baseLite.bundle.getText("deadlocksExample")
).epilog(buildDocEpilogue('deadlocks', 'performance-monitoring', ['longRunning', 'blocking', 'healthCheck']))

export let inputPrompts = {
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
  base.promptHandler(argv, analyzeDeadlocks, inputPrompts)
}

/**
 * Analyze and detect deadlock situations
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export async function analyzeDeadlocks(prompts) {
  const base = await import('../utils/base.js')
  base.debug('analyzeDeadlocks')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    try {
      const limit = base.validateLimit(prompts.limit)

      base.output('')
      base.output(base.colors.bold(base.bundle.getText('deadlockAnalysisHeader')))
      base.output('')

      // Check for circular lock dependencies (deadlocks)
      const deadlockQuery = `
        SELECT 
          L1.LOCK_OWNER_CONNECTION_ID AS "Owner Conn 1",
          L1.LOCK_OWNER_SESSION_ID AS "Owner Sess 1",
          L1.LOCK_WAITER_CONNECTION_ID AS "Waiter Conn 1",
          L1.LOCK_WAITER_SESSION_ID AS "Waiter Sess 1",
          L1.LOCK_TYPE AS "Lock Type 1",
          L1.LOCK_MODE AS "Lock Mode 1",
          L1.LOCK_OBJECT_SCHEMA AS "Schema 1",
          L1.LOCK_OBJECT_NAME AS "Object 1",
          L2.LOCK_TYPE AS "Lock Type 2",
          L2.LOCK_MODE AS "Lock Mode 2",
          L2.LOCK_OBJECT_SCHEMA AS "Schema 2",
          L2.LOCK_OBJECT_NAME AS "Object 2"
        FROM SYS.M_LOCKS L1
        INNER JOIN SYS.M_LOCKS L2 
          ON L1.LOCK_WAITER_CONNECTION_ID = L2.LOCK_OWNER_CONNECTION_ID
          AND L1.LOCK_WAITER_SESSION_ID = L2.LOCK_OWNER_SESSION_ID
          AND L1.LOCK_OWNER_CONNECTION_ID = L2.LOCK_WAITER_CONNECTION_ID
          AND L1.LOCK_OWNER_SESSION_ID = L2.LOCK_WAITER_SESSION_ID
      `

      const deadlockResults = await db.execSQL(deadlockQuery)

      if (!deadlockResults || deadlockResults.length === 0) {
        base.output(base.colors.green('✓ ' + base.bundle.getText('noDeadlocksDetected')))
      } else {
        base.output(base.colors.red(`✗ ${deadlockResults.length} ${base.bundle.getText('deadlocksDetected')}`))
        base.output('')
        base.outputTableFancy(deadlockResults)
        base.output('')
        base.output(base.colors.yellow(base.bundle.getText('deadlockRecommendation')))
      }

      // Check for blocked transactions
      base.output('')
      base.output(base.colors.bold(base.bundle.getText('blockedTransactionsHeader')))
      base.output('')

      let blockedQuery = `
        SELECT 
          BLOCKED_CONNECTION_ID AS "Blocked Conn",
          BLOCKED_SESSION_ID AS "Blocked Sess",
          BLOCKING_CONNECTION_ID AS "Blocking Conn",
          BLOCKING_SESSION_ID AS "Blocking Sess",
          BLOCKED_TRANSACTION_ID AS "Trans ID",
          LOCK_TYPE,
          LOCK_MODE,
          OBJECT_SCHEMA,
          OBJECT_NAME,
          ROUND(BLOCKING_TIME / 1000000, 2) AS "Blocking Time (sec)"
        FROM SYS.M_BLOCKED_TRANSACTIONS
        ORDER BY BLOCKING_TIME DESC
      `

      if (limit && base.sqlInjection.isAcceptableParameter(limit.toString())) {
        blockedQuery += ` LIMIT ${limit.toString()}`
      }

      const blockedResults = await db.execSQL(blockedQuery)

      if (!blockedResults || blockedResults.length === 0) {
        base.output(base.colors.green('✓ ' + base.bundle.getText('noBlockedTransactions')))
      } else {
        base.output(base.colors.yellow(`⚠ ${blockedResults.length} ${base.bundle.getText('blockedTransactionsFound')}`))
        base.output('')
        base.outputTableFancy(blockedResults)
        base.output('')
        
        // Show recommendations
        base.output(base.colors.bold(base.bundle.getText('recommendations')))
        base.output(base.colors.cyan('1. ' + base.bundle.getText('deadlockRec1')))
        base.output(base.colors.cyan('2. ' + base.bundle.getText('deadlockRec2')))
        base.output(base.colors.cyan('3. ' + base.bundle.getText('deadlockRec3')))
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
