const base = require("../utils/base")

exports.command = 'procedures [schema] [procedure]'
exports.aliases = ['p', 'listProcs', 'ListProc', 'listprocs', 'Listproc', "listProcedures", "listprocedures"]
exports.describe = base.bundle.getText("procedures")

exports.builder = base.getBuilder({
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

exports.handler = (argv) => {
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

async function getProcedures(prompts) {
  base.debug('getProcedures')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()
    const dbClass = require("sap-hdbext-promisfied")

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
module.exports.getProcedures = getProcedures

async function getProceduresInt(schema, procedure, client, limit) {
  base.debug(`getProceduresInt ${schema} ${procedure} ${limit}`)
  const dbClass = require("sap-hdbext-promisfied")
  procedure = dbClass.objectName(procedure)
  let query =
    `SELECT SCHEMA_NAME, PROCEDURE_NAME, SQL_SECURITY, CREATE_TIME from PROCEDURES 
  WHERE SCHEMA_NAME LIKE ? 
    AND PROCEDURE_NAME LIKE ? 
  ORDER BY PROCEDURE_NAME `
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, procedure])
}