// @ts-check
import * as base from '../utils/base.js'
import * as securestore from './hanaCloudSecureStoreInstances.js'

export const command = 'securestoreUI'
export const aliases = ['secureStoreInstancesUI', 'secureStoreUI', 'securestoreinstancesui', 'secureStoreServicesUI', 'listSecureStoreUI', 'securestoreservicesui', 'securestoresui']
export const describe = securestore.describe
export const builder = securestore.builder 

export function handler (argv) {
    base.promptHandler(argv, listInstances, securestore.inputPrompts)
  }

export async function listInstances(prompts) {
    base.debug('getSecureStoreUI')
    try {
      base.setPrompts(prompts)
      await base.webServerSetup('/ui/#securestore-ui')
      return base.end()
    } catch (error) {
      base.error(error)
    }
}
