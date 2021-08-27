// @ts-check
import * as base from '../utils/base.js'
import * as hanaCloudHDIInstances from './hanaCloudHDIInstances.js'

export const command = 'hdiUI'
export const aliases = ['hdiInstancesUI', 'hdiinstancesui', 'hdiServicesUI', 'listhdiui', 'hdiservicesui', 'hdisui']
export const describe = hanaCloudHDIInstances.describe
export const builder = hanaCloudHDIInstances.builder

export function handler (argv) {
    base.promptHandler(argv, listInstances, hanaCloudHDIInstances.inputPrompts)
}


export async function listInstances(prompts) {
    base.debug('listInstancesUI')
    try {
        base.setPrompts(prompts)
        await base.webServerSetup('/ui/#hdi-ui')
        return base.end()
    } catch (error) {
        base.error(error)
    }
}
