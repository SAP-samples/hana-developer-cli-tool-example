// @ts-check
import * as baseLite from '../utils/base-lite.js'
const tables = await import("./tables.js")

export const command = 'tablesPG [schema] [table]'
export const aliases = ['tablespg', 'tablespostgres', 'tablesPostgres', 'tables-postgres', 'tables-postgressql', 'tablesPOSTGRES']
export const describe = baseLite.bundle.getText("tablesPG")

export const builder = baseLite.getBuilder({
  table: {
    alias: ['t', 'Table'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("table")
  }, schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  profile: {
    alias: ['p', 'Profile'],
    type: 'string',
    default: "pg",
    desc: baseLite.bundle.getText("profile")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: baseLite.bundle.getText("limit")
  }
}, false)

export let inputPrompts = {
  table: {
    description: baseLite.bundle.getText("table"),
    type: 'string',
    required: true
  },
  schema: {
    description: baseLite.bundle.getText("schema"),
    type: 'string',
    required: true
  },
  profile: {
    description: baseLite.bundle.getText("profile"),
    type: 'string',
    required: true
  }
}

export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, tables.getTables, inputPrompts, false)
}

