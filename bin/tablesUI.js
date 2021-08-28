// @ts-check
import * as base from '../utils/base.js'
import * as tables from './tables.js'

export const command = 'tablesUI [schema] [table]'
export const aliases = ['tui', 'listTablesUI', 'listtablesui', 'tablesui']
export const describe = tables.describe 

export const builder = tables.builder

export function handler (argv) {
  base.promptHandler(argv, getTables, tables.inputPrompts)
}

export async function getTables(prompts) {
  base.debug('getTablesUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#tables-ui')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}