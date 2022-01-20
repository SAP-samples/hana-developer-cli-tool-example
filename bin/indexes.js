// @ts-check
import * as base from '../utils/base.js'

export const command = 'indexes [schema] [indexes]'
export const aliases = ['ind', 'listIndexes', 'ListInd', 'listind', 'Listind', "listfindexes"]
export const describe = base.bundle.getText("indexes")

export const builder = base.getBuilder({
  indexes: {
    alias: ['i', 'Indexes'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("function")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: base.bundle.getText("schema")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: base.bundle.getText("limit")
  }
})

export let inputPrompts = {
  indexes: {
    description: base.bundle.getText("indexes"),
    type: 'string',
    required: true
  },
  schema: {
    description: base.bundle.getText("schema"),
    type: 'string',
    required: true
  },
  limit: {
    description: base.bundle.getText("limit"),
    type: 'number',
    required: true
  }
}

export function handler (argv) {
  base.promptHandler(argv, getIndexes, inputPrompts)
}

export async function getIndexes(prompts) {
  base.debug('getIndexes')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.output(`Schema: ${schema}, Index: ${prompts.indexes}`)

    let results = await getIndexesInt(schema, prompts.indexes, db, prompts.limit)
    base.outputTable(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}


async function getIndexesInt(schema, indexes, client, limit) {
  base.debug(`getIndexesInt ${schema} ${indexes} ${limit}`)
  indexes = base.dbClass.objectName(indexes)

  let query =
    `SELECT SCHEMA_NAME, TABLE_NAME, INDEX_NAME, INDEX_TYPE, CONSTRAINT, CREATE_TIME from INDEXES 
  WHERE SCHEMA_NAME LIKE ? 
    AND INDEX_NAME LIKE ? 
  ORDER BY SCHEMA_NAME, TABLE_NAME, INDEX_NAME `
  if (limit | base.sqlInjection.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, indexes])
}