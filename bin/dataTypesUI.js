// @ts-check
import * as base from '../utils/base.js'
import * as dataTypes from './dataTypes.js'

export const command = 'dataTypesUI'
export const aliases = ['dtui', 'datatypesUI', 'dataTypeUI', 'datatypeui', 'datatypesui']
export const describe = dataTypes.describe

export const builder = dataTypes.builder

export function handler (argv) {
  base.promptHandler(argv, dbStatus, {})
}

export async function dbStatus(prompts) {
  base.debug('getDataTypesUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#dataTypes-ui')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    base.error(error)
  }
}