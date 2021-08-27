// @ts-check
import * as base from '../utils/base.js'
import * as cf from '../utils/cf.js'

export const command = 'hcStop [name]'
export const aliases = ['hcstop', 'hc_stop', 'stop']
export const describe = base.bundle.getText("hcStop")

export const builder = base.getBuilder({
    name: {
        alias: ['n'],
        type: 'string',
        default: `**default**`,
        desc: base.bundle.getText("hc_instance_name")
    }
}, false)

export function handler (argv) {
    base.promptHandler(argv, hcStop, {
        name: {
            description: base.bundle.getText("hc_instance_name"),
            type: 'string',
            required: true
        }
    }, false)
}


export async function hcStop(prompts) {
    base.debug(`hcStop`)
    try {

        let results = ''
        if (prompts.name === '**default**') {
            results = await cf.getHANAInstances()
        } else {
            results = await cf.getHANAInstanceByName(prompts.name)
        }
        // @ts-ignore
        for (let item of results.resources) {
            console.log(await cf.stopHana(item.name))
        }
        return base.end()
    } catch (error) {
        base.error(error)
    }
}