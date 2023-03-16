// @ts-check
import * as base from '../utils/base.js'
import * as cf from '../utils/cf.js'
import * as btp from '../utils/btp.js'

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

export function handler(argv) {
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
    if (out[3]) {
        out[3] = `${base.bundle.getText("hc.updateProgress")}. ${base.bundle.getText("hc.progress", [instanceName])}`
    }
    return out.join("\n")
}

function suggestBTPHanaCli(stdout, instanceName) {
    let out = stdout
    // Replace message 'Update in progress. Use 'cf services' or 'cf service dbhana-hana' to check operation status.'
    if (out) {
        out = `${base.bundle.getText("hc.updateProgress")}. ${base.bundle.getText("hc.progress", [instanceName])}`
    }
    return out
}

export async function hcStop(prompts) {

    base.debug(`hcStop`)
    try {


        //BTP Multi-Environment Instances
        let results = []
        try {
            if (prompts.name === '**default**') {
                results = await btp.getHANAServiceInstances()
            } else {
                results = await btp.getHANAInstanceByName(prompts.name)
            }
        } catch (error) {
            base.debug(error)
        }

        base.debug(results)
        if (results && results.length > 0) {
            // @ts-ignore
            for (let item of results) {
                const stdout = await btp.stopHana(item.name)
                console.log(suggestBTPHanaCli(stdout, item.name))
            }
        }
        else {
            try {
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
            } catch (error) {
                base.debug(error)
            }
        }
        return base.end()
    } catch (error) {
        base.error(error)
    }
}