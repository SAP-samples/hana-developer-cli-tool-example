// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as securestore from './hanaCloudSecureStoreInstances.js'

export const command = 'securestoreUI'
export const aliases = ['secureStoreInstancesUI', 'secureStoreUI', 'securestoreinstancesui', 'secureStoreServicesUI', 'listSecureStoreUI', 'securestoreservicesui', 'securestoresui']
export const describe = securestore.describe
export const builder = securestore.builder 

export async function handler (argv) {
  const base = await import('../utils/base.js')
    base.promptHandler(argv, listInstances, securestore.inputPrompts)
  }

export async function listInstances(prompts) {
  const base = await import('../utils/base.js')
    base.debug('getSecureStoreUI')
    try {
      base.setPrompts(prompts)
      await base.webServerSetup('/ui/#securestore-ui')
      // Don't call base.end() - let the web server keep running
    } catch (error) {
      base.error(error)
    }
}
