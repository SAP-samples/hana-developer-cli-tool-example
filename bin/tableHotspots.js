// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'tableHotspots [schema] [table]'
export const aliases = []
export const describe = baseLite.bundle.getText("tableHotspots")

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
  includePartitions: {
    alias: ['p', 'Partitions'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("includePartitions")
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
  includePartitions: {
    description: baseLite.bundle.getText("includePartitions"),
    type: 'boolean',
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
  base.promptHandler(argv, getTableHotspots, inputPrompts)
}

/**
 * Identify frequently accessed tables/partitions
 * @param {object} prompts - Input prompts with schema, table, includePartitions, and limit
 * @returns {Promise<{tables: Array, partitions?: Array}>}
 */
export async function getTableHotspots(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getTableHotspots')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    const schema = await base.dbClass.schemaCalc(prompts, db)
    const table = base.dbClass.objectName(prompts.table)
    const limit = base.validateLimit(prompts.limit)

    const orderByCandidates = ['TOTAL_ACCESS_COUNT', 'RECORD_COUNT']
    const tablesBaseQuery = `SELECT * FROM M_TABLE_STATISTICS WHERE SCHEMA_NAME LIKE ? AND TABLE_NAME LIKE ?`

    const tableResults = await executeWithFallbackOrdering({
      db,
      base,
      baseQuery: tablesBaseQuery,
      params: [schema, table],
      orderByCandidates,
      limit
    })

    base.outputTableFancy(tableResults)

    /** @type {{tables: Array, partitions?: Array}} */
    const results = { tables: tableResults }

    if (prompts.includePartitions) {
      const partitionsBaseQuery = `SELECT * FROM M_TABLE_PARTITIONS WHERE SCHEMA_NAME LIKE ? AND TABLE_NAME LIKE ?`

      const partitionResults = await executeWithFallbackOrdering({
        db,
        base,
        baseQuery: partitionsBaseQuery,
        params: [schema, table],
        orderByCandidates,
        limit
      })

      results.partitions = partitionResults
      base.outputTableFancy(partitionResults)
    }

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

/**
 * Execute query with ordering fallback
 * @param {object} options - Execution options
 * @param {any} options.db - Database connection
 * @param {any} options.base - Base module
 * @param {string} options.baseQuery - Base SQL query
 * @param {Array} options.params - Query parameters
 * @param {Array<string>} options.orderByCandidates - Order by candidates
 * @param {number} options.limit - Limit value
 * @returns {Promise<Array>}
 */
async function executeWithFallbackOrdering({ db, base, baseQuery, params, orderByCandidates, limit }) {
  for (const orderBy of orderByCandidates) {
    const orderedQuery = appendLimit(`${baseQuery} ORDER BY ${orderBy} DESC`, limit, base)
    try {
      return await db.statementExecPromisified(await db.preparePromisified(orderedQuery), params)
    } catch (error) {
      if (!isInvalidColumnError(error)) {
        throw error
      }
    }
  }

  const fallbackQuery = appendLimit(baseQuery, limit, base)
  return await db.statementExecPromisified(await db.preparePromisified(fallbackQuery), params)
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
