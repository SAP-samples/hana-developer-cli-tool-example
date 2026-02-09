// @ts-check
import * as base from '../utils/base.js'
import * as querySimple from './querySimple.js'

export const command = 'querySimpleUI'
export const aliases = ['qsui', "querysimpleui", 'queryUI', 'sqlUI']
export const describe = querySimple.describe

export const builder = querySimple.builder

let tempInput = querySimple.inputPrompts
tempInput.query.required = false
tempInput.query.ask =  () => {
  return false
}
export function handler (argv) {
  base.promptHandler(argv, dbQuery, tempInput)
}

export async function dbQuery(prompts) {
  base.debug('dbQueryUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#querySimple-ui')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    base.error(error)
  }
}
