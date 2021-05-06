const base = require("../utils/base")

exports.command = 'ports'
exports.describe = base.bundle.getText("ports")
exports.builder = base.getBuilder({})
exports.handler = (argv) => {
  base.promptHandler(argv, getPorts, {})
}
async function getPorts(prompts) {
  try {
    base.setPrompts(prompts)
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const dbStatus = new dbClass(await conn.createConnection(prompts))
    let results = await dbStatus.execSQL(
      `SELECT SERVICE_NAME, 
              PORT, 
              SQL_PORT
              FROM SYS.M_SERVICES`)
    base.outputTable(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}