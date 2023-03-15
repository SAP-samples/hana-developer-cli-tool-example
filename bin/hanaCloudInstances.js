// @ts-check
import * as base from '../utils/base.js'
import * as cf from '../utils/cf.js'
import * as btp from '../utils/btp.js'

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

export function handler(argv) {
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

        //BTP Multi-Environment Instances
        if (base.verboseOutput) {
            console.log(base.bundle.getText("hc.BTPCheck"))
        }
        let results = []
        try {
            if (prompts.name === '**default**') {
                results = await btp.getHANAServiceInstances()
            } else {
                results = await btp.getHANAInstanceByName(prompts.name)
            }
        } catch (error) {
            base.debug(error)
            //console.log(error)
        }

        base.debug(results)
        if (results) {
            // @ts-ignore
            for (let item of results) {
                let outputItem = {}
                outputItem.name = item.name
                let createdAt = new Date(item.created_at)
                outputItem.created_at = createdAt.toString()
                outputItem.status = await btp.getHANAInstanceStatus(item.parameters)
                let updatedAt = new Date(item.last_operation.updated_at)
                outputItem.last_operation = `${item.last_operation.type} ${item.last_operation.state} @ ${updatedAt.toString()}`
                outputItem.hana_cockpit = item.dashboard_url
                outputItem.version = `${item.parameters.currentProductVersion.id}`
                outputItem.enabledServices = `Doc Store: ${item.parameters.data.enabledservices.docstore} DP Server: ${item.parameters.data.enabledservices.dpserver} Script Server:${item.parameters.data.enabledservices.scriptserver}`
                outputItem.resources = `Memory: ${item.parameters.data.memory} Gb, Storage: ${item.parameters.data.storage} Gb, VCPUs: ${item.parameters.data.vcpu}`

                var url = new URL(outputItem.hana_cockpit)
                outputItem.hana_central = `${url.protocol}//${url.host}/hcs/sap/hana/cloud/index.html#/org/${await cf.getCFOrgGUID()}/space/${await cf.getCFSpaceGUID()}/databases`
                outputItem.db_explorer = `${url.protocol}//${url.host}/sap/hana/cst/catalog/index.html`
                console.log(`${base.bundle.getText("hc.name")}: ${colors.green(outputItem.name)}`)
                console.log(`${base.bundle.getText("hc.created")}: ${colors.green(outputItem.created_at)}`)
                console.log(`${base.bundle.getText("hc.status")}: ${colors.green(outputItem.status)}`)
                console.log(`${base.bundle.getText("hc.lastOperation")}: ${colors.green(outputItem.last_operation)}`)
                console.log(`${base.bundle.getText("hc.version")}: ${colors.green(outputItem.version)}`)
                console.log(`${base.bundle.getText("hc.enabledservices")}: ${colors.green(outputItem.enabledServices)}`)
                console.log(`${base.bundle.getText("hc.resources")}: ${colors.green(outputItem.resources)}`)
                console.log(`${base.bundle.getText("hc.cockpit")}: ${colors.blue(outputItem.hana_cockpit)}`)
                console.log(`${base.bundle.getText("hc.central")}: ${colors.blue(outputItem.hana_central)}`)
                console.log(`${base.bundle.getText("hc.dbx")}: ${colors.blue(outputItem.db_explorer)}`)
                console.log(`\r\n`)
            }
        }

        //Cloud Foundry Specific Instances
        results = []
        if (base.verboseOutput) {
            console.log(base.bundle.getText("hc.CFCheck"))
        }
        try {
            if (prompts.name === '**default**') {
                results = await cf.getHANAInstances()
            } else {
                results = await cf.getHANAInstanceByName(prompts.name)
            }
        } catch (error) {
            base.debug(error)
            //console.log(error)
        }
        base.debug(results)
        if (results && results.resources) {
            // @ts-ignore
            for (let item of results.resources) {
                let outputItem = {}
                outputItem.name = item.name
                outputItem.name = item.name
                let createdAt = new Date(item.created_at)
                outputItem.created_at = createdAt.toString()
                outputItem.status = await cf.getHANAInstanceStatus(item.guid)
                let updatedAt = new Date(item.last_operation.updated_at)
                outputItem.last_operation = `${item.last_operation.type} ${item.last_operation.state} @ ${updatedAt.toString()}`
                outputItem.hana_cockpit = item.dashboard_url

                let url = new URL(outputItem.hana_cockpit)
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
        }

        return base.end()
    } catch (error) {
        base.error(error)
    }
}