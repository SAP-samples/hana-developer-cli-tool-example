const base = require("../utils/base")

exports.command = 'ups'
exports.aliases = ['upsInstances', 'upsinstances', 'upServices', 'listups', 'upsservices']
exports.describe = base.bundle.getText("upsInstances")
exports.builder = base.getBuilder({}, false)
exports.handler = (argv) => {
    base.setPrompts(argv)
    base.promptHandler(argv, listInstances, {}, false)
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
        base.outputTable(output)
        return base.end()
    } catch (error) {
        base.error(error)
    }
}