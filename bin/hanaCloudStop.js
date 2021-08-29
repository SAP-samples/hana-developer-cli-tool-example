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

function suggestHanaCli(stdout, instanceName) {
    let out = stdout.split("\n")

    // Replace message 'Update in progress. Use 'cf services' or 'cf service dbhana-hana' to check operation status.'
    out[3] = `Update in progress. Use 'hana-cli hc ${instanceName}' to check operation status.`

    return out.join("\n")
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
            const stdout = await cf.stopHana(item.name)

            console.log(suggestHanaCli(stdout, item.name));
        }
        return base.end()
    } catch (error) {
        base.error(error)
    }
}