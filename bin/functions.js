// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'functions [schema] [function]'
export const aliases = ['f', 'listFuncs', 'ListFunc', 'listfuncs', 'Listfunc', "listFunctions", "listfunctions"]
export const describe = baseLite.bundle.getText("functions")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  functionName: {
    alias: ['f', 'function'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("function")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: baseLite.bundle.getText("limit")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})).example(
  'hana-cli functions --function myFunction --schema MYSCHEMA',
  baseLite.bundle.getText("functionsExample")
)

export let inputPrompts = {
  functionName: {
    description: baseLite.bundle.getText("function"),
    type: 'string',
    required: true
  },
  schema: {
    description: baseLite.bundle.getText("schema"),
    type: 'string',
    required: true
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
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getFunctions, inputPrompts)
}

/**
 * Get list of functions from database
 * @param {object} prompts - Input prompts with schema, function, and limit
 * @returns {Promise<Array>} - Array of function objects
 */
export async function getFunctions(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getFunctions')
  try {
    base.setPrompts(prompts)

    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.output(base.bundle.getText("log.schemaFunction", [schema, prompts.functionName]))

    let results = await getFunctionsInt(schema, prompts.functionName, db, prompts.limit)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}


/**
 * Internal function to get functions with filters
 * @param {string} schema - Schema name
 * @param {string} functionName - Function name pattern
 * @param {object} client - Database client
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of function objects
 */
async function getFunctionsInt(schema, functionName, client, limit) {
  const base = await import('../utils/base.js')
  limit = base.validateLimit(limit)
  base.debug(`getFunctionsInt ${schema} ${functionName} ${limit}`)
  functionName = base.dbClass.objectName(functionName)

  var query =
    `SELECT SCHEMA_NAME, FUNCTION_NAME, SQL_SECURITY, CREATE_TIME from FUNCTIONS 
  WHERE SCHEMA_NAME LIKE ? 
    AND FUNCTION_NAME LIKE ? 
  ORDER BY FUNCTION_NAME `
  if (limit || base.sqlInjection.isAcceptableParameter(limit.toString())) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, functionName])
}

// Support direct execution (for testing and standalone use)
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('functions.js')) {
  const yargs = (await import('yargs')).default
  const { hideBin } = await import('yargs/helpers')
  
  const argv = await builder(yargs(hideBin(process.argv))
    .usage(`${baseLite.bundle.getText("cli.usage")}${command}\n\n${describe}`)
    .help('help').alias('help', 'h')
    .wrap(null))
    .argv
  
  if (!argv.help && !argv.h) {
    handler(argv)
  }
}