// @ts-check
// Use lightweight base-lite for command metadata to avoid loading heavy deps during CLI init
import * as baseLite from '../utils/base-lite.js'

export const command = 'tables [schema] [table]'
export const aliases = ['t', 'listTables', 'listtables']
export const describe = baseLite.bundle.getText("tables")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  table: {
    alias: ['t'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("table")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: baseLite.bundle.getText("limit")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})).example(
  'hana-cli tables --table myTable --schema MYSCHEMA',
  baseLite.bundle.getText("tablesExample")
)

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
  limit: {
    description: baseLite.bundle.getText("limit"),
    type: 'number',
    required: true
  },
  profile: {
    description: baseLite.bundle.getText("profile"),
    type: 'string',
    required: false,
    ask: () => { }
  }
}

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  // Lazy-load full base module only when handler executes
  const base = await import('../utils/base.js')
  
  if (argv.profile && argv.profile === 'pg') {  //Redirect to tablesPG / Postgres
    const tablesPG = await import("./tablesPG.js")
    base.promptHandler(argv, getTables, tablesPG.inputPrompts)
  } else if (argv.profile && (argv.profile === 'sqlite')) {  //Redirect to tablesSQLite / SQLite
    const tablesSQLite = await import("./tablesSQLite.js")
    base.promptHandler(argv, getTables, tablesSQLite.inputPrompts)
  }
  else {
    base.promptHandler(argv, getTables, inputPrompts)
  }

}

/**
 * Get list of tables from database
 * @param {object} prompts - Input prompts with schema, table, and limit
 * @returns {Promise<Array>} - Array of table objects
 */
export async function getTables(prompts) {
  // Lazy-load full base and dbClient only when actually executing
  const base = await import('../utils/base.js')
  const dbClientModule = await import("../utils/database/index.js")
  const dbClientClass = dbClientModule.default
  
  try {
    base.debug('getTables')
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()

    let results = await dbClient.listTables()
    base.outputTableFancy(results)
    await dbClient.disconnect()

    return results
  } catch (error) {
    await base.error(error)
  }
}

// Support direct execution (for testing and standalone use)
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('tables.js')) {
  const yargs = (await import('yargs')).default
  const { hideBin } = await import('yargs/helpers')
  
  const argv = await builder(yargs(hideBin(process.argv))
    .usage(baseLite.bundle.getText("cli.usage", [command, describe]))
    .help('help').alias('help', 'h')
    .wrap(null))
    .argv
  
  if (!argv.help && !argv.h) {
    handler(argv)
  }
}
