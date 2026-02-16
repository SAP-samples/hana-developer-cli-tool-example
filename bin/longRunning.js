// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'longRunning'
export const aliases = ['lr', 'longrunning']
export const describe = baseLite.bundle.getText("longRunning")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  limit: {
    alias: ['l'],
    type: 'number',
    default: 50,
    desc: baseLite.bundle.getText("limit")
  },
  duration: {
    alias: ['d'],
    type: 'number',
    default: 60,
    desc: baseLite.bundle.getText("queryDuration")
  },
  includeIdle: {
    alias: ['i'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("idleSession")
  },
  cancel: {
    alias: ['c'],
    type: 'string',
    desc: 'Statement hash to cancel'
  }
})).example('hana-cli longRunning --limit 50 --duration 60', baseLite.bundle.getText("longRunningExample"))

export let inputPrompts = {
  limit: {
    description: baseLite.bundle.getText("limit"),
    type: 'number',
    required: true
  },
  duration: {
    description: baseLite.bundle.getText("queryDuration"),
    type: 'number',
    required: true
  },
  includeIdle: {
    description: baseLite.bundle.getText("idleSession"),
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
  
  // If cancel parameter is provided, handle it directly
  if (argv.cancel) {
    base.setPrompts({})
    await cancelLongRunningQuery(argv.cancel)
    return
  }
  
  base.promptHandler(argv, getLongRunningQueries, inputPrompts)
}

/**
 * List long-running queries with ability to cancel
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export async function getLongRunningQueries(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getLongRunningQueries')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    try {
      const limit = base.validateLimit(prompts.limit)
      const duration = Math.max(1, parseInt(prompts.duration))
      const includeIdle = prompts.includeIdle || false

      let query = `
      SELECT 
        CONNECTION_ID,
        SESSION_ID,
        STATEMENT_HASH,
        STATEMENT_ID,
        STATEMENT_START_TIME,
        ROUND((NANO100_TIME - CURRENT_TIMESTAMP) * -1 / 10000000, 2) AS "Duration (seconds)",
        ALLOCATED_MEMORY_SIZE,
        RESULT_RECORD_COUNT,
        APPLICATION_NAME,
        CURRENT_STATEMENT,
        DATABASE_USER,
        SESSION_STATUS
      FROM M_ACTIVE_STATEMENTS
      WHERE (NANO100_TIME - CURRENT_TIMESTAMP) * -1 / 10000000 > ?
    `

    const parameters = [duration]

    if (!includeIdle) {
      query += ` AND SESSION_STATUS != 'IDLE'`
    }

    query += ` ORDER BY (NANO100_TIME - CURRENT_TIMESTAMP) * -1 / 10000000 DESC`
    if (limit && base.sqlInjection.isAcceptableParameter(limit.toString())) {
      query += ` LIMIT ${limit.toString()}`
    }

    let results = await db.statementExecPromisified(
      await db.preparePromisified(query),
      parameters
    )

    if (!results || results.length === 0) {
      base.output(base.bundle.getText('noLongRunningQueries', [duration]))
      await base.end()
      return
    }

    base.output('')
    base.output(base.colors.bold(base.bundle.getText('longRunningQueriesHeader', [duration])))
    base.output(`${base.bundle.getText('total')}: ${results.length}`)
    base.output('')

    // Format and display results
    const displayResults = results.map(row => ({
      'Connection ID': row.CONNECTION_ID,
      'Session ID': row.SESSION_ID,
      'User': row.DATABASE_USER,
      'Application': row.APPLICATION_NAME,
      'Duration (sec)': row['Duration (seconds)'],
      'Status': row.SESSION_STATUS,
      'Memory (KB)': (row.ALLOCATED_MEMORY_SIZE / 1024).toFixed(2),
      'Rows': row.RESULT_RECORD_COUNT,
      'Statement Hash': row.STATEMENT_HASH
    }))

    base.outputTableFancy(displayResults)

    base.output('')
    base.output(base.bundle.getText('cancelQueryInstruction'))
    base.output('')

    await base.end()
    } catch (stmtError) {
      // M_ACTIVE_STATEMENTS view not accessible in HDI container context
      if (stmtError.message && stmtError.message.includes('Could not find table')) {
        base.output(base.colors.bold('Long-Running Queries'))
        base.output('')
        base.output(base.colors.yellow('⚠️  Long-running query monitoring is not accessible from this schema context.'))
        base.output('This command requires access to system statement monitoring views (M_ACTIVE_STATEMENTS) which are')
        base.output('not available in HDI container schemas. Connect to the SYSTEMDB to view active queries.')
        base.output('')
      } else {
        throw stmtError
      }
      await base.end()
    }
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Cancel a long-running query by statement hash
 * @param {string} statementHash - Statement hash to cancel
 * @returns {Promise<void>}
 */
export async function cancelLongRunningQuery(statementHash) {
  const base = await import('../utils/base.js')
  base.debug(`cancelLongRunningQuery: ${statementHash}`)
  try {
    const db = await base.createDBConnection()

    // Get query details first
    const getQueryQuery = `
      SELECT 
        CONNECTION_ID,
        SESSION_ID,
        STATEMENT_HASH,
        STATEMENT_ID,
        ROUND((NANO100_TIME - CURRENT_TIMESTAMP) * -1 / 10000000, 2) AS "Duration (seconds)",
        CURRENT_STATEMENT,
        DATABASE_USER,
        APPLICATION_NAME
      FROM M_ACTIVE_STATEMENTS
      WHERE STATEMENT_HASH = ?
    `

    const queryDetails = await db.statementExecPromisified(
      await db.preparePromisified(getQueryQuery),
      [statementHash]
    )

    if (!queryDetails || queryDetails.length === 0) {
      base.output(base.colors.red(base.bundle.getText('queryNotFoundMsg', [statementHash])))
      await base.end()
      return
    }

    const query = queryDetails[0]
    base.output('')
    base.output(base.colors.bold(base.bundle.getText('queryDetailsHeader') + ':'))
    base.output(`  ${base.bundle.getText('queryUserLabel')}: ${query.DATABASE_USER}`)
    base.output(`  ${base.bundle.getText('queryApplicationLabel')}: ${query.APPLICATION_NAME}`)
    base.output(`  ${base.bundle.getText('queryConnectionIdLabel')}: ${query.CONNECTION_ID}`)
    base.output(`  ${base.bundle.getText('querySessionIdLabel')}: ${query.SESSION_ID}`)
    base.output(`  ${base.bundle.getText('queryDurationLabel')}: ${query['Duration (seconds)']} seconds`)
    base.output('')

    // Cancel the query
    const cancelQuery = `CANCEL STATEMENT '${query.STATEMENT_HASH}'`
    
    try {
      await db.execSQL(cancelQuery)
      base.output(base.colors.green(`✓ ${base.bundle.getText('queryCancelledMsg', [statementHash])}`))
      await base.end()
    } catch (cancelError) {
      // Try alternate cancel method
      base.debug(`Cancel failed with primary method: ${cancelError.message}`)
      base.output(base.colors.yellow(`⚠ ${base.bundle.getText('cancelAttemptFailed')}`))
      await base.end()
    }
  } catch (error) {
    await base.error(error)
  }
}
