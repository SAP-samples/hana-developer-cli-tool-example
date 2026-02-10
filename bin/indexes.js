// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'indexes [schema] [indexes]'
export const aliases = ['ind', 'listIndexes', 'ListInd', 'listind', 'Listind', "listfindexes"]
export const describe = baseLite.bundle.getText("indexes")

export const builder = baseLite.getBuilder({
  indexes: {
    alias: ['i', 'Indexes'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("function")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: baseLite.bundle.getText("limit")
  }
})

export let inputPrompts = {
  indexes: {
    description: baseLite.bundle.getText("indexes"),
    type: 'string',
    required: true
  },
  schema: {
    description: baseLite.bundle.getText("schema"),
    type: 'string',
    required: true
  },
  limit: {
    description: baseLite.bundle.getText("limit"),
    type: 'number',
    required: true
  }
}

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getIndexes, inputPrompts)
}

export async function getIndexes(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getIndexes')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.output(`Schema: ${schema}, Index: ${prompts.indexes}`)

    let results = await getIndexesInt(schema, prompts.indexes, db, prompts.limit)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}


async function getIndexesInt(schema, indexes, client, limit) {
  const base = await import('../utils/base.js')
  base.debug(`getIndexesInt ${schema} ${indexes} ${limit}`)
  indexes = base.dbClass.objectName(indexes)

  let query =
    `SELECT SCHEMA_NAME, TABLE_NAME, INDEX_NAME, INDEX_TYPE, CONSTRAINT, CREATE_TIME from INDEXES 
  WHERE SCHEMA_NAME LIKE ? 
    AND INDEX_NAME LIKE ? 
  ORDER BY SCHEMA_NAME, TABLE_NAME, INDEX_NAME `
  if (limit || base.sqlInjection.isAcceptableParameter(limit.toString())) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, indexes])
}