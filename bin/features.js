const base = require("../utils/base")

exports.command = 'features'
exports.aliases = ['fe', 'Features']
exports.describe = base.bundle.getText("features")

exports.builder = base.getBuilder({})
exports.handler = (argv) => {
  base.promptHandler(argv, dbStatus, {})
}

async function dbStatus(prompts) {
  base.debug('dbStatus')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    let results = await dbStatus.execSQL(
      `SELECT * FROM M_FEATURES`)
    base.outputTable(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}
module.exports.dbStatus = dbStatus