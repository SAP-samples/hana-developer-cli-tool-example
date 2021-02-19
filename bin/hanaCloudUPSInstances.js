const colors = require("colors/safe")
const bundle = global.__bundle

exports.command = 'ups'
exports.aliases = ['upsInstances', 'upsinstances', 'upServices', 'listups', 'upsservices']
exports.describe = bundle.getText("upsInstances")


exports.builder = {
}

exports.handler = function (argv) {
    const prompt = require('prompt')
    prompt.override = argv
    prompt.message = colors.green(bundle.getText("input"))
    prompt.start()

    var schema = {
        properties: {
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

async function listInstances() {
    try {
        const cf = require("../utils/cf")
        let results = ''
        results = await cf.getUpsInstances()
        let output = []
        for (let item of results.resources) {
            let outputItem = {}
            outputItem.name = item.name
            outputItem.created_at = item.created_at
            output.push(outputItem)
        } 
        console.table(output)
        global.__spinner.stop()
        return
    } catch (error) {
        global.__spinner.stop()
        return console.log(error.message)
    }
}