const base = require("../utils/base")
const inspectTable = require("./inspectTable")

exports.command = 'inspectTableUI [schema] [table]'
exports.aliases = ['itui', 'tableUI', 'tableui', 'insTblUI', 'inspecttableui', 'inspectableui']
exports.describe = inspectTable.describe
exports.builder = inspectTable.builder
exports.handler = (argv) => {
  base.promptHandler(argv, tableInspect, inspectTable.inputPrompts)
}

async function tableInspect(prompts) {
  base.debug('inspectTableUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#inspectTable-ui')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}
