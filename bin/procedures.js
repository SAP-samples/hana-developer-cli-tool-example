// @ts-check
import * as base from '../utils/base.js'
import dbClass from 'sap-hdbext-promisfied'
import * as hdbext from '@sap/hdbext'

export const command = 'procedures [schema] [procedure]'
export const aliases = ['p', 'listProcs', 'ListProc', 'listprocs', 'Listproc', "listProcedures", "listprocedures"]
export const describe = base.bundle.getText("procedures")

export const builder = base.getBuilder({
  procedure: {
    alias: ['p', 'Procedure'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("procedure")
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

export async function getProcedures(prompts) {
  base.debug('getProcedures')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await dbClass.schemaCalc(prompts, db);
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("procedure")}: ${prompts.procedure}`);

    let results = await getProceduresInt(schema, prompts.procedure, db, prompts.limit)
    base.outputTable(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}

async function getProceduresInt(schema, procedure, client, limit) {
  base.debug(`getProceduresInt ${schema} ${procedure} ${limit}`)
  procedure = dbClass.objectName(procedure)
  let query =
    `SELECT SCHEMA_NAME, PROCEDURE_NAME, SQL_SECURITY, CREATE_TIME from PROCEDURES 
  WHERE SCHEMA_NAME LIKE ? 
    AND PROCEDURE_NAME LIKE ? 
  ORDER BY PROCEDURE_NAME `
  if (limit | hdbext.sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, procedure])
}