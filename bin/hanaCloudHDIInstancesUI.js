// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as hanaCloudHDIInstances from './hanaCloudHDIInstances.js'

export const command = 'hdiUI'
export const aliases = ['hdiInstancesUI', 'hdiinstancesui', 'hdiServicesUI', 'listhdiui', 'hdiservicesui', 'hdisui']
export const describe = hanaCloudHDIInstances.describe
export const builder = hanaCloudHDIInstances.builder

export async function handler (argv) {
  const base = await import('../utils/base.js')
    base.promptHandler(argv, listInstances, hanaCloudHDIInstances.inputPrompts)
}


export async function listInstances(prompts) {
  const base = await import('../utils/base.js')
    base.debug('listInstancesUI')
    try {
        base.setPrompts(prompts)
        await base.webServerSetup('/ui/#hdi-ui')
        // Don't call base.end() - let the web server keep running
    } catch (error) {
        base.error(error)
    }
}
