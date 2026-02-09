// @ts-check
import * as base from '../utils/base.js'
import * as dbInspect from '../utils/dbInspect.js'

export const command = 'inspectProcedure [schema] [procedure]'
export const aliases = ['ip', 'procedure', 'insProc', 'inspectprocedure', 'inspectsp']
export const describe = base.bundle.getText("inspectProcedure")

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
  },
  output: {
    alias: ['o', 'Output'],
    choices: ["tbl", "sql"],
    default: "tbl",
    type: 'string',
    desc: base.bundle.getText("outputType")
  }
})

export function handler (argv) {
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

export async function procedureInspect(prompts) {
  base.debug('procedureInspect')
  const { highlight } = await import('cli-highlight')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("procedure")}: ${prompts.procedure}`)

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