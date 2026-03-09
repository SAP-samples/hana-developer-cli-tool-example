// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as functions from './functions.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'

export const command = 'functionsUI [schema] [function]'
export const aliases = ['fui', 'listFuncsUI', 'ListFuncUI', 'listfuncsui', 'Listfuncui', "listFunctionsUI", "listfunctionsui"]
export const describe = functions.describe

export const builder = (yargs) => yargs.options(baseLite.getUIBuilder({
  functionName: {
    alias: ['f', 'function'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("function")
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
})).wrap(160).example('hana-cli functionsUI', baseLite.bundle.getText("functionsExample")).wrap(160).epilog(buildDocEpilogue('functionsUI', 'schema-tools', ['functions', 'inspectFunction', 'procedures']))

export const inputPrompts = {
  ...functions.inputPrompts,
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
  base.promptHandler(argv, getFunctions, inputPrompts)
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