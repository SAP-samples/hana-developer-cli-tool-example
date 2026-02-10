// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as tables from './tables.js'

export const command = 'tablesUI [schema] [table]'
export const aliases = ['tui', 'listTablesUI', 'listtablesui', 'tablesui']
export const describe = tables.describe 

export const builder = tables.builder

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getTables, tables.inputPrompts)
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