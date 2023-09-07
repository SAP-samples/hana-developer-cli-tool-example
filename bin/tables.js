// @ts-check
// @ts-nocheck
import * as base from '../utils/base.js'
import DBClientClass from "../utils/database/index.js"

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
  },
  profile: {
    alias: ['p', 'Profile'],
    type: 'string',
    desc: base.bundle.getText("profile")
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
  },
  profile: {
    description: base.bundle.getText("profile"),
    type: 'string',
    required: false,
    ask: () => {}
  }
}

export async function handler(argv) {
  if (argv.profile && argv.profile === 'pg') {  //Redirect to tablesPG / Postgres
    const tablesPG = await import("./tablesPG.js")
    base.promptHandler(argv, tablesPG.getTables, tablesPG.inputPrompts)
  } else if (argv.profile && (argv.profile === 'sqlite')) {  //Redirect to tablesSQLite / SQLite
    const tablesSQLite = await import("./tablesSQLite.js")
    base.promptHandler(argv, tablesSQLite.getTables, tablesSQLite.inputPrompts)
  }
  else {
    base.promptHandler(argv, getTables, inputPrompts)
  }

}

export async function getTables(prompts) {
  try {
    base.debug('getTables')
    const dbClient = await DBClientClass.getNewClient(prompts)
    await dbClient.connect()
    let results = await dbClient.listTables()

    base.outputTableFancy(results)
    dbClient.disconnect()

    return results
  } catch (error) {
    base.error(error)
  }
}
