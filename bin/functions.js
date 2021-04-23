const base = require("../utils/base")

exports.command = 'functions [schema] [function]'
exports.aliases = ['f', 'listFuncs', 'ListFunc', 'listfuncs', 'Listfunc', "listFunctions", "listfunctions"]
exports.describe = base.bundle.getText("functions")

exports.builder = base.getBuilder({
  function: {
    alias: ['f', 'Function'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("function")
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
  base.promptHandler(argv, getFunctions, {
    function: {
      description: base.bundle.getText("function"),
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

async function getFunctions(prompts) {

  try {
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(prompts))

    let schema = await dbClass.schemaCalc(prompts, db)
    console.log(`Schema: ${schema}, Function: ${prompts.function}`)

    let results = await getFunctionsInt(schema, prompts.function, db, prompts.limit)
    console.table(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}


async function getFunctionsInt(schema, functionName, client, limit) {
  const dbClass = require("sap-hdbext-promisfied")
  functionName = dbClass.objectName(functionName)

  var query =
    `SELECT SCHEMA_NAME, FUNCTION_NAME, SQL_SECURITY, CREATE_TIME from FUNCTIONS 
  WHERE SCHEMA_NAME LIKE ? 
    AND FUNCTION_NAME LIKE ? 
  ORDER BY FUNCTION_NAME `
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, functionName])
}