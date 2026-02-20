// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'inspectIndex [schema] [index]'
export const aliases = ['ii', 'index', 'insIndex', 'inspectindex']
export const describe = baseLite.bundle.getText("inspectIndex")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  index: {
    alias: ['i'],
    type: 'string',
    desc: baseLite.bundle.getText("index")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  }
})).wrap(160).example('hana-cli inspectIndex --index myIndex --schema MYSCHEMA', baseLite.bundle.getText("inspectIndexExample")).wrap(160).epilog(buildDocEpilogue('inspectIndex', 'object-inspection', ['indexes', 'tables', 'tableHotspots']))

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