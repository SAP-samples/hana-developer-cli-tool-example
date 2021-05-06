const base = require("../utils/base")

exports.command = 'hdi'
exports.aliases = ['hdiInstances', 'hdiinstances', 'hdiServices', 'listhdi', 'hdiservices', 'hdis']
exports.describe = base.bundle.getText("hdiInstances")
exports.builder = base.getBuilder({}, false)
exports.handler = (argv) => {
    base.setPrompts(argv)
    base.promptHandler(argv, listInstances, {}, false)
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
        base.outputTable(output)
        return base.end()
    } catch (error) {
        base.error(error)
    }
}