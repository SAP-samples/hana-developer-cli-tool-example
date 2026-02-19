// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'fragmentationCheck'
export const aliases = ['frag', 'fc']
export const describe = baseLite.bundle.getText("fragmentationCheck")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  table: {
    alias: ['t'],
    type: 'string',
    default: null,
    desc: baseLite.bundle.getText("table")
  },
  threshold: {
    alias: ['th'],
    type: 'number',
    default: 10,
    desc: baseLite.bundle.getText("fragmentationThreshold")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 50,
    desc: baseLite.bundle.getText("limit")
  }
})).example('hana-cli fragmentationCheck --schema MYSCHEMA --threshold 10', baseLite.bundle.getText("fragmentationCheckExample"))

export let inputPrompts = {
  schema: {
    description: baseLite.bundle.getText("schema"),
    type: 'string',
    required: false
  },
  table: {
    description: baseLite.bundle.getText("table"),
    type: 'string',
    required: false
  },
  threshold: {
    description: baseLite.bundle.getText("fragmentationThreshold"),
    type: 'number',
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
  base.promptHandler(argv, checkFragmentation, inputPrompts)
}

/**
 * Check table fragmentation levels
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export async function checkFragmentation(prompts) {
  const base = await import('../utils/base.js')
  base.debug('checkFragmentation')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    try {
      const limit = base.validateLimit(prompts.limit)
      const schema = await base.dbClass.schemaCalc(prompts, db)
      const table = prompts.table || null
      const threshold = prompts.threshold || 10

      base.output('')
      base.output(base.colors.bold(base.bundle.getText('fragmentationCheckHeader')))
      base.output(`${base.bundle.getText('fragmentationThreshold')}: ${threshold}%`)
      base.output('')

      // Build query for column store table fragmentation
      let query = `
        SELECT 
          SCHEMA_NAME,
          TABLE_NAME,
          PART_ID,
          ROUND(MEMORY_SIZE_IN_TOTAL / 1024 / 1024, 2) AS "Total Size (MB)",
          ROUND(MEMORY_SIZE_IN_MAIN / 1024 / 1024, 2) AS "Main Size (MB)",
          ROUND(MEMORY_SIZE_IN_DELTA / 1024 / 1024, 2) AS "Delta Size (MB)",
          ROUND((MEMORY_SIZE_IN_DELTA / NULLIF(MEMORY_SIZE_IN_TOTAL, 0)) * 100, 2) AS "Fragmentation %",
          LAST_MERGE_TIME,
          MERGE_COUNT,
          CASE 
            WHEN LAST_MERGE_TIME IS NULL THEN NULL
            ELSE DAYS_BETWEEN(LAST_MERGE_TIME, CURRENT_TIMESTAMP)
          END AS "Days Since Merge"
        FROM SYS.M_CS_TABLES
        WHERE MEMORY_SIZE_IN_TOTAL > 0
      `

      // Add filters
      if (schema && base.sqlInjection.isAcceptableParameter(schema)) {
        query += ` AND SCHEMA_NAME = '${schema}'`
      }

      if (table && base.sqlInjection.isAcceptableParameter(table)) {
        query += ` AND TABLE_NAME LIKE '%${table}%'`
      }

      query += ` AND (MEMORY_SIZE_IN_DELTA / NULLIF(MEMORY_SIZE_IN_TOTAL, 0)) * 100 >= ${threshold}`
      query += ` ORDER BY (MEMORY_SIZE_IN_DELTA / NULLIF(MEMORY_SIZE_IN_TOTAL, 0)) DESC`

      if (limit && base.sqlInjection.isAcceptableParameter(limit.toString())) {
        query += ` LIMIT ${limit.toString()}`
      }

      const results = await db.execSQL(query)

      if (!results || results.length === 0) {
        base.output(base.colors.green('✓ ' + base.bundle.getText('noFragmentation')))
        await base.end()
        return
      }

      // Display results
      base.output(base.colors.yellow(`⚠ ${results.length} ${base.bundle.getText('fragmentedTablesFound')}`))
      base.output('')
      base.outputTableFancy(results)
      base.output('')

      // Calculate statistics
      let criticalCount = 0
      let warningCount = 0
      let totalDeltaSize = 0

      results.forEach(row => {
        const fragPercent = row['Fragmentation %']
        totalDeltaSize += parseFloat(row['Delta Size (MB)']) || 0

        if (fragPercent >= 50) {
          criticalCount++
        } else if (fragPercent >= 25) {
          warningCount++
        }
      })

      // Display summary
      base.output(base.colors.bold(base.bundle.getText('fragmentationSummary')))
      base.output(`${base.bundle.getText('totalFragmentedTables')}: ${results.length}`)
      base.output(`${base.bundle.getText('totalDeltaSize')}: ${totalDeltaSize.toFixed(2)} MB`)
      base.output('')

      if (criticalCount > 0) {
        base.output(base.colors.red(`✗ ${criticalCount} ${base.bundle.getText('criticalFragmentation')} (≥50%)`))
      }
      if (warningCount > 0) {
        base.output(base.colors.yellow(`⚠ ${warningCount} ${base.bundle.getText('moderateFragmentation')} (25-49%)`))
      }
      base.output('')

      // Recommendations
      base.output(base.colors.bold(base.bundle.getText('recommendations')))
      base.output(base.colors.cyan('1. ' + base.bundle.getText('fragRec1')))
      base.output(base.colors.cyan('2. ' + base.bundle.getText('fragRec2')))
      base.output(base.colors.cyan('3. ' + base.bundle.getText('fragRec3')))
      base.output(base.colors.cyan('4. ' + base.bundle.getText('fragRec4')))
      base.output('')

      // Show sample merge command
      if (results.length > 0) {
        const firstTable = results[0]
        base.output(base.colors.bold(base.bundle.getText('exampleMergeCommand')))
        base.output(base.colors.gray(`  MERGE DELTA OF "${firstTable.SCHEMA_NAME}"."${firstTable.TABLE_NAME}";`))
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
