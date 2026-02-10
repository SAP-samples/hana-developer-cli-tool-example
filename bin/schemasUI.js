// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as schemas from './schemas.js'

export const command = 'schemasUI [schema]'
export const aliases = ['schui', 'getSchemasUI', 'listSchemasUI', 'schemasui', 'getschemasui', 'listschemasui']
export const describe = schemas.describe 

export const builder = schemas.builder

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getSchemas, schemas.inputPrompts)
}

export async function getSchemas(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getSchemasUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#schemas-ui')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    await base.error(error)
  }
}
