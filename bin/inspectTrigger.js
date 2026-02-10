// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'inspectTrigger [schema] [trigger]'
export const aliases = ['itrig', 'trigger', 'insTrig', 'inspecttrigger', 'inspectrigger']
export const describe = baseLite.bundle.getText("inspectTrigger")

export const builder = baseLite.getBuilder({
  trigger: {
    alias: ['t', 'Trigger'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("sequence")
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
  base.promptHandler(argv, triggerInspect, {
    trigger: {
      description: base.bundle.getText("trigger"),
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

export async function triggerInspect(prompts) {
  const base = await import('../utils/base.js')
  base.debug('triggerInspect')
  const { highlight } = await import('cli-highlight')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.debug(`${baseLite.bundle.getText("schema")}: ${schema}, ${baseLite.bundle.getText("trigger")}: ${prompts.trigger}`)

    let query =
      `SELECT *
  FROM TRIGGERS
  WHERE SCHEMA_NAME LIKE ? 
    AND TRIGGER_NAME = ? `

    let libResults = await db.statementExecPromisified(await db.preparePromisified(query), [schema, prompts.trigger])
    if (prompts.output === 'tbl') {
      console.log(libResults)
    } else if (prompts.output === 'sql') {
      let query =
        `SELECT DEFINITION from TRIGGERS
    WHERE SCHEMA_NAME LIKE ? 
      AND TRIGGER_NAME = ? `
      let definition = await db.statementExecPromisified(await db.preparePromisified(query), [schema, prompts.trigger])
      let output = definition[0].DEFINITION.toString()
      output = output.replace(new RegExp(" ,", "g"), ",\n")
      console.log(highlight(output))
    }
    return base.end()
  } catch (error) {
    await base.error(error)
  }
}