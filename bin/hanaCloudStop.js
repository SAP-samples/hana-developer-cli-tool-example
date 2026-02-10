// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as cf from '../utils/cf.js'
import * as btp from '../utils/btp.js'

export const command = 'hcStop [name]'
export const aliases = ['hcstop', 'hc_stop', 'stop']
export const describe = baseLite.bundle.getText("hcStop")

export const builder = baseLite.getBuilder({
    name: {
        alias: ['n'],
        type: 'string',
        default: `**default**`,
        desc: baseLite.bundle.getText("hc_instance_name")
    }
}, false)

export async function handler(argv) {
  const base = await import('../utils/base.js')
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
        out[3] = `${baseLite.bundle.getText("hc.updateProgress")}. ${baseLite.bundle.getText("hc.progress", [instanceName])}`
    }
    return out.join("\n")
}

function suggestBTPHanaCli(stdout, instanceName) {
    let out = stdout
    // Replace message 'Update in progress. Use 'cf services' or 'cf service dbhana-hana' to check operation status.'
    if (out) {
        out = `${baseLite.bundle.getText("hc.updateProgress")}. ${baseLite.bundle.getText("hc.progress", [instanceName])}`
    }
    return out
}

export async function hcStop(prompts) {
  const base = await import('../utils/base.js')

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