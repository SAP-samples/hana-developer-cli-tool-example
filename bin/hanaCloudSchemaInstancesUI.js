// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as schemaInstances from './hanaCloudSchemaInstances.js'

export const command = 'schemaInstancesUI'
export const aliases = ['schemainstancesui', 'schemaServicesUI', 'listschemasui', 'schemaservicesui']
export const describe = schemaInstances.describe
export const builder = schemaInstances.builder

export async function handler (argv) {
  const base = await import('../utils/base.js')
    base.promptHandler(argv, listInstances, schemaInstances.inputPrompts)
  }

export async function listInstances(prompts) {
  const base = await import('../utils/base.js')
    base.debug('getSchemaInstancesUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#schemaInstances-ui')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    await base.error(error)
  }
}
