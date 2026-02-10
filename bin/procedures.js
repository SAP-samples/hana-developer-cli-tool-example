// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'procedures [schema] [procedure]'
export const aliases = ['p', 'listProcs', 'ListProc', 'listprocs', 'Listproc', "listProcedures", "listprocedures"]
export const describe = baseLite.bundle.getText("procedures")

export const builder = baseLite.getBuilder({
  procedure: {
    alias: ['p', 'Procedure'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("procedure")
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
 * @returns {void}
 */
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getProcedures, {
    procedure: {
      description: base.bundle.getText("procedure"),
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
 * Get list of procedures from database
 * @param {object} prompts - Input prompts with schema, procedure, and limit
 * @returns {Promise<Array>} - Array of procedure objects
 */
export async function getProcedures(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getProcedures')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db);
    base.debug(`${baseLite.bundle.getText("schema")}: ${schema}, ${baseLite.bundle.getText("procedure")}: ${prompts.procedure}`);

    let results = await getProceduresInt(schema, prompts.procedure, db, prompts.limit)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Internal function to get procedures with filters
 * @param {string} schema - Schema name
 * @param {string} procedure - Procedure name pattern
 * @param {object} client - Database client
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of procedure objects
 */
async function getProceduresInt(schema, procedure, client, limit) {
  const base = await import('../utils/base.js')
  base.debug(`getProceduresInt ${schema} ${procedure} ${limit}`)
  procedure = base.dbClass.objectName(procedure)
  let query =
    `SELECT SCHEMA_NAME, PROCEDURE_NAME, SQL_SECURITY, CREATE_TIME from PROCEDURES 
  WHERE SCHEMA_NAME LIKE ? 
    AND PROCEDURE_NAME LIKE ? 
  ORDER BY PROCEDURE_NAME `
  if (limit || base.sqlInjectionUtils.isAcceptableParameter(limit.toString())) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, procedure])
}