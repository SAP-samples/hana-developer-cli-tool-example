// @ts-check
import * as base from '../utils/base.js'
import * as dbInspect from '../utils/dbInspect.js'

export const command = 'inspectFunction [schema] [function]'
export const aliases = ['if', 'function', 'insFunc', 'inspectfunction']
export const describe = base.bundle.getText("inspectFunction")

export const builder = base.getBuilder({
  function: {
    alias: ['f', 'Function'],
    type: 'string',
    desc: base.bundle.getText("function")
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
  base.promptHandler(argv, functionInspect, {
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
    output: {
      description: base.bundle.getText("outputType"),
      type: 'string',
      validator: /t[bl]*|s[ql]?/,
      required: true
    }
  })
}

export async function functionInspect(prompts) {
  base.debug('functionInspect')
  const { highlight } = await import('cli-highlight')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()
  

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("function")}: ${prompts.function}`);

    let proc = await dbInspect.getFunction(db, schema, prompts.function);
    let parameters = await dbInspect.getFunctionPrams(db, proc[0].FUNCTION_OID)
    let columns = await dbInspect.getFunctionPramCols(db, proc[0].FUNCTION_OID)


    if (prompts.output === 'tbl') {
      console.log(proc[0])
      console.log("\n")
      base.outputTableFancy(parameters)
      base.outputTableFancy(columns)
    } else if (prompts.output === 'sql') {
      let definition = await dbInspect.getDef(db, schema, prompts.function);
      console.log(highlight(definition))
    }
    return base.end()
  } catch (error) {
    await base.error(error)
  }
}