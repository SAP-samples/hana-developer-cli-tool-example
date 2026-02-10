// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as dataTypes from './dataTypes.js'

export const command = 'dataTypesUI'
export const aliases = ['dtui', 'datatypesUI', 'dataTypeUI', 'datatypeui', 'datatypesui']
export const describe = dataTypes.describe

export const builder = dataTypes.builder

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, dbStatus, {})
}

export async function dbStatus(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getDataTypesUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#dataTypes-ui')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    await base.error(error)
  }
}