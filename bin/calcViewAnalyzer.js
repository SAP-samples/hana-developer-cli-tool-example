// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'calcViewAnalyzer [schema] [view]'
export const aliases = ['cva', 'analyzeCalcView', 'calcview']
export const describe = baseLite.bundle.getText("calcViewAnalyzer")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  view: {
    alias: ['v'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("view")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  metrics: {
    alias: ['m'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("metrics")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 100,
    desc: baseLite.bundle.getText("limit")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})).wrap(160).example('hana-cli calcViewAnalyzer --view myView --schema MYSCHEMA', baseLite.bundle.getText("calcViewAnalyzerExample")).wrap(160).epilog(buildDocEpilogue('calcViewAnalyzer', 'analysis-tools', ['views', 'erdDiagram']))

export let inputPrompts = {
  view: {
    description: baseLite.bundle.getText("view"),
    type: 'string',
    required: true
  },
  schema: {
    description: baseLite.bundle.getText("schema"),
    type: 'string',
    required: true
  },
  metrics: {
    description: baseLite.bundle.getText("metrics"),
    type: 'boolean',
    required: false
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
  base.promptHandler(argv, analyzeCalcView, inputPrompts)
}

/**
 * Analyze calculation view performance metrics
 * @param {object} prompts - Input prompts with schema, view, and metrics flag
 * @returns {Promise<Array>} - Array of calculation view performance data
 */
export async function analyzeCalcView(prompts) {
  const base = await import('../utils/base.js')
  base.debug('analyzeCalcView')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    const schema = await base.dbClass.schemaCalc(prompts, db)
    const view = base.dbClass.objectName(prompts.view)
    const limit = base.validateLimit(prompts.limit)

    // Query for calculation view metadata and performance info
    let query = `
SELECT 
  SCHEMA_NAME,
  VIEW_NAME,
  VIEW_TYPE,
  COMMENTS,
  IS_VALID,
  CREATE_TIME
FROM SYS.VIEWS
WHERE SCHEMA_NAME LIKE ? AND VIEW_NAME LIKE ? AND VIEW_TYPE = 'CALC'
ORDER BY SCHEMA_NAME, VIEW_NAME`

    if (limit || base.sqlInjection.isAcceptableParameter(limit.toString())) {
      query += ` LIMIT ${limit.toString()}`
    }

    let results = await db.statementExecPromisified(await db.preparePromisified(query), [schema, view])
    
    // If metrics flag is set, get additional performance metrics
    if (prompts.metrics) {
      const metricsResults = await getCalcViewMetrics(db, schema, view, limit)
      base.outputTableFancy(metricsResults)
    }
    
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
    return []
  }
}

/**
 * Get calculation view performance metrics
 * @param {object} db - Database connection
 * @param {string} schema - Schema name
 * @param {string} view - View name
 * @param {number} limit - Result limit
 * @returns {Promise<void>}
 */
async function getCalcViewMetrics(db, schema, view, limit) {
  const base = await import('../utils/base.js')
  
  const metricsQuery = `
SELECT 
  SCHEMA_NAME,
  VIEW_NAME,
  VIEW_TYPE,
  CREATE_TIME
FROM SYS.VIEWS
WHERE SCHEMA_NAME LIKE ? AND VIEW_NAME LIKE ? AND VIEW_TYPE = 'CALC'
ORDER BY CREATE_TIME DESC`

  const results = await db.statementExecPromisified(
    await db.preparePromisified(metricsQuery), 
    [schema, view]
  )
  
  return results
}
