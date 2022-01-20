// @ts-check
import * as base from '../utils/base.js'

export const command = 'tables [schema] [table]'
export const aliases = ['t', 'listTables', 'listtables']
export const describe = base.bundle.getText("tables")

export const builder = base.getBuilder({
  table: {
    alias: ['t', 'Table'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("table")
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
  table: {
    description: base.bundle.getText("table"),
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
  base.promptHandler(argv, getTables, inputPrompts)
}

export async function getTables(prompts) {
  base.debug('getTables')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    console.table(prompts)
    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("table")}: ${prompts.table}`)

    let results = await getTablesInt(schema, prompts.table, db, prompts.limit)
    base.outputTable(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}

async function getTablesInt(schema, table, client, limit) {
  base.debug(`getTablesInt ${schema} ${table} ${limit}`)
  table = base.dbClass.objectName(table)

  let query =
    `SELECT SCHEMA_NAME, TABLE_NAME, TO_NVARCHAR(TABLE_OID) AS TABLE_OID, COMMENTS  from TABLES 
  WHERE SCHEMA_NAME LIKE ? 
    AND TABLE_NAME LIKE ? 
  ORDER BY SCHEMA_NAME, TABLE_NAME `
  if (limit | base.sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, table])
}