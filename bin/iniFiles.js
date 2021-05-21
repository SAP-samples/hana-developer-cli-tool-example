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
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const dbStatus = new dbClass(await conn.createConnection(prompts))

    let results = await dbStatus.execSQL(
      `SELECT * FROM M_INIFILES`)
    base.outputTable(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}