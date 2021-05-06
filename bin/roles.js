const base = require("../utils/base")

exports.command = 'roles [schema] [role]'
exports.aliases = ['r', 'listRoles', 'listroles']
exports.describe = base.bundle.getText("roles")

exports.builder = base.getBuilder({
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

exports.handler = (argv) => {
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

async function getRoles(prompts) {
  try {
    base.setPrompts(prompts)
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(prompts))

    let schema = await dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("role")}: ${prompts.role}`)

    let results = await getRolesInt(schema, prompts.role, db, prompts.limit)
    base.outputTable(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}


async function getRolesInt(schema, role, client, limit) {
  const dbClass = require("sap-hdbext-promisfied")  
  role = dbClass.objectName(role)
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

  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, role])
}