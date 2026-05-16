// @ts-check
import * as baseLite from '../utils/base-lite.js'
import { promisify } from 'util'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'queryPlan'
export const aliases = []
export const describe = baseLite.bundle.getText("queryPlan")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  sql: {
    alias: ['q', 'sql'],
    type: 'string',
    desc: baseLite.bundle.getText("query")
  }
})).wrap(160).example('hana-cli queryPlan --sql "SELECT * FROM CUSTOMERS"', baseLite.bundle.getText('queryPlanExample')).wrap(160).epilog(buildDocEpilogue('queryPlan', 'performance-monitoring', ['querySimple', 'expensiveStatements']))

export let inputPrompts = {
  sql: {
    description: baseLite.bundle.getText("query"),
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
  base.promptHandler(argv, getQueryPlan, inputPrompts)
}

/**
 * Get query execution plan for a SQL statement
 * @param {object} prompts - Input prompts with SQL statement
 * @returns {Promise<Array>} - Array of plan rows
 */
export async function getQueryPlan(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getQueryPlan')
  try {
    base.setPrompts(prompts)

    if (!prompts.sql) {
      throw new Error(base.bundle.getText("validation.requiredParam", ["sql"]))
    }

    const db = await base.createDBConnection()
    const rawExec = promisify(db.client.exec.bind(db.client))

    const statementName = buildStatementName()
    const explainSql = `EXPLAIN PLAN SET STATEMENT_NAME = '${statementName}' FOR ${prompts.sql}`

    try {
      await rawExec(explainSql)
    } catch (explainErr) {
      // hdb driver doesn't recognize EXPLAIN PLAN's FunctionCode in Result.handle,
      // but the statement executes successfully on the server side
      if (!explainErr.message?.includes('FunctionCode')) {
        throw explainErr
      }
    }

    const planQuery = `SELECT * FROM EXPLAIN_PLAN_TABLE WHERE STATEMENT_NAME = '${statementName}' ORDER BY OPERATOR_ID`
    const results = await rawExec(planQuery)

    base.outputTableFancy(results)
    return results
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Build a safe statement name for explain plan
 * @returns {string}
 */
function buildStatementName() {
  const raw = `HANA_CLI_PLAN_${Date.now()}`
  return raw.replace(/[^A-Z0-9_]/gi, '_')
}
