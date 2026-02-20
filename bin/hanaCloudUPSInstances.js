// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'ups'
export const aliases = ['upsInstances', 'upsinstances', 'upServices', 'listups', 'upsservices']
export const describe = baseLite.bundle.getText("upsInstances")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
    cf: {
        alias: ['c', 'cmd'],
        desc: baseLite.bundle.getText("cfxs"),
        type: 'boolean',
        default: true
    }
}, false)).wrap(160).example('hana-cli ups --cf', baseLite.bundle.getText("upsExample")).wrap(160).epilog(buildDocEpilogue('hanaCloudUPSInstances', 'hana-cloud', ['hanaCloudInstances']))

export let inputPrompts = {
    cf: {
        description: baseLite.bundle.getText("cfxs"),
        type: 'boolean',
        default: true,
        required: false
    }
}

export async function handler (argv) {
  const base = await import('../utils/base.js')
    base.promptHandler(argv, listInstances, inputPrompts, false)
}


export async function listInstances(prompts) {
  const base = await import('../utils/base.js')
    base.debug('listInstances')
    try {
        let cf = null
        if (prompts.cf) {
            cf = await import('../utils/cf.js')
        } else {
            cf = await import('../utils/xs.js')
        }
        let results = ''
        results = await cf.getUpsInstances()
        let output = []
        if (prompts.cf) {
            // @ts-ignore
            for (let item of results.resources) {
                let outputItem = {}
                outputItem.name = item.name
                outputItem.created_at = item.created_at
                output.push(outputItem)
            }
        } else {
            for (let item of results){
                let outputItem = {}
                // @ts-ignore
                outputItem.name = item.userProvidedServiceInstanceEntity.name
                // @ts-ignore
                outputItem.credentials = JSON.stringify(item.userProvidedServiceInstanceEntity.credentials)
                output.push(outputItem)
            }
        }
        base.outputTableFancy(output)
        base.end()
        return output
    } catch (error) {
        base.error(error)
    }
}
