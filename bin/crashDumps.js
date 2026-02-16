// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'crashDumps'
export const aliases = ['crash', 'cd']
export const describe = baseLite.bundle.getText("crashDumps")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  days: {
    alias: ['d'],
    type: 'number',
    default: 7,
    desc: baseLite.bundle.getText("days")
  },
  type: {
    alias: ['t'],
    type: 'string',
    default: null,
    desc: baseLite.bundle.getText("crashType")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 50,
    desc: baseLite.bundle.getText("limit")
  }
})).example('hana-cli crashDumps --days 7', baseLite.bundle.getText("crashDumpsExample"))

export let inputPrompts = {
  days: {
    description: baseLite.bundle.getText("days"),
    type: 'number',
    required: false
  },
  type: {
    description: baseLite.bundle.getText("crashType"),
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
  base.promptHandler(argv, listCrashDumps, inputPrompts)
}

/**
 * List and analyze crash dump files
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export async function listCrashDumps(prompts) {
  const base = await import('../utils/base.js')
  base.debug('listCrashDumps')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    try {
      const limit = base.validateLimit(prompts.limit)
      const days = prompts.days || 7
      const crashType = prompts.type || null

      base.output('')
      base.output(base.colors.bold(base.bundle.getText('crashDumpsHeader')))
      base.output(`${base.bundle.getText('analyzingLastDays')}: ${days}`)
      base.output('')

      // Build query with filters
      let query = `
        SELECT 
          HOST,
          DUMP_ID,
          TIMESTAMP,
          COMPONENT,
          PROCESS_ID,
          CRASH_TYPE,
          FILE_NAME,
          ROUND(FILE_SIZE / 1024 / 1024, 2) AS "File Size (MB)"
        FROM SYS.M_CRASH_DUMPS
        WHERE TIMESTAMP >= ADD_DAYS(CURRENT_TIMESTAMP, -${days})
      `

      if (crashType && base.sqlInjection.isAcceptableParameter(crashType)) {
        query += ` AND CRASH_TYPE = '${crashType}'`
      }

      query += ` ORDER BY TIMESTAMP DESC`

      if (limit && base.sqlInjection.isAcceptableParameter(limit.toString())) {
        query += ` LIMIT ${limit.toString()}`
      }

      const results = await db.execSQL(query)

      if (!results || results.length === 0) {
        base.output(base.colors.green('✓ ' + base.bundle.getText('noCrashDumps')))
        await base.end()
        return
      }

      // Display results
      base.output(base.colors.yellow(`⚠ ${results.length} ${base.bundle.getText('crashDumpsFound')}`))
      base.output('')
      base.outputTableFancy(results)
      base.output('')

      // Calculate statistics
      const componentStats = {}
      const typeStats = {}
      let totalSize = 0

      results.forEach(row => {
        // Component statistics
        const component = row.COMPONENT || 'Unknown'
        componentStats[component] = (componentStats[component] || 0) + 1

        // Type statistics
        const type = row.CRASH_TYPE || 'Unknown'
        typeStats[type] = (typeStats[type] || 0) + 1

        // Total size
        totalSize += row['File Size (MB)'] || 0
      })

      // Display summary
      base.output(base.colors.bold(base.bundle.getText('crashDumpsSummary')))
      base.output(`${base.bundle.getText('totalDumps')}: ${results.length}`)
      base.output(`${base.bundle.getText('totalSize')}: ${totalSize.toFixed(2)} MB`)
      base.output('')

      base.output(base.colors.bold(base.bundle.getText('byComponent')))
      Object.keys(componentStats).sort().forEach(component => {
        base.output(`  ${component}: ${componentStats[component]}`)
      })
      base.output('')

      base.output(base.colors.bold(base.bundle.getText('byCrashType')))
      Object.keys(typeStats).sort().forEach(type => {
        base.output(`  ${type}: ${typeStats[type]}`)
      })
      base.output('')

      // Recommendations
      if (results.length > 0) {
        base.output(base.colors.bold(base.bundle.getText('recommendations')))
        base.output(base.colors.cyan('1. ' + base.bundle.getText('crashRec1')))
        base.output(base.colors.cyan('2. ' + base.bundle.getText('crashRec2')))
        base.output(base.colors.cyan('3. ' + base.bundle.getText('crashRec3')))
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
