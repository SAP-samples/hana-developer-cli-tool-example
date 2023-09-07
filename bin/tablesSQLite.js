/* eslint-disable no-undef */
// @ts-nocheck
import * as base from '../utils/base.js'
import DBClientClass from "../utils/database/index.js"

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
  base.promptHandler(argv, getTables, inputPrompts, false)
}

export async function getTables(prompts) {
  try {
    base.debug('getTablesSQLite')
    const dbClient = await DBClientClass.getNewClient(prompts)
    await dbClient.connect()
    let results = await dbClient.listTables()
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}
