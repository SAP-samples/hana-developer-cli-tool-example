// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as tables from './tables.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'

export const command = 'tablesUI [schema] [table]'
export const aliases = ['tui', 'listTablesUI', 'listtablesui', 'tablesui']
export const describe = tables.describe 

export const builder = (yargs) => yargs.options(baseLite.getUIBuilder({
  table: {
    alias: ['t', 'Table'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("table")
  },
  schema: {
    alias: ['s', 'Schema'],
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
})).wrap(160).example('hana-cli tablesUI', baseLite.bundle.getText("tablesExample")).wrap(160).epilog(buildDocEpilogue('tablesUI', 'schema-tools', ['tables', 'inspectTable', 'schemas']))

export const inputPrompts = {
  ...tables.inputPrompts,
  port: {
    description: 'Server port (default: 3010)',
    type: 'number',
    required: false,
    ask: () => { }
  },
  host: {
    description: 'Server host (default: localhost)',
    type: 'string',
    required: false,
    ask: () => { }
  }
}

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getTables, inputPrompts)
}

export async function getTables(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getTablesUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#tables-ui')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    await base.error(error)
  }
}