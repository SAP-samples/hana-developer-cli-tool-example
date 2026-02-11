// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'schemas [schema]'
export const aliases = ['sch', 'getSchemas', 'listSchemas', 's']
export const describe = baseLite.bundle.getText("schemas")

export const builder = baseLite.getBuilder({
  schema: {
    alias: ['s', 'schemas'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("schema")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: baseLite.bundle.getText("limit")
  },
  all: {
    alias: ['al', 'allSchemas'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("allSchemas")
  }
})

export let inputPrompts = {
  schema: {
    description: baseLite.bundle.getText("schema"),
    type: 'string',
    required: true
  },
  all: {
    description: baseLite.bundle.getText("allSchemas"),
    type: 'boolean',
    required: true,
    ask: () => {
      return false
    }
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
  base.promptHandler(argv, getSchemas, inputPrompts)
}

/**
 * Get list of schemas from database
 * @param {object} prompts - Input prompts with schema pattern and limit
 * @returns {Promise<Array>} - Array of schema objects
 */
export async function getSchemas(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getSchemas')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let results = await getSchemasInt(prompts.schema, db, prompts.limit, prompts.all)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Internal function to get schemas with filters
 * @param {string} schema - Schema name pattern
 * @param {object} client - Database client
 * @param {number} limit - Maximum number of results
 * @param {boolean} all - Include all schemas or only those with privileges
 * @returns {Promise<Array>} - Array of schema objects
 */
async function getSchemasInt(schema, client, limit, all) {
  const base = await import('../utils/base.js')
  limit = base.validateLimit(limit)
  base.debug(`getSchemasInt ${schema} ${limit} ${all}`)
  schema = base.dbClass.objectName(schema)
  let hasPrivileges = 'FALSE'
  if (!all) { hasPrivileges = 'TRUE' }
  console.log(schema)
  var query =
    `SELECT * from SCHEMAS 
        WHERE SCHEMA_NAME LIKE ? 
          AND HAS_PRIVILEGES = ?
	      ORDER BY SCHEMA_NAME `
  if (limit || base.sqlInjectionUtils.isAcceptableParameter(limit.toString())) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, hasPrivileges])
}