const base = require("../utils/base")

exports.command = 'schemas [schema]'
exports.aliases = ['sch', 'getSchemas', 'listSchemas']
exports.describe = base.bundle.getText("schemas")

exports.builder = base.getBuilder({
  schema: {
    alias: ['s', 'schemas'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("schema")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: base.bundle.getText("limit")
  },
  all: {
    alias: ['al', 'allSchemas'],
    type: 'boolean',
    default: false,
    desc: base.bundle.getText("allSchemas")
  }
})

exports.handler = (argv) => {
  base.promptHandler(argv, getSchemas, {
    schema: {
      description: base.bundle.getText("schema"),
      type: 'string',
      required: true
    },
    all: {
      description: base.bundle.getText("allSchemas"),
      type: 'boolean',
      required: true,
      ask: () => {
        return false
      }
    },
    limit: {
      description: base.bundle.getText("limit"),
      type: 'number',
      required: true
    }
  })
}

async function getSchemas(prompts) {
  base.debug('getSchemas')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let results = await getSchemasInt(prompts.schema, db, prompts.limit, prompts.all);
    console.table(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}

async function getSchemasInt(schema, client, limit, all) {
  base.debug(`getSchemasInt ${schema} ${limit} ${all}`)
  const dbClass = require("sap-hdbext-promisfied")  
  schema = dbClass.objectName(schema)
  let hasPrivileges = 'FALSE'
  if (!all) { hasPrivileges = 'TRUE' }
  console.log(schema)
  var query =
    `SELECT * from SCHEMAS 
        WHERE SCHEMA_NAME LIKE ? 
          AND HAS_PRIVILEGES = ?
	      ORDER BY SCHEMA_NAME `
  if (limit !== null) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, hasPrivileges])
}