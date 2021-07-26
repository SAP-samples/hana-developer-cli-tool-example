const base = require("../utils/base")
const dataTypes = require("./dataTypes")

exports.command = 'dataTypesUI'
exports.aliases = ['dtui', 'datatypesUI', 'dataTypeUI', 'datatypeui', 'datatypesui']
exports.describe = dataTypes.describe

exports.builder = dataTypes.builder

exports.handler = (argv) => {
  base.promptHandler(argv, dbStatus, {})
}

async function dbStatus(prompts) {
  base.debug('getDataTypesUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#dataTypes-ui')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}