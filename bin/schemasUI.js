const base = require("../utils/base")
const schemas = require("./schemas")

exports.command = 'schemasUI [schema]'
exports.aliases = ['schui', 'getSchemasUI', 'listSchemasUI', 'schemasui', 'getschemasui', 'listschemasui']
exports.describe = schemas.describe 

exports.builder = schemas.builder

exports.handler = (argv) => {
  base.promptHandler(argv, getSchemas, schemas.inputPrompts)
}

async function getSchemas(prompts) {
  base.debug('getSchemasUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#schemas-ui')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}
