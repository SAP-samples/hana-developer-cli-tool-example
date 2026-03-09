// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'connections'
export const aliases = ['conn', 'c']
export const describe = baseLite.bundle.getText("connections")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  limit: {
    alias: ['l'],
    type: 'number',
    default: 100,
    desc: baseLite.bundle.getText("limit")
  },
  user: {
    alias: ['u'],
    type: 'string',
    desc: baseLite.bundle.getText("user")
  },
  application: {
    alias: ['a'],
    type: 'string',
    desc: baseLite.bundle.getText("applicationName")
  },
  idle: {
    alias: ['i'],
    type: 'boolean',
    default: false,
    desc: 'Include idle connections'
  }
})).wrap(160).example(
  'hana-cli connections --limit 100',
  baseLite.bundle.getText("connectionsExample")
).epilog(buildDocEpilogue('connections', 'connection-auth', ['connect', 'connectViaServiceKey', 'status']))

export let inputPrompts = {
  limit: {
    description: baseLite.bundle.getText("limit"),
    type: 'number',
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
  base.promptHandler(argv, getConnectionDetails, inputPrompts)
}

/**
 * Active connection details and statistics
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export async function getConnectionDetails(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getConnectionDetails')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    try {
      const limit = base.validateLimit(prompts.limit)
    const argv = base.getPrompts()

    let query = `
      SELECT 
        CONNECTION_ID,
        SESSION_ID,
        USER_NAME,
        APPLICATION_NAME,
        CLIENT_HOST,
        CLIENT_PID,
        CONNECTION_STATUS,
        SESSION_STATUS,
        LOGON_TIME,
        LAST_STATEMENT_START_TIME,
        ROUND((CURRENT_TIMESTAMP - LOGON_TIME) * 24 * 60 * 60, 2) AS "Connection Age (sec)",
        IDLE_TIME AS "Idle Time (microsec)"
      FROM SYS.M_SESSIONS
      WHERE 1=1
    `

    const parameters = []

    if (!argv.idle) {
      query += ` AND SESSION_STATUS != 'IDLE'`
    }

    if (argv.user) {
      query += ` AND USER_NAME LIKE ?`
      parameters.push(argv.user)
    }

    if (argv.application) {
      query += ` AND APPLICATION_NAME LIKE ?`
      parameters.push(argv.application)
    }

    query += ` ORDER BY LOGON_TIME DESC`

    if (limit && base.sqlInjection.isAcceptableParameter(limit.toString())) {
      query += ` LIMIT ${limit.toString()}`
    }

    let results
    if (parameters.length > 0) {
      results = await db.statementExecPromisified(
        await db.preparePromisified(query),
        parameters
      )
    } else {
      results = await db.execSQL(query)
    }

    // Get connection statistics
    let statsQuery = `
      SELECT 
        COUNT(*) as "Total Connections",
        COUNT(CASE WHEN SESSION_STATUS = 'IDLE' THEN 1 END) as "Idle Sessions",
        COUNT(CASE WHEN SESSION_STATUS != 'IDLE' THEN 1 END) as "Active Sessions",
        COUNT(DISTINCT USER_NAME) as "Unique Users",
        COUNT(DISTINCT APPLICATION_NAME) as "Unique Applications"
      FROM SYS.M_SESSIONS
    `

    const statsResults = await db.execSQL(statsQuery)

    if (!results || results.length === 0) {
      base.output(base.bundle.getText('noConnectionsFound'))
      if (statsResults && statsResults.length > 0) {
        const stats = statsResults[0]
        base.output('')
        base.output(base.bundle.getText('connectionStatisticsHeader') + ':')
        base.output(`  ${base.bundle.getText('totalConnections')}: ${stats['Total Connections']}`)
        base.output(`  Active Sessions: ${stats['Active Sessions']}`)
        base.output(`  Idle Sessions: ${stats['Idle Sessions']}`)
      }
      await base.end()
      return
    }

    base.output('')
    base.output(base.colors.bold(base.bundle.getText('connectionDetailsHeader')))
    base.output(`${base.bundle.getText('total')}: ${results.length}`)
    base.output('')

    // Display statistics
    if (statsResults && statsResults.length > 0) {
      const stats = statsResults[0]
      base.output(base.colors.bold(base.bundle.getText('connectionStatisticsHeader') + ':'))
      base.output(`  Total Connections: ${stats['Total Connections']}`)
      base.output(`  Active Sessions: ${stats['Active Sessions']}`)
      base.output(`  Idle Sessions: ${stats['Idle Sessions']}`)
      base.output(`  Unique Users: ${stats['Unique Users']}`)
      base.output(`  Unique Applications: ${stats['Unique Applications']}`)
      base.output('')
    }

    // Display detailed connection information
    const displayResults = results.map(row => ({
      'Connection ID': row.CONNECTION_ID,
      'Session ID': row.SESSION_ID,
      'User': row.USER_NAME,
      'Application': row.APPLICATION_NAME,
      'Client Host': row.CLIENT_HOST,
      'Client PID': row.CLIENT_PID,
      'Status': row.SESSION_STATUS,
      'Connection Age (sec)': row['Connection Age (sec)'],
      'Idle Time (sec)': (row['Idle Time (microsec)'] / 1000000).toFixed(2)
    }))

    base.outputTableFancy(displayResults)

    // Get connections by user
    try {
      const userStatsQuery = `
        SELECT 
          USER_NAME,
          COUNT(*) as "Connection Count"
        FROM SYS.M_SESSIONS
        GROUP BY USER_NAME
        ORDER BY "Connection Count" DESC
        LIMIT 10
      `

      const userStats = await db.execSQL(userStatsQuery)

      if (userStats && userStats.length > 0) {
        base.output('')
        base.output(base.colors.bold(base.bundle.getText('topUsersByConnection') + ':'))
        base.outputTableFancy(userStats)
      }
    } catch (error) {
      base.debug(base.bundle.getText('errorGettingDetails') + ': ' + error.message)
    }

    // Get connections by application
    try {
      const appStatsQuery = `
        SELECT 
          APPLICATION_NAME,
          COUNT(*) as "Connection Count"
        FROM SYS.M_SESSIONS
        WHERE APPLICATION_NAME IS NOT NULL
        GROUP BY APPLICATION_NAME
        ORDER BY "Connection Count" DESC
        LIMIT 10
      `

      const appStats = await db.execSQL(appStatsQuery)

      if (appStats && appStats.length > 0) {
        base.output('')
        base.output(base.colors.bold(base.bundle.getText('topApplicationsByConnection') + ':'))
        base.outputTableFancy(appStats)
      }
    } catch (error) {
      base.debug(base.bundle.getText('errorGettingDetails') + ': ' + error.message)
    }

    base.output('')
      await base.end()
    } catch (sessionError) {
      // M_SESSIONS view not accessible in HDI container context
      if (sessionError.message && sessionError.message.includes('Could not find table')) {
        base.output(base.colors.bold('Database Connections'))
        base.output('')
        base.output(base.colors.yellow('⚠️  Connection monitoring is not accessible from this schema context.'))
        base.output('This command requires access to system session monitoring views (M_SESSIONS) which are')
        base.output('not available in HDI container schemas. Connect to the SYSTEMDB to view active connections.')
        base.output('')
      } else {
        throw sessionError
      }
      await base.end()
    }
  } catch (error) {
    await base.error(error)
  }
}
