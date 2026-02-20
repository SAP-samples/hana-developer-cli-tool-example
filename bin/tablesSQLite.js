// @ts-check
import * as baseLite from '../utils/base-lite.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'
const tables = await import("./tables.js")

export const command = 'tablesSQLite [table]'
export const aliases = ['tablessqlite', 'tablesqlite', 'tablesSqlite', 'tables-sqlite', 'tables-sql', 'tablesSQL']
export const describe = baseLite.bundle.getText("tablesSQLite")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  table: {
    alias: ['t', 'Table'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("table")
  },
  profile: {
    alias: ['p', 'Profile'],
    type: 'string',
    default: "sqlite",
    desc: baseLite.bundle.getText("profile")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: baseLite.bundle.getText("limit")
  }
}, false)).wrap(160).example(
  'hana-cli tablesSQLite --table * --schema main',
  baseLite.bundle.getText("tablesSQLiteExample")
).epilog(buildDocEpilogue('tablesSQLite', 'schema-tools', ['tables', 'tablesPG']))

export let inputPrompts = {
  table: {
    description: baseLite.bundle.getText("table"),
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
