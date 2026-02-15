// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'memoryAnalysis'
export const aliases = []
export const describe = baseLite.bundle.getText("memoryAnalysis")

export const builder = baseLite.getBuilder({
  component: {
    alias: ['c', 'Component'],
    type: 'string',
    default: '*',
    desc: baseLite.bundle.getText("component")
  },
  limit: {
    alias: ['l', 'Limit'],
    type: 'number',
    default: 200,
    desc: baseLite.bundle.getText("limit")
  }
})

export let inputPrompts = {
  component: {
    description: baseLite.bundle.getText("component"),
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
  base.promptHandler(argv, getMemoryAnalysis, inputPrompts)
}

/**
 * Memory consumption breakdown by component
 * @param {object} prompts - Input prompts with component and limit
 * @returns {Promise<Array>} - Array of memory objects
 */
export async function getMemoryAnalysis(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getMemoryAnalysis')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    const component = base.dbClass.objectName(prompts.component)
    const limit = base.validateLimit(prompts.limit)

    let query = 'SELECT * FROM M_MEMORY_OBJECTS'
    let parameters = []
    if (component && component !== '*') {
      query += ' WHERE COMPONENT LIKE ?'
      parameters.push(component)
    }
    const orderedQuery = `${query} ORDER BY USED_SIZE DESC`
    const orderedQueryWithLimit = appendLimit(orderedQuery, limit, base)
    const unorderedQueryWithLimit = appendLimit(query, limit, base)

    let results
    try {
      if (parameters.length > 0) {
        results = await db.statementExecPromisified(await db.preparePromisified(orderedQueryWithLimit), parameters)
      } else {
        results = await db.execSQL(orderedQueryWithLimit)
      }
    } catch (error) {
      if (isInvalidColumnError(error)) {
        if (parameters.length > 0) {
          results = await db.statementExecPromisified(await db.preparePromisified(unorderedQueryWithLimit), parameters)
        } else {
          results = await db.execSQL(unorderedQueryWithLimit)
        }
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
 * Append LIMIT clause when needed
 * @param {string} query - Base SQL query
 * @param {number} limit - Limit value
 * @param {any} base - Base module
 * @returns {string}
 */
function appendLimit(query, limit, base) {
  if (limit || base.sqlInjection.isAcceptableParameter(limit.toString())) {
    return `${query} LIMIT ${limit.toString()}`
  }
  return query
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
