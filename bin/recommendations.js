// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'recommendations'
export const aliases = ['rec', 'recommend']
export const describe = baseLite.bundle.getText("recommendations")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  category: {
    alias: ['c'],
    type: 'string',
    default: 'all',
    choices: ['all', 'indexes', 'queries', 'cache', 'tables', 'locks', 'memory'],
    desc: 'Recommendation category'
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 50,
    desc: baseLite.bundle.getText("limit")
  }
})).example('hana-cli recommendations --category indexes --limit 25', baseLite.bundle.getText('recommendationsExample'))

export let inputPrompts = {
  category: {
    description: 'Recommendation category',
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
  base.promptHandler(argv, getRecommendations, inputPrompts)
}

/**
 * AI-based performance recommendations
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export async function getRecommendations(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getRecommendations')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    const category = prompts.category
    const limit = base.validateLimit(prompts.limit)

    base.output('')
    base.output(base.colors.bold(base.bundle.getText('aiRecommendationsHeader')))
    base.output(`${base.bundle.getText('categoryLabel')}: ${category === 'all' ? base.bundle.getText('allCategories') : category}`)
    base.output('')

    const recommendations = []

    // Get index recommendations
    if (category === 'all' || category === 'indexes') {
      try {
        const indexRecs = await getIndexRecommendations(db, base, limit)
        if (indexRecs && indexRecs.length > 0) {
          recommendations.push({ category: 'Missing Indexes', items: indexRecs })
        }
      } catch (error) {
      base.debug(`${base.bundle.getText('errorGettingDetails')}: ${error.message}`)
      }
    }

    // Get query optimization recommendations
    if (category === 'all' || category === 'queries') {
      try {
        const queryRecs = await getQueryOptimizationRecommendations(db, base, limit)
        if (queryRecs && queryRecs.length > 0) {
          recommendations.push({ category: 'Query Optimization', items: queryRecs })
        }
      } catch (error) {
        base.debug(`Error getting query recommendations: ${error.message}`)
      }
    }

    // Get cache recommendations
    if (category === 'all' || category === 'cache') {
      try {
        const cacheRecs = await getCacheRecommendations(db, base)
        if (cacheRecs && cacheRecs.length > 0) {
          recommendations.push({ category: 'Cache Optimization', items: cacheRecs })
        }
      } catch (error) {
        base.debug(`Error getting cache recommendations: ${error.message}`)
      }
    }

    // Get table structure recommendations
    if (category === 'all' || category === 'tables') {
      try {
        const tableRecs = await getTableRecommendations(db, base, limit)
        if (tableRecs && tableRecs.length > 0) {
          recommendations.push({ category: 'Table Structure', items: tableRecs })
        }
      } catch (error) {
        base.debug(`Error getting table recommendations: ${error.message}`)
      }
    }

    // Get lock optimization recommendations
    if (category === 'all' || category === 'locks') {
      try {
        const lockRecs = await getLockOptimizationRecommendations(db, base)
        if (lockRecs && lockRecs.length > 0) {
          recommendations.push({ category: 'Lock Optimization', items: lockRecs })
        }
      } catch (error) {
        base.debug(`Error getting lock recommendations: ${error.message}`)
      }
    }

    // Get memory optimization recommendations
    if (category === 'all' || category === 'memory') {
      try {
        const memoryRecs = await getMemoryOptimizationRecommendations(db, base)
        if (memoryRecs && memoryRecs.length > 0) {
          recommendations.push({ category: 'Memory Optimization', items: memoryRecs })
        }
      } catch (error) {
        base.debug(`Error getting memory recommendations: ${error.message}`)
      }
    }

    if (recommendations.length === 0) {
      base.output(base.bundle.getText('noRecommendationsAvailable'))
      await base.end()
      return
    }

    // Display recommendations grouped by category
    recommendations.forEach((rec, idx) => {
      base.output(base.colors.bold(`${idx + 1}. ${rec.category}`))
      rec.items.forEach((item, itemIdx) => {
        base.output(`   ${itemIdx + 1}. ${item}`)
      })
      base.output('')
    })

    base.output(`${base.bundle.getText('totalRecommendations')}: ${recommendations.reduce((sum, r) => sum + r.items.length, 0)}`)
    base.output('')
    await base.end()
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Get index recommendations
 */
async function getIndexRecommendations(db, base, limit) {
  const recommendations = []

  try {
    // Check for frequently scanned tables without indexes
    const query = `
      SELECT DISTINCT
        SCHEMA_NAME,
        TABLE_NAME,
        COUNT(*) OVER (PARTITION BY SCHEMA_NAME, TABLE_NAME) as "Scan Count"
      FROM M_TABLE_STATISTICS
      WHERE SCAN_COUNT > RECORD_COUNT
      ORDER BY SCAN_COUNT DESC
      LIMIT 10
    `

    const results = await db.execSQL(query)

    if (results && results.length > 0) {
      results.forEach(row => {
  recommendations.push(
    base.bundle.getText('createIndexRecommendation', [row.SCHEMA_NAME, row.TABLE_NAME, row['Scan Count']])
  )
      })
    }
  } catch (error) {
    if (error.message && error.message.includes('Could not find table')) {
      base.debug('Index recommendations not accessible from this schema context (HDI container limitation)')
    } else {
      base.debug(`Index recommendation query error: ${error.message}`)
    }
  }

  return recommendations
}

/**
 * Get query optimization recommendations
 */
async function getQueryOptimizationRecommendations(db, base, limit) {
  const recommendations = []

  try {
    // Look for expensive statements
    const query = `
      SELECT 
        STATEMENT_HASH,
        TOTAL_EXECUTION_TIME,
        EXECUTION_COUNT,
        ROUND(TOTAL_EXECUTION_TIME / EXECUTION_COUNT, 2) as "Avg Time"
      FROM M_EXPENSIVE_STATEMENTS
      ORDER BY TOTAL_EXECUTION_TIME DESC
      LIMIT 5
    `

    const results = await db.execSQL(query)

    if (results && results.length > 0) {
      results.forEach(row => {
        if (row['Avg Time'] > 10000) {
          recommendations.push(
            `Review query ${row.STATEMENT_HASH} - Average execution time: ${row['Avg Time']}ms, Executed: ${row.EXECUTION_COUNT} times`
          )
        }
      })
    }
  } catch (error) {
    if (error.message && error.message.includes('Could not find table')) {
      base.debug('Query optimization recommendations not accessible from this schema context (HDI container limitation)')
    } else {
      base.debug(`Query recommendation query error: ${error.message}`)
    }
  }

  return recommendations
}

/**
 * Get cache recommendations
 */
async function getCacheRecommendations(db, base) {
  const recommendations = []

  try {
    const stats = await db.execSQL(`
      SELECT 
        CACHE_HIT_RATIO,
        RESULT_CACHE_HIT_RATIO
      FROM M_CACHES
      LIMIT 1
    `)

    if (stats && stats.length > 0) {
      const hitRatio = parseFloat(stats[0].CACHE_HIT_RATIO)
      if (hitRatio < 0.80) {
        recommendations.push(base.bundle.getText('lowCacheHitRatio', [(hitRatio * 100).toFixed(2)]))
      }
      if (hitRatio > 0.95) {
        recommendations.push(base.bundle.getText('highCacheHitRatio', [(hitRatio * 100).toFixed(2)]))
      }
    }
  } catch (error) {
    if (error.message && error.message.includes('Could not find table')) {
      base.debug('Cache recommendations not accessible from this schema context (HDI container limitation)')
    } else {
      base.debug(`Cache recommendation query error: ${error.message}`)
    }
  }

  return recommendations
}

/**
 * Get table structure recommendations
 */
async function getTableRecommendations(db, base, limit) {
  const recommendations = []

  try {
    // Check for uncompressed large tables
    const query = `
      SELECT 
        SCHEMA_NAME,
        TABLE_NAME,
        MEMORY_SIZE_IN_TOTAL,
        COMPRESSION_RATIO
      FROM M_TABLE_STATISTICS
      WHERE MEMORY_SIZE_IN_TOTAL > 104857600
      AND COMPRESSION_RATIO = 0
      ORDER BY MEMORY_SIZE_IN_TOTAL DESC
      LIMIT 5
    `

    const results = await db.execSQL(query)

    if (results && results.length > 0) {
      results.forEach(row => {
        const sizeMB = (row.MEMORY_SIZE_IN_TOTAL / 1048576).toFixed(2)
        recommendations.push(
          base.bundle.getText('uncompressedTableRecommendation', [row.SCHEMA_NAME, row.TABLE_NAME, sizeMB])
        )
      })
    }
  } catch (error) {
    if (error.message && error.message.includes('Could not find table')) {
      base.debug('Table structure recommendations not accessible from this schema context (HDI container limitation)')
    } else {
      base.debug(`Table recommendation query error: ${error.message}`)
    }
  }

  return recommendations
}

/**
 * Get lock optimization recommendations
 */
async function getLockOptimizationRecommendations(db, base) {
  const recommendations = []

  try {
    const lockStats = await db.execSQL(`
      SELECT COUNT(*) as "Lock Count",
             COUNT(CASE WHEN LOCK_WAIT_TIME > 1000000 THEN 1 END) as "Slow Locks"
      FROM M_LOCKS
    `)

    if (lockStats && lockStats.length > 0) {
      const slowLocks = lockStats[0]['Slow Locks'] || 0
      if (slowLocks > 0) {
        recommendations.push(
          base.bundle.getText('slowLocksDetected', [slowLocks])
        )
      }
    }
  } catch (error) {
    if (error.message && error.message.includes('Could not find table')) {
      base.debug('Lock optimization recommendations not accessible from this schema context (HDI container limitation)')
    } else {
      base.debug(`Lock recommendation query error: ${error.message}`)
    }
  }

  return recommendations
}

/**
 * Get memory optimization recommendations
 */
async function getMemoryOptimizationRecommendations(db, base) {
  const recommendations = []

  try {
    const memStats = await db.execSQL(`
      SELECT 
        TOTAL_MEMORY_USED_SIZE,
        TOTAL_MEMORY_ALLOCATED_SIZE,
        ROUND(100.0 * TOTAL_MEMORY_USED_SIZE / TOTAL_MEMORY_ALLOCATED_SIZE, 2) as "Usage %"
      FROM M_HOST_RESOURCE_UTILIZATION
    `)

    if (memStats && memStats.length > 0) {
      const usage = parseFloat(memStats[0]['Usage %'])
      if (usage > 90) {
        recommendations.push(
          base.bundle.getText('highMemoryUtilization', [memStats[0]['Usage %']])
        )
      } else if (usage < 30) {
        recommendations.push(
          base.bundle.getText('lowMemoryUtilization', [memStats[0]['Usage %']])
        )
      }
    }
  } catch (error) {
    if (error.message && error.message.includes('Could not find table')) {
      base.debug('Memory optimization recommendations not accessible from this schema context (HDI container limitation)')
    } else {
      base.debug(`Memory recommendation query error: ${error.message}`)
    }
  }

  return recommendations
}
