// @ts-check
import * as base from '../utils/base.js'

export const command = 'ups'
export const aliases = ['upsInstances', 'upsinstances', 'upServices', 'listups', 'upsservices']
export const describe = base.bundle.getText("upsInstances")

export const builder = base.getBuilder({
    cf: {
        alias: ['c', 'cmd'],
        desc: base.bundle.getText("cfxs"),
        type: 'boolean',
        default: true
    }
}, false)

export let inputPrompts = {
    cf: {
        description: base.bundle.getText("cfxs"),
        type: 'boolean',
        default: true,
        required: false
    }
}

export function handler (argv) {
    base.promptHandler(argv, listInstances, inputPrompts, false)
}


export async function listInstances(prompts) {
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
        base.outputTable(output)
        base.end()
        return output
    } catch (error) {
        base.error(error)
    }
}
