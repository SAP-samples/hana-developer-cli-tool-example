// @ts-check
import * as base from '../utils/base.js'
import * as schemaInstances from './hanaCloudSchemaInstances.js'

export const command = 'schemaInstancesUI'
export const aliases = ['schemainstancesui', 'schemaServicesUI', 'listschemasui', 'schemaservicesui']
export const describe = schemaInstances.describe
export const builder = schemaInstances.builder

export function handler (argv) {
    base.promptHandler(argv, listInstances, schemaInstances.inputPrompts)
  }

export async function listInstances(prompts) {
    base.debug('getSchemaInstancesUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#schemaInstances-ui')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}
