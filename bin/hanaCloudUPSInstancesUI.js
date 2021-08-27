// @ts-check
import * as base from '../utils/base.js'
import * as ups from './hanaCloudUPSInstances.js'

export const command = 'upsUI'
export const aliases = ['upsInstancesUI', 'upsinstancesui', 'upServicesUI', 'listupsui', 'upsservicesui']
export const describe = ups.describe

export const builder = ups.builder
export function handler (argv) {
    base.promptHandler(argv, listInstances, ups.inputPrompts)
  }



export async function listInstances(prompts) {
    base.debug('getUpsUI')
    try {
      base.setPrompts(prompts)
      await base.webServerSetup('/ui/#ups-ui')
      return base.end()
    } catch (error) {
      base.error(error)
    }
}
