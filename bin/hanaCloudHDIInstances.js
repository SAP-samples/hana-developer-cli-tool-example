const base = require("../utils/base")

exports.command = 'hdi'
exports.aliases = ['hdiInstances', 'hdiinstances', 'hdiServices', 'listhdi', 'hdiservices', 'hdis']
exports.describe = base.bundle.getText("hdiInstances")


exports.builder = base.getBuilder({
    cf: {
        alias: ['c', 'cmd'],
        desc: base.bundle.getText("cfxs"),
        type: 'boolean',
        default: true
    }
}, false)

let inputPrompts = {
    cf: {
        description: base.bundle.getText("cfxs"),
        type: 'boolean',
        default: true,
        required: false
    }
}
exports.inputPrompts = inputPrompts

exports.handler = (argv) => {
    base.promptHandler(argv, listInstances, inputPrompts, false)
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
        results = await cf.getHDIInstances()
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
        base.end()
        return output
    } catch (error) {
        base.error(error)
    }
}
module.exports.listInstances = listInstances