const base = require("../utils/base")
const dbClass = require("sap-hdbext-promisfied")
const dbInspect = require("../utils/dbInspect")

exports.command = 'callProcedure [schema] [procedure]'
exports.aliases = ['cp', 'callprocedure', 'callProc', 'callproc', 'callSP', 'callsp']
exports.describe = base.bundle.getText("callProcedure")

exports.builder = base.getBuilder({
  procedure: {
    alias: ['p', 'Procedure', 'sp'],
    type: 'string',
    desc: base.bundle.getText("procedure")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: base.bundle.getText("schema")
  }
})


exports.handler = async (argv) => {
  let schema = {
    procedure: {
      description: base.bundle.getText("procedure"),
      type: 'string',
      required: true
    },
    schema: {
      description: base.bundle.getText("schema"),
      type: 'string',
      required: true
    }
  }

  try {
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(argv))
    let procSchema = await dbClass.schemaCalc(argv, db)
    console.log(`${base.bundle.getText("schema")}: ${procSchema}, ${base.bundle.getText("procedure")}: ${argv.procedure}`)

    let proc = await dbInspect.getProcedure(db, procSchema, argv.procedure)
    let parameters = await dbInspect.getProcedurePrams(db, proc[0].PROCEDURE_OID)


    base.debug(parameters)
    for (let parameter of parameters) {
      if (!parameter.TABLE_TYPE_NAME && parameter.PARAMETER_TYPE === 'IN') {
        let type = 'string'
        switch (parameter.DATA_TYPE_NAME) {
          case 'TINYINT':
          case 'SMALLINT':
          case 'INTEGER':
          case 'BIGINIT':
            type = 'integer'
            break
          case 'DECIMAL':
          case 'REAL':
          case 'DOUBLE':
          case 'SMALLDECIMAL':
            type = 'decimal'
            break
          case 'BOOLEAN':
            type = 'boolean'
            break
          default:
            type = 'string'
        }
        schema[parameter.PARAMETER_NAME] = {
          description: parameter.PARAMETER_NAME,
          type: type
        }
      }
    }
   base.debug(schema)
  } catch (error) {
    base.error(error)
  }
  base.promptHandler(argv, callProc, schema)
}


async function callProc(prompts) {
  try {
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(prompts))

    let schema = await dbClass.schemaCalc(prompts, db)
    let proc = await dbInspect.getProcedure(db, schema, prompts.procedure)
    let parameters = await dbInspect.getProcedurePrams(db, proc[0].PROCEDURE_OID)
    var inputParams = {
    }
    for (let parameter of parameters) {
      if (!parameter.TABLE_TYPE_NAME && parameter.PARAMETER_TYPE === 'IN') {
        inputParams[parameter.PARAMETER_NAME] = prompts[parameter.PARAMETER_NAME]
      }
    }
    let hdbext = require("@sap/hdbext")
    let sp = await db.loadProcedurePromisified(hdbext, proc[0].SCHEMA_NAME, prompts.procedure)

    let output = await db.callProcedurePromisified(sp, inputParams)
    base.debug(output)
    console.log(output.outputScalar)
    switch (Object.keys(output).length) {
      case 0:
      case 1:
        break
      case 2:
        console.table(output.results)
        break
      default:
        for (let i = 1; i < Object.keys(output).length; i++) {
          console.table(output[`results${i}`])
        }
        break
    }
    return base.end()
  } catch (error) {
    base.error(error)
  }
}