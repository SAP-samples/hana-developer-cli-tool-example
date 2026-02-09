// @ts-check
import * as base from '../utils/base.js'

export const command = 'views [schema] [view]'
export const aliases = ['v', 'listViews', 'listviews']
export const describe = base.bundle.getText("views")

export const builder = base.getBuilder({
  view: {
    alias: ['v', 'View'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("view")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: base.bundle.getText("schema")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: base.bundle.getText("limit")
  }
})

export function handler (argv) {
  base.promptHandler(argv, getViews, {
    view: {
      description: base.bundle.getText("view"),
      type: 'string',
      required: true
    },
    schema: {
      description: base.bundle.getText("schema"),
      type: 'string',
      required: true
    },
    limit: {
      description: base.bundle.getText("limit"),
      type: 'number',
      required: true
    }
  })
}

/**
 * Get list of views from database
 * @param {object} prompts - Input prompts with schema, view, and limit
 * @returns {Promise<Array>} - Array of view objects
 */
export async function getViews(prompts) {
  base.debug('getViews')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()
    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("view")}: ${prompts.view}`)

    let results = await getViewsInt(schema, prompts.view, db, prompts.limit)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Internal function to get views with filters
 * @param {string} schema - Schema name
 * @param {string} view - View name pattern
 * @param {object} client - Database client
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of view objects
 */
async function getViewsInt(schema, view, client, limit) {
  base.debug(`getViewsInt ${schema} ${view} ${limit}`)
  view = base.dbClass.objectName(view)
  let query =
    `SELECT SCHEMA_NAME, VIEW_NAME, TO_NVARCHAR(VIEW_OID) AS VIEW_OID, COMMENTS  from VIEWS 
  WHERE SCHEMA_NAME LIKE ? 
    AND VIEW_NAME LIKE ? 
  ORDER BY VIEW_NAME `
  if (limit | base.sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, view])
}