const base = require("../utils/base")
const schemaInstances = require("./hanaCloudSchemaInstances")

exports.command = 'schemaInstancesUI'
exports.aliases = ['schemainstancesui', 'schemaServicesUI', 'listschemasui', 'schemaservicesui']
exports.describe = schemaInstances.describe
exports.builder = schemaInstances.builder

exports.handler = (argv) => {
    base.promptHandler(argv, listInstances, schemaInstances.inputPrompts)
  }

async function listInstances(prompts) {
    base.debug('getSchemaInstancesUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#schemaInstances-ui')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}
