// @ts-check
import * as base from '../utils/base.js'
import * as sbss from './hanaCloudSBSSInstances.js'

export const command = 'sbssUI'
export const aliases = ['sbssInstancesUI', 'sbssinstancesui', 'sbssServicesUI', 'listsbssui', 'sbssservicesui', 'sbsssui']
export const describe = sbss.describe
export const builder = sbss.builder

export function handler (argv) {
    base.promptHandler(argv, listInstances, sbss.inputPrompts)
}

export async function listInstances(prompts) {
    base.debug('getSbssUI')
    try {
        base.setPrompts(prompts)
        await base.webServerSetup('/ui/#sbss-ui')
        // Don't call base.end() - let the web server keep running
    } catch (error) {
        base.error(error)
    }
}
