// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as dbInspect from '../utils/dbInspect.js'

export const command = 'inspectFunction [schema] [function]'
export const aliases = ['if', 'function', 'insFunc', 'inspectfunction']
export const describe = baseLite.bundle.getText("inspectFunction")

export const builder = baseLite.getBuilder({
  function: {
    alias: ['f', 'Function'],
    type: 'string',
    desc: baseLite.bundle.getText("function")
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

export async function handler (argv) {
  const base = await import('../utils/base.js')
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
  const base = await import('../utils/base.js')
  base.debug('functionInspect')
  const { highlight } = await import('cli-highlight')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()
  

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.debug(`${baseLite.bundle.getText("schema")}: ${schema}, ${baseLite.bundle.getText("function")}: ${prompts.function}`);

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