const base = require("../utils/base")

exports.command = 'schemaInstances'
exports.aliases = ['schemainstances', 'schemaServices', 'listschemas', 'schemaservices']
exports.describe = base.bundle.getText("schemaInstances")

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
        results = await cf.getSchemaInstances()
        let output = []
        if (prompts.cf) {
            for (let item of results.resources) {
                let outputItem = {}
                outputItem.name = item.name
                outputItem.created_at = item.created_at
                outputItem.last_operation = `${item.last_operation.type} ${item.last_operation.state} @ ${item.last_operation.updated_at}`
                output.push(outputItem)
            }
        } else {
          for (let item of results){
              let outputItem = {}
              outputItem.name = item.serviceInstanceEntity.name
              outputItem.last_operation = `${item.serviceInstanceEntity.last_operation.type} ${item.serviceInstanceEntity.last_operation.state} `
              output.push(outputItem)
          }
        }
        base.outputTable(output)
        return base.end()
    } catch (error) {
        base.error(error)
    }
}