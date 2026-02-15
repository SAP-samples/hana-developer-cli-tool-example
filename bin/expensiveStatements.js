// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'expensiveStatements'
export const aliases = []
export const describe = baseLite.bundle.getText("expensiveStatements")

export const builder = baseLite.getBuilder({
  limit: {
    alias: ['l', 'Limit'],
    type: 'number',
    default: 50,
    desc: baseLite.bundle.getText("limit")
  },
  orderBy: {
    alias: ['o', 'OrderBy'],
    type: 'string',
    choices: ['totalTime', 'startTime'],
    default: 'totalTime',
    desc: baseLite.bundle.getText("expensiveStatementsOrderBy")
  }
})

export let inputPrompts = {
  limit: {
    description: baseLite.bundle.getText("limit"),
    type: 'number',
    required: true
  },
  orderBy: {
    description: baseLite.bundle.getText("expensiveStatementsOrderBy"),
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
  base.promptHandler(argv, getExpensiveStatements, inputPrompts)
}

/**
 * Get expensive SQL statements
 * @param {object} prompts - Input prompts with limit and orderBy
 * @returns {Promise<Array>} - Array of expensive statement objects
 */
export async function getExpensiveStatements(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getExpensiveStatements')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    const limit = base.validateLimit(prompts.limit)
    const orderByColumn = prompts.orderBy === 'startTime' ? 'START_TIME' : 'TOTAL_EXECUTION_TIME'

    let query = `SELECT * FROM M_EXPENSIVE_STATEMENTS ORDER BY ${orderByColumn} DESC`
    if (limit || base.sqlInjection.isAcceptableParameter(limit.toString())) {
      query += ` LIMIT ${limit.toString()}`
    }

    let results
    try {
      results = await db.execSQL(query)
    } catch (error) {
      if (orderByColumn === 'TOTAL_EXECUTION_TIME' && isInvalidColumnError(error)) {
        let fallbackQuery = 'SELECT * FROM M_EXPENSIVE_STATEMENTS ORDER BY START_TIME DESC'
        if (limit || base.sqlInjection.isAcceptableParameter(limit.toString())) {
          fallbackQuery += ` LIMIT ${limit.toString()}`
        }
        results = await db.execSQL(fallbackQuery)
      } else {
        throw error
      }
    }

    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Detect invalid column errors for fallback handling
 * @param {any} error - Error object
 * @returns {boolean}
 */
function isInvalidColumnError(error) {
  if (!error || !error.message) {
    return false
  }
  const message = String(error.message).toLowerCase()
  return message.includes('invalid column') || message.includes('column not found') || message.includes('unknown column')
}
