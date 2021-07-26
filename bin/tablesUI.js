const base = require("../utils/base")
const tables = require("./tables")

exports.command = 'tablesUI [schema] [table]'
exports.aliases = ['tui', 'listTablesUI', 'listtablesui', 'tablesui']
exports.describe = tables.describe 

exports.builder = tables.builder

exports.handler = (argv) => {
  base.promptHandler(argv, getTables, tables.inputPrompts)
}

async function getTables(prompts) {
  base.debug('getTablesUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#tables-ui')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}