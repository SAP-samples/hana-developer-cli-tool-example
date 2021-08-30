// @ts-check
import * as base from '../utils/base.js'
import * as cf from '../utils/cf.js'
const colors = base.colors

export const command = 'hc [name]'
export const aliases = ['hcInstances', 'instances', 'listHC', 'listhc', 'hcinstances']
export const describe = base.bundle.getText("hcInstances")

export const builder = base.getBuilder({
    name: {
        alias: ['n'],
        type: 'string',
        default: `**default**`,
        desc: base.bundle.getText("hc_instance_name")
    }
}, false)

export function handler (argv) {
    base.promptHandler(argv, listInstances, {
        name: {
            description: base.bundle.getText("hc_instance_name"),
            type: 'string',
            required: true
        }
    }, false)
}


export async function listInstances(prompts) {
    base.debug(`listInstances`)
    try {
        let results = ''
        if (prompts.name === '**default**') {
            results = await cf.getHANAInstances()
        } else {
            results = await cf.getHANAInstanceByName(prompts.name)
        }
        base.debug(results)
        // @ts-ignore
        for (let item of results.resources) {
            let outputItem = {}
            outputItem.name = item.name
            outputItem.created_at = item.created_at
            outputItem.status = await cf.getHANAInstanceStatus(item.guid)
            outputItem.last_operation = `${item.last_operation.type} ${item.last_operation.state} @ ${item.last_operation.updated_at}`
            outputItem.hana_cockpit = item.dashboard_url

            var url = new URL(outputItem.hana_cockpit)
            outputItem.hana_central = `${url.protocol}//${url.host}/hcs/sap/hana/cloud/index.html#/org/${await cf.getCFOrgGUID()}/space/${await cf.getCFSpaceGUID()}/databases`
            outputItem.db_explorer = `${url.protocol}//${url.host}/sap/hana/cst/catalog/index.html`
            console.log(`${base.bundle.getText("hc.name")}: ${colors.green(outputItem.name)}`)
            console.log(`${base.bundle.getText("hc.created")}: ${colors.green(outputItem.created_at)}`)
            console.log(`${base.bundle.getText("hc.status")}: ${colors.green(outputItem.status)}`)
            console.log(`${base.bundle.getText("hc.lastOperation")}: ${colors.green(outputItem.last_operation)}`)
            console.log(`${base.bundle.getText("hc.cockpit")}: ${colors.blue(outputItem.hana_cockpit)}`)
            console.log(`${base.bundle.getText("hc.central")}: ${colors.blue(outputItem.hana_central)}`)
            console.log(`${base.bundle.getText("hc.dbx")}: ${colors.blue(outputItem.db_explorer)}`)
            console.log(`\r\n`)
        }
        return base.end()
    } catch (error) {
        base.error(error)
    }
}