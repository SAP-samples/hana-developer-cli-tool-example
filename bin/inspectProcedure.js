// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as dbInspect from '../utils/dbInspect.js'

export const command = 'inspectProcedure [schema] [procedure]'
export const aliases = ['ip', 'procedure', 'insProc', 'inspectprocedure', 'inspectsp']
export const describe = baseLite.bundle.getText("inspectProcedure")

export const builder = baseLite.getBuilder({
  procedure: {
    alias: ['p', 'Procedure', 'sp'],
    type: 'string',
    desc: baseLite.bundle.getText("procedure")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  output: {
    alias: ['o', 'Output'],
    choices: ["tbl", "sql"],
    default: "tbl",
    type: 'string',
    desc: baseLite.bundle.getText("outputType")
  }
})

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, procedureInspect, {
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
    output: {
      description: base.bundle.getText("outputType"),
      type: 'string',
      validator: /t[bl]*|s[ql]?/,
      required: true
    }
  })
}

/**
 * Inspect a stored procedure and display its metadata, parameters, and definition
 * @param {object} prompts - Input prompts with schema, procedure name, and output format
 * @returns {Promise<void>}
 */
export async function procedureInspect(prompts) {
  const base = await import('../utils/base.js')
  base.debug('procedureInspect')
  const { highlight } = await import('cli-highlight')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.debug(`${baseLite.bundle.getText("schema")}: ${schema}, ${baseLite.bundle.getText("procedure")}: ${prompts.procedure}`)

    let proc = await dbInspect.getProcedure(db, schema, prompts.procedure)
    let parameters = await dbInspect.getProcedurePrams(db, proc[0].PROCEDURE_OID)
    let columns = await dbInspect.getProcedurePramCols(db, proc[0].PROCEDURE_OID)


    if (prompts.output === 'tbl') {
      console.log(proc[0])
      console.log("\n")
      base.outputTableFancy(parameters)
      base.outputTableFancy(columns)
    } else if (prompts.output === 'sql') {
      let definition = await dbInspect.getDef(db, schema, prompts.procedure)
      console.log(highlight(definition))
    }
    return base.end()
  } catch (error) {
    await base.error(error)
  }
}