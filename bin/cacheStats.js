// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'cacheStats'
export const aliases = []
export const describe = baseLite.bundle.getText("cacheStats")

export const builder = baseLite.getBuilder({
  cacheType: {
    alias: ['t', 'CacheType'],
    type: 'string',
    choices: ['plan', 'result', 'all'],
    default: 'all',
    desc: baseLite.bundle.getText("cacheType")
  },
  limit: {
    alias: ['l', 'Limit'],
    type: 'number',
    default: 50,
    desc: baseLite.bundle.getText("limit")
  }
})

export let inputPrompts = {
  cacheType: {
    description: baseLite.bundle.getText("cacheType"),
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
  base.promptHandler(argv, getCacheStats, inputPrompts)
}

/**
 * View SQL plan cache and result cache statistics
 * @param {object} prompts - Input prompts with cacheType and limit
 * @returns {Promise<{planCache?: Array, resultCache?: Array}>}
 */
export async function getCacheStats(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getCacheStats')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    const limit = base.validateLimit(prompts.limit)
    const cacheType = prompts.cacheType || 'all'

    /** @type {{planCache?: Array, resultCache?: Array}} */
    const results = {}

    if (cacheType === 'plan' || cacheType === 'all') {
      let planQuery = 'SELECT * FROM M_SQL_PLAN_CACHE'
      if (limit || base.sqlInjection.isAcceptableParameter(limit.toString())) {
        planQuery += ` LIMIT ${limit.toString()}`
      }
      const planResults = await db.execSQL(planQuery)
      results.planCache = planResults
      base.outputTableFancy(planResults)
    }

    if (cacheType === 'result' || cacheType === 'all') {
      let resultQuery = 'SELECT * FROM M_RESULT_CACHE'
      if (limit || base.sqlInjection.isAcceptableParameter(limit.toString())) {
        resultQuery += ` LIMIT ${limit.toString()}`
      }
      const resultResults = await db.execSQL(resultQuery)
      results.resultCache = resultResults
      base.outputTableFancy(resultResults)
    }

    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}
