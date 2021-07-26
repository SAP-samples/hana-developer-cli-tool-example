const base = require("../utils/base")

exports.command = 'ports'
exports.describe = base.bundle.getText("ports")
exports.builder = base.getBuilder({})
exports.handler = (argv) => {
  base.promptHandler(argv, getPorts, {})
}
async function getPorts(prompts) {
  base.debug('getPorts')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()
    let results = await dbStatus.execSQL(
      `SELECT SERVICE_NAME, 
              PORT, 
              SQL_PORT
              FROM SYS.M_SERVICES`)
    base.outputTable(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}
module.exports.getPorts = getPorts