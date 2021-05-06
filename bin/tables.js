const base = require("../utils/base")

exports.command = 'tables [schema] [table]'
exports.aliases = ['t', 'listTables', 'listtables']
exports.describe = base.bundle.getText("tables")

exports.builder = base.getBuilder({
  table: {
    alias: ['t', 'Table'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("table")
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
  base.promptHandler(argv, getTables, {
    table: {
      description: base.bundle.getText("table"),
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

async function getTables(prompts) {
  try {
    base.setPrompts(prompts)
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(prompts))

    let schema = await dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("table")}: ${prompts.table}`)

    let results = await getTablesInt(schema, prompts.table, db, prompts.limit)
    base.outputTable(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}

async function getTablesInt(schema, table, client, limit) {
  const dbClass = require("sap-hdbext-promisfied")  
  table = dbClass.objectName(table)

  let query =
    `SELECT SCHEMA_NAME, TABLE_NAME, TO_NVARCHAR(TABLE_OID) AS TABLE_OID, COMMENTS  from TABLES 
  WHERE SCHEMA_NAME LIKE ? 
    AND TABLE_NAME LIKE ? 
  ORDER BY SCHEMA_NAME, TABLE_NAME `
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, table])
}