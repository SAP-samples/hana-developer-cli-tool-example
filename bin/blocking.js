// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'blocking'
export const aliases = ['b', 'locks']
export const describe = baseLite.bundle.getText("blocking")

export const builder = baseLite.getBuilder({
  limit: {
    alias: ['l'],
    type: 'number',
    default: 50,
    desc: baseLite.bundle.getText("limit")
  },
  details: {
    alias: ['d'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("details")
  }
})

export let inputPrompts = {
  limit: {
    description: baseLite.bundle.getText("limit"),
    type: 'number',
    required: true
  },
  details: {
    description: baseLite.bundle.getText("details"),
    type: 'boolean',
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
  base.promptHandler(argv, getBlockingSessions, inputPrompts)
}

/**
 * Show blocking sessions and lock chains
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export async function getBlockingSessions(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getBlockingSessions')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    try {
      const limit = base.validateLimit(prompts.limit)
      const showDetails = prompts.details || false

      // Get blocking locks
      let query = `
        SELECT 
        LOCK_OWNER_CONNECTION_ID,
        LOCK_OWNER_SESSION_ID,
        LOCK_WAITER_CONNECTION_ID,
        LOCK_WAITER_SESSION_ID,
        LOCK_TYPE,
        LOCK_MODE,
        LOCK_ACQUIRED_TIME,
        ROUND((CURRENT_TIMESTAMP - LOCK_ACQUIRED_TIME) * 24 * 60 * 60, 2) AS "Lock Duration (sec)",
        LOCK_OBJECT_SCHEMA,
        LOCK_OBJECT_NAME
      FROM SYS.M_LOCKS
      WHERE LOCK_TYPE != 'EXCLUSIVE'
      ORDER BY LOCK_ACQUIRED_TIME ASC
    `

    if (limit && base.sqlInjection.isAcceptableParameter(limit.toString())) {
      query += ` LIMIT ${limit.toString()}`
    }

    let results = await db.execSQL(query)

    if (!results || results.length === 0) {
      base.output(base.bundle.getText('noBlockingLocksDetected'))
      await base.end()
      return
    }

    base.output('')
    base.output(base.colors.bold(base.bundle.getText('blockingSessionsHeader')))
    base.output(`${base.bundle.getText('totalBlockingLocks')}: ${results.length}`)
    base.output('')

    // Display lock information
    const displayResults = results.map(row => ({
      'Lock Owner Conn': row.LOCK_OWNER_CONNECTION_ID,
      'Lock Owner Ses': row.LOCK_OWNER_SESSION_ID,
      'Waiter Conn': row.LOCK_WAITER_CONNECTION_ID,
      'Waiter Ses': row.LOCK_WAITER_SESSION_ID,
      'Type': row.LOCK_TYPE,
      'Mode': row.LOCK_MODE,
      'Duration (sec)': row['Lock Duration (sec)'],
      'Object': `${row.LOCK_OBJECT_SCHEMA}.${row.LOCK_OBJECT_NAME}`
    }))

    base.outputTableFancy(displayResults)

    // Get additional waiter information if details requested
    if (showDetails && results.length > 0) {
      base.output('')
      base.output(base.colors.bold(base.bundle.getText('waiterSessionDetailsHeader') + ':'))

      const waiterSessions = new Set(results.map(r => `${r.LOCK_WAITER_CONNECTION_ID}:${r.LOCK_WAITER_SESSION_ID}`))

      for (const [idx, waiterKey] of Array.from(waiterSessions).entries()) {
        const [connId, sesId] = waiterKey.split(':')

        try {
          const sessionQuery = `
            SELECT 
              U.USER_NAME,
              S.APPLICATION_NAME,
              S.CLIENT_HOST,
              S.STATEMENT_START_TIME,
              ROUND((CURRENT_TIMESTAMP - S.STATEMENT_START_TIME) * 24 * 60 * 60, 2) AS "Wait Time (sec)"
            FROM SYS.M_SESSIONS S
            LEFT JOIN SYS.USERS U ON S.USER_NAME = U.USER_NAME
            WHERE S.CONNECTION_ID = ? AND S.SESSION_ID = ?
          `

          const sessionDetails = await db.statementExecPromisified(
            await db.preparePromisified(sessionQuery),
            [connId, sesId]
          )

          if (sessionDetails && sessionDetails.length > 0) {
            const session = sessionDetails[0]
            base.output(`${idx + 1}. Connection ${connId}, Session ${sesId}`)
            base.output(`   User: ${session.USER_NAME}`)
            base.output(`   Application: ${session.APPLICATION_NAME}`)
            base.output(`   Client Host: ${session.CLIENT_HOST}`)
            base.output(`   Wait Time: ${session['Wait Time (sec)']} seconds`)
          }
        } catch (error) {
          base.debug(base.bundle.getText('errorGettingDetails') + ': ' + error.message)
        }
      }
    }

    // Check for potential deadlock cycles
    try {
      const cycleQuery = `
        SELECT COUNT(*) as "Cycle Count"
        FROM SYS.M_LOCKS L1
        JOIN SYS.M_LOCKS L2 ON L1.LOCK_WAITER_CONNECTION_ID = L2.LOCK_OWNER_CONNECTION_ID
        AND L1.LOCK_WAITER_SESSION_ID = L2.LOCK_OWNER_SESSION_ID
        AND L1.LOCK_OWNER_CONNECTION_ID = L2.LOCK_WAITER_CONNECTION_ID
        AND L1.LOCK_OWNER_SESSION_ID = L2.LOCK_WAITER_SESSION_ID
      `

      const cycleResults = await db.execSQL(cycleQuery)

      if (cycleResults && cycleResults.length > 0 && cycleResults[0]['Cycle Count'] > 0) {
        base.output('')
        base.output(base.colors.red(`⚠ ${base.bundle.getText('deadlockCyclesDetected')}: ${cycleResults[0]['Cycle Count']}`))
      }
    } catch (error) {
      base.debug(`Error checking for deadlock cycles: ${error.message}`)
    }

    base.output('')
      await base.end()
    } catch (lockError) {
      // M_LOCKS view not accessible in HDI container context
      if (lockError.message && lockError.message.includes('Could not find table')) {
        base.output(base.colors.bold(base.bundle.getText('blockingSessionsHeader')))
        base.output('')
        base.output(base.colors.yellow('⚠️  Blocking session monitoring is not accessible from this schema context.'))
        base.output('This command requires access to system lock monitoring views (M_LOCKS) which are')
        base.output('not available in HDI container schemas. Connect to the SYSTEMDB to view blocking sessions.')
        base.output('')
      } else {
        throw lockError
      }
      await base.end()
    }
  } catch (error) {
    await base.error(error)
  }
}
