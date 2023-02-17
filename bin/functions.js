// @ts-check
import * as base from '../utils/base.js'

export const command = 'functions [schema] [function]'
export const aliases = ['f', 'listFuncs', 'ListFunc', 'listfuncs', 'Listfunc', "listFunctions", "listfunctions"]
export const describe = base.bundle.getText("functions")

export const builder = base.getBuilder({
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

export let inputPrompts = {
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
}

export function handler (argv) {
  base.promptHandler(argv, getFunctions, inputPrompts)
}

export async function getFunctions(prompts) {
  base.debug('getFunctions')
  try {
    base.setPrompts(prompts)

    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.output(`Schema: ${schema}, Function: ${prompts.function}`)

    let results = await getFunctionsInt(schema, prompts.function, db, prompts.limit)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}


async function getFunctionsInt(schema, functionName, client, limit) {
  base.debug(`getFunctionsInt ${schema} ${functionName} ${limit}`)
  functionName = base.dbClass.objectName(functionName)

  var query =
    `SELECT SCHEMA_NAME, FUNCTION_NAME, SQL_SECURITY, CREATE_TIME from FUNCTIONS 
  WHERE SCHEMA_NAME LIKE ? 
    AND FUNCTION_NAME LIKE ? 
  ORDER BY FUNCTION_NAME `
  if (limit | base.sqlInjection.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, functionName])
}