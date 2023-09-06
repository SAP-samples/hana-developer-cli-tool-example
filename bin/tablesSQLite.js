/* eslint-disable no-undef */
// @ts-nocheck
import * as base from '../utils/base.js'
import cds from '@sap/cds'

export const command = 'tablesSQLite [table]'
export const aliases = ['tablessqlite', 'tablesqlite', 'tablesSqlite', 'tables-sqlite', 'tables-sql', 'tablesSQL']
export const describe = base.bundle.getText("tablesSQLite")

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
    default: "sqlite",
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
  base.debug('getTablesSQLite')
  try {
    base.setPrompts(prompts)
    process.env.CDS_ENV = prompts.profile
    let optionsCDS = cds.env.requires.db
    base.debug(optionsCDS)
    const db = await cds.connect.to(optionsCDS)
    if(prompts.table == "*"){
      prompts.table = "%"
    }
    let dbQuery = SELECT
      .columns("name")
      .from("sqlite_schema")
      .where({ type: 'table', name:{like:prompts.table}})
      .limit(prompts.limit)
    base.debug(dbQuery)
    let results = await db.run(dbQuery)

    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}
