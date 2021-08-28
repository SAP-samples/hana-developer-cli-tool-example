// @ts-check
import * as base from '../utils/base.js'
import * as cf from '../utils/cf.js'

export const command = 'hcStart [name]'
export const aliases = ['hcstart', 'hc_start', 'start']
export const describe = base.bundle.getText("hcStart")

export const builder = base.getBuilder({
    name: {
        alias: ['n'],
        type: 'string',
        default: `**default**`,
        desc: base.bundle.getText("hc_instance_name")
    }
}, false)

export function handler (argv) {
    base.promptHandler(argv, hcStart, {
        name: {
            description: base.bundle.getText("hc_instance_name"),
            type: 'string',
            required: true
        }
    }, false)
}

export async function hcStart(prompts) {
    base.debug(`hcStart`)
    try {

        let results = ''
        if (prompts.name === '**default**') {
            results = await cf.getHANAInstances()
        } else {
            results = await cf.getHANAInstanceByName(prompts.name)
        }
        // @ts-ignore
        for (let item of results.resources) {
            console.log(await cf.startHana(item.name))
        }
        return base.end()
    } catch (error) {
        base.error(error)
    }
}