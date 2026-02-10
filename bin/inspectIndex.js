// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'inspectIndex [schema] [index]'
export const aliases = ['ii', 'index', 'insIndex', 'inspectindex']
export const describe = baseLite.bundle.getText("inspectIndex")

export const builder = baseLite.getBuilder({
  index: {
    alias: ['i', 'Index'],
    type: 'string',
    desc: baseLite.bundle.getText("index")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  }
})

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, indexInspect, {
    schema: {
      description: base.bundle.getText("schema"),
      type: 'string',
      required: true
    },
    index: {
      description: base.bundle.getText("index"),
      type: 'string',
      required: true
    }
  })
}

export async function indexInspect(prompts) {
  const base = await import('../utils/base.js')
  base.debug('indexInspect')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.output(`${baseLite.bundle.getText("schema")}: ${schema}, ${baseLite.bundle.getText("index")}: ${prompts.index}`)

    let query =
      `SELECT *  
  FROM INDEXES 
  WHERE SCHEMA_NAME = ? 
    AND INDEX_NAME = ?`
    let indexDetails = (await db.statementExecPromisified(await db.preparePromisified(query), [schema, prompts.index]))
    base.outputTableFancy(indexDetails)

    base.output(baseLite.bundle.getText("indexColumns"))
    query =
      `SELECT *
  FROM  INDEX_COLUMNS
  WHERE SCHEMA_NAME = ? 
  AND INDEX_NAME = ?`
    let resultsColumns = await db.statementExecPromisified(await db.preparePromisified(query), [schema, prompts.index])
    base.outputTableFancy(resultsColumns)

    return base.end()
  } catch (error) {
    await base.error(error)
  }
}