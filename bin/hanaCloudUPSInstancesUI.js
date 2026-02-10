// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as ups from './hanaCloudUPSInstances.js'

export const command = 'upsUI'
export const aliases = ['upsInstancesUI', 'upsinstancesui', 'upServicesUI', 'listupsui', 'upsservicesui']
export const describe = ups.describe

export const builder = ups.builder
export async function handler (argv) {
  const base = await import('../utils/base.js')
    base.promptHandler(argv, listInstances, ups.inputPrompts)
  }



export async function listInstances(prompts) {
  const base = await import('../utils/base.js')
    base.debug('getUpsUI')
    try {
      base.setPrompts(prompts)
      await base.webServerSetup('/ui/#ups-ui')
      // Don't call base.end() - let the web server keep running
    } catch (error) {
      base.error(error)
    }
}
