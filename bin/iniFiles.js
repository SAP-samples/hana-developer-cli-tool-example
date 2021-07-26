const base = require("../utils/base")

exports.command = 'iniFiles'
exports.aliases = ['if', 'inifiles', 'ini']
exports.describe = base.bundle.getText("iniFiles")
exports.builder = base.getBuilder({})
exports.handler = (argv) => {
  base.promptHandler(argv, iniFiles, {})
}
async function iniFiles(prompts) {
  base.debug('iniFiles')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    let results = await dbStatus.execSQL(
      `SELECT * FROM M_INIFILES`)
    base.outputTable(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}
module.exports.iniFiles = iniFiles