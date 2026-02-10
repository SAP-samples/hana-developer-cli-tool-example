// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as functions from './functions.js'

export const command = 'functionsUI [schema] [function]'
export const aliases = ['fui', 'listFuncsUI', 'ListFuncUI', 'listfuncsui', 'Listfuncui', "listFunctionsUI", "listfunctionsui"]
export const describe = functions.describe

export const builder = functions.builder
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getFunctions, functions.inputPrompts)
}

export async function getFunctions(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getFunctionsUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#functions-ui')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    await base.error(error)
  }
}