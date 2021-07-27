const base = require("../utils/base")
const functions = require("./functions")

exports.command = 'functionsUI [schema] [function]'
exports.aliases = ['fui', 'listFuncsUI', 'ListFuncUI', 'listfuncsui', 'Listfuncui', "listFunctionsUI", "listfunctionsui"]
exports.describe = functions.describe

exports.builder = functions.builder
exports.handler = (argv) => {
  base.promptHandler(argv, getFunctions, functions.inputPrompts)
}

async function getFunctions(prompts) {
  base.debug('getFunctionsUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#functions-ui')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}