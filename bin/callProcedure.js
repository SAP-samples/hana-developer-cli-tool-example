// @ts-check
import * as base from '../utils/base.js'
import * as dbInspect from '../utils/dbInspect.js'
import * as conn from '../utils/connections.js'

export const command = 'callProcedure [schema] [procedure]'
export const aliases = ['cp', 'callprocedure', 'callProc', 'callproc', 'callSP', 'callsp']
export const describe = base.bundle.getText("callProcedure")

export const builder = base.getBuilder({
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


export async function handler(argv) {
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


    const dbConn = await conn.createConnection(argv)
    const db = new base.dbClass(dbConn)
    let procSchema = await base.dbClass.schemaCalc(argv, db)
    base.debug(`${base.bundle.getText("schema")}: ${procSchema}, ${base.bundle.getText("procedure")}: ${argv.procedure}`)

    let proc = await dbInspect.getProcedure(db, procSchema, argv.procedure)
    let parameters = await dbInspect.getProcedurePrams(db, proc[0].PROCEDURE_OID)
    dbConn.disconnect()

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


export async function callProc(prompts) {
  base.debug('callProc')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    let proc = await dbInspect.getProcedure(db, schema, prompts.procedure)
    let parameters = await dbInspect.getProcedurePrams(db, proc[0].PROCEDURE_OID)
    var inputParams = {
    }
    for (let parameter of parameters) {
      if (!parameter.TABLE_TYPE_NAME && parameter.PARAMETER_TYPE === 'IN') {
        inputParams[parameter.PARAMETER_NAME] = prompts[parameter.PARAMETER_NAME]
      }
    }

    let sp = await db.loadProcedurePromisified(proc[0].SCHEMA_NAME, prompts.procedure)
    let output = await db.callProcedurePromisified(sp, inputParams)
    base.debug(output)
    base.outputTableFancy(output.outputScalar)
    switch (Object.keys(output).length) {
      case 0:
      case 1:
        break
      case 2:
        if (output.results) {
          base.outputTableFancy(output.results)
        }
        break
      default:
        for (let i = 1; i < Object.keys(output).length; i++) {
          base.outputTableFancy(output[`results${i}`])
        }
        break
    }
    return base.end()
  } catch (error) {
    base.error(error)
  }
}