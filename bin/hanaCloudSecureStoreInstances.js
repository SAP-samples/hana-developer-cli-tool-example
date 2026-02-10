// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'securestore'
export const aliases = ['secureStoreInstances', 'securestoreinstances', 'secureStoreServices', 'listSecureStore', 'securestoreservices', 'securestores']
export const describe = baseLite.bundle.getText("secureStoreInstances")

export const builder = baseLite.getBuilder({
    cf: {
        alias: ['c', 'cmd'],
        desc: baseLite.bundle.getText("cfxs"),
        type: 'boolean',
        default: true
    }
}, false)

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
        results = await cf.getSecureStoreInstances()
        let output = []
        if (prompts.cf) {
            // @ts-ignore
            for (let item of results.resources) {
                let outputItem = {}
                outputItem.name = item.name
                outputItem.created_at = item.created_at
                outputItem.last_operation = `${item.last_operation.type} ${item.last_operation.state} @ ${item.last_operation.updated_at}`
                output.push(outputItem)
            }
        } else {
          for (let item of results){
              let outputItem = {}
              // @ts-ignore
              outputItem.name = item.serviceInstanceEntity.name
              // @ts-ignore
              outputItem.last_operation = `${item.serviceInstanceEntity.last_operation.type} ${item.serviceInstanceEntity.last_operation.state} `
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
