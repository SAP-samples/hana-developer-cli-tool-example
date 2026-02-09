// @ts-check
import * as base from '../utils/base.js'

export const command = 'roles [schema] [role]'
export const aliases = ['r', 'listRoles', 'listroles']
export const describe = base.bundle.getText("roles")

export const builder = base.getBuilder({
  role: {
    alias: ['r', 'Role'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("role")
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

export async function getRoles(prompts) {
  base.debug('getRoles')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("role")}: ${prompts.role}`)

    let results = await getRolesInt(schema, prompts.role, db, prompts.limit)
    base.outputTableFancy(results)

    return results
  } catch (error) {
    await base.error(error)
  }
}


async function getRolesInt(schema, role, client, limit) {
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

  if (limit | base.sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, role])
}