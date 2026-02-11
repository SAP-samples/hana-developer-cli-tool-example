// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'roles [schema] [role]'
export const aliases = ['r', 'listRoles', 'listroles']
export const describe = baseLite.bundle.getText("roles")

export const builder = baseLite.getBuilder({
  role: {
    alias: ['r', 'Role'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("role")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: baseLite.bundle.getText("limit")
  }
})

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getRoles, {
    role: {
      description: base.bundle.getText("role"),
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
 * Get list of database roles
 * @param {object} prompts - Input prompts with schema, role pattern, and limit
 * @returns {Promise<Array>} - Array of role objects
 */
export async function getRoles(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getRoles')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.debug(`${baseLite.bundle.getText("schema")}: ${schema}, ${baseLite.bundle.getText("role")}: ${prompts.role}`)

    let results = await getRolesInt(schema, prompts.role, db, prompts.limit)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}


/**
 * Internal function to get roles with filters
 * @param {string} schema - Schema name
 * @param {string} role - Role name pattern
 * @param {object} client - Database client
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of role objects
 */
async function getRolesInt(schema, role, client, limit) {
  const base = await import('../utils/base.js')
  limit = base.validateLimit(limit)
  base.debug(`getRolesInt ${schema} ${role} ${limit}`)
  role = base.dbClass.objectName(role)
  let query = ''
  if (schema === '%') {
    query =
      `SELECT ROLE_SCHEMA_NAME, ROLE_NAME, CREATOR, CREATE_TIME  from ROLES 
    WHERE (ROLE_SCHEMA_NAME LIKE ? OR ROLE_SCHEMA_NAME IS NULL)
      AND ROLE_NAME LIKE ? 
    ORDER BY ROLE_SCHEMA_NAME, ROLE_NAME `
  } else if (schema === 'null') {
    query =
      `SELECT ROLE_SCHEMA_NAME, ROLE_NAME, CREATOR, CREATE_TIME  from ROLES 
  WHERE (ROLE_SCHEMA_NAME IS NULL or ROLE_SCHEMA_NAME = ?)
    AND ROLE_NAME LIKE ? 
  ORDER BY ROLE_SCHEMA_NAME, ROLE_NAME `
  } else {
    query =
      `SELECT ROLE_SCHEMA_NAME, ROLE_NAME, CREATOR, CREATE_TIME  from ROLES 
    WHERE ROLE_SCHEMA_NAME LIKE ? 
      AND ROLE_NAME LIKE ? 
    ORDER BY ROLE_SCHEMA_NAME, ROLE_NAME `
  }

  if (limit || base.sqlInjectionUtils.isAcceptableParameter(limit.toString())) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, role])
}