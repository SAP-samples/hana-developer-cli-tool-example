const colors = require("colors/safe")
const bundle = global.__bundle

exports.command = 'hdi'
exports.aliases = ['hdiInstances', 'hdiinstances', 'hdiServices', 'listhdi', 'hdiservices', 'hdis']
exports.describe = bundle.getText("hdiInstances")


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
        results = await cf.getHDIInstances()

        let output = []
        for (let item of results.resources) {
            let outputItem = {}
            outputItem.name = item.name
            outputItem.created_at = item.created_at
            outputItem.last_operation = `${item.last_operation.type} ${item.last_operation.state} @ ${item.last_operation.updated_at}`
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