const colors = require("colors/safe")
const bundle = global.__bundle

exports.command = 'hc [name]'
exports.aliases = ['hcInstances', 'instances', 'listHC', 'listhc', 'hcinstances']
exports.describe = bundle.getText("hcInstances")


exports.builder = {
    name: {
        alias: ['n'],
        type: 'string',
        default: `**default**`,
        desc: bundle.getText("hc_instance_name")
    }
}

exports.handler = function (argv) {
    const prompt = require('prompt')
    prompt.override = argv
    prompt.message = colors.green(bundle.getText("input"))
    prompt.start()

    var schema = {
        properties: {
            name: {
                description: bundle.getText("hc_instance_name"),
                type: 'string',
                required: true
            }
        } 
    }

    prompt.get(schema, (err, result) => {
        if (err) {
            return console.log(err.message)
        }
        global.startSpinner()
        listInstances(result)
    })
}

async function listInstances(result) {
    try {
        const cf = require("../utils/cf")
        let results = ''
        if (result.name ===  '**default**') {
            results = await cf.getHANAInstances()
        } else {
            results = await cf.getHANAInstanceByName(result.name)
        }
        //let output = []
        for (let item of results.resources) {
            let outputItem = {}
            outputItem.name = item.name
            outputItem.created_at = item.created_at
            outputItem.last_operation = `${item.last_operation.type} ${item.last_operation.state} @ ${item.last_operation.updated_at}`
            outputItem.hana_cockpit = item.dashboard_url

            var url = new URL(outputItem.hana_cockpit)
            outputItem.hana_central = `${url.protocol}//${url.host}/hcs/sap/hana/cloud/index.html#/org/${await cf.getCFOrgGUID()}/space/${await cf.getCFSpaceGUID()}/databases`
            outputItem.db_explorer = `${url.protocol}//${url.host}/sap/hana/cst/catalog/index.html`
            //output.push(outputItem)
            console.log(`Name: ${outputItem.name}`)
            console.log(`Created At: ${outputItem.created_at}`)
            console.log(`Last Operation: ${outputItem.last_operation}`)
            console.log(`SAP HANA Cockpit: ${outputItem.hana_cockpit}`)
            console.log(`SAP HANA Cloud Central: ${outputItem.hana_central}`)     
            console.log(`Database Explorer: ${outputItem.db_explorer}`)                      
            console.log(`\r\n`)
        }
        //console.table(output)
        global.__spinner.stop()
        return
    } catch (error) {
        global.__spinner.stop()
        return console.log(error.message)
    }
}