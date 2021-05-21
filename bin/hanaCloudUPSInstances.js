const base = require("../utils/base")

exports.command = 'ups'
exports.aliases = ['upsInstances', 'upsinstances', 'upServices', 'listups', 'upsservices']
exports.describe = base.bundle.getText("upsInstances")

exports.builder = base.getBuilder({
    cf: {
        alias: ['c', 'cmd'],
        desc: base.bundle.getText("cfxs"),
        type: 'boolean',
        default: true
    }
}, false)

exports.handler = (argv) => {
    base.promptHandler(argv, listInstances, {
        cf: {
            description: base.bundle.getText("cfxs"),
            type: 'boolean',
            default: true,
            required: false
        }
    }, false)
}


async function listInstances(prompts) {
    base.debug('listInstances')
    try {
        let cf = null
        if (prompts.cf) {
            cf = require("../utils/cf")
        } else {
            cf = require("../utils/xs")
        }
        let results = ''
        results = await cf.getUpsInstances()
        let output = []
        if (prompts.cf) {
            for (let item of results.resources) {
                let outputItem = {}
                outputItem.name = item.name
                outputItem.created_at = item.created_at
                output.push(outputItem)
            }
        } else {
            for (let item of results){
                let outputItem = {}
                outputItem.name = item.userProvidedServiceInstanceEntity.name
                outputItem.credentials = JSON.stringify(item.userProvidedServiceInstanceEntity.credentials)
                output.push(outputItem)
            }
        }
        base.outputTable(output)
        return base.end()
    } catch (error) {
        base.error(error)
    }
}