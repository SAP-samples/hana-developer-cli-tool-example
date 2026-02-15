// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'columnStats [schema] [table]'
export const aliases = []
export const describe = baseLite.bundle.getText("columnStats")

export const builder = baseLite.getBuilder({
  table: {
    alias: ['t', 'Table'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("table")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  limit: {
    alias: ['l', 'Limit'],
    type: 'number',
    default: 200,
    desc: baseLite.bundle.getText("limit")
  }
})

export let inputPrompts = {
  table: {
    description: baseLite.bundle.getText("table"),
    type: 'string',
    required: true
  },
  schema: {
    description: baseLite.bundle.getText("schema"),
    type: 'string',
    required: true
  },
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
  base.promptHandler(argv, getColumnStats, inputPrompts)
}

/**
 * Analyze column store statistics
 * @param {object} prompts - Input prompts with schema, table, and limit
 * @returns {Promise<Array>} - Array of column statistics
 */
export async function getColumnStats(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getColumnStats')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    const schema = await base.dbClass.schemaCalc(prompts, db)
    const table = base.dbClass.objectName(prompts.table)
    const limit = base.validateLimit(prompts.limit)

    let query = `SELECT * FROM M_CS_COLUMNS WHERE SCHEMA_NAME LIKE ? AND TABLE_NAME LIKE ? ORDER BY SCHEMA_NAME, TABLE_NAME, COLUMN_NAME`
    if (limit || base.sqlInjection.isAcceptableParameter(limit.toString())) {
      query += ` LIMIT ${limit.toString()}`
    }

    const results = await db.statementExecPromisified(await db.preparePromisified(query), [schema, table])
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}
