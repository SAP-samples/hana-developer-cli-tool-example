/* eslint-disable no-undef */
// @ts-nocheck
import * as base from '../utils/base.js'
import cds from '@sap/cds'

export const command = 'tablesPG [table]'
export const aliases = ['tablespg', 'tablespostgres', 'tablesPostgres', 'tables-postgres', 'tables-postgressql', 'tablesPOSTGRES']
export const describe = base.bundle.getText("tablesPG")

export const builder = base.getBuilder({
  table: {
    alias: ['t', 'Table'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("table")
  },
  profile: {
    alias: ['p', 'Profile'],
    type: 'string',
    default: "pg",
    desc: base.bundle.getText("profile")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: base.bundle.getText("limit")
  }
}, false)

export let inputPrompts = {
  table: {
    description: base.bundle.getText("profile"),
    type: 'string',
    required: true
  },
  profile: {
    description: base.bundle.getText("table"),
    type: 'string',
    required: true
  }
}

export function handler(argv) {
  base.promptHandler(argv, getTables, inputPrompts)
}

export async function getTables(prompts) {
  base.debug('getTablesPostgres')
  try {
    base.setPrompts(prompts)
    process.env.CDS_ENV = prompts.profile
    let optionsCDS = cds.env.requires.db
    let schema = ""
    if (optionsCDS.credentials.schema) {
      schema = optionsCDS.credentials.schema
    } else {
      schema = "public"
    }
    optionsCDS.credentials.schema = "information_schema"

    base.debug(optionsCDS)
    const db = await cds.connect.to(optionsCDS)
    if (prompts.table == "*") {
      prompts.table = "%"
    }
    let dbQuery = SELECT
      .columns("table_schema", "table_name")
      .from("tables")
      .where({ table_schema: schema, table_name: { like: prompts.table }, table_type: 'BASE TABLE' })
      .limit(prompts.limit)
    base.debug(dbQuery)
    let results = await db.run(dbQuery)

    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
    return
  }
}
