const colors = require("colors/safe")
const bundle = global.__bundle

exports.command = 'hcStart [name]'
exports.aliases = ['hcstart', 'hc_start', 'start']
exports.describe = bundle.getText("hcStart")


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
        for (let item of results.resources) {
            console.log(await cf.startHana(item.name))
        }
        global.__spinner.stop()
        return
    } catch (error) {
        global.__spinner.stop()
        return console.log(error.message)
    }
}