/* eslint-disable no-undef */
// @ts-nocheck
import * as base from '../utils/base.js'
import DBClientClass from "../utils/database/index.js"

export const command = 'tablesPG [schema] [table]'
export const aliases = ['tablespg', 'tablespostgres', 'tablesPostgres', 'tables-postgres', 'tables-postgressql', 'tablesPOSTGRES']
export const describe = base.bundle.getText("tablesPG")

export const builder = base.getBuilder({
  table: {
    alias: ['t', 'Table'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("table")
  }, schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: base.bundle.getText("schema")
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
    description: base.bundle.getText("table"),
    type: 'string',
    required: true
  },
  schema: {
    description: base.bundle.getText("schema"),
    type: 'string',
    required: true
  },
  profile: {
    description: base.bundle.getText("profile"),
    type: 'string',
    required: true
  }
}

export function handler(argv) {
  base.promptHandler(argv, getTables, inputPrompts, false)
}

export async function getTables(prompts) {
  try {
    base.debug('getTablesPostgres')
    const dbClient = await DBClientClass.getNewClient(prompts)
    await dbClient.connectTargetSchema("information_schema")
    let results = await dbClient.listTables()
    
    base.outputTableFancy(results)
    dbClient.disconnect()

    return results
  } catch (error) {
    base.error(error)
    return
  }
}
