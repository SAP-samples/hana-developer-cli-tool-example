// @ts-check
import * as base from '../utils/base.js'

export const command = 'schemaInstances'
export const aliases = ['schemainstances', 'schemaServices', 'listschemas', 'schemaservices']
export const describe = base.bundle.getText("schemaInstances")

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
        results = await cf.getSchemaInstances()
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
        base.outputTable(output)
        base.end()
        return output
    } catch (error) {
        base.error(error)
    }
}
