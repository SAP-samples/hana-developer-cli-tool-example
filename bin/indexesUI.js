const base = require("../utils/base")
const indexes = require("./indexes")

exports.command = 'indexesUI [schema] [indexes]'
exports.aliases = ['indUI', 'listIndexesUI', 'ListIndUI', 'listindui', 'Listindui', "listfindexesui", "indexesui"]
exports.describe = indexes.describe

exports.builder = indexes.builder

exports.handler = (argv) => {
  base.promptHandler(argv, getIndexes, indexes.inputPrompts)
}


async function getIndexes(prompts) {
  base.debug('getIndexesUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#indexes-ui')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}

