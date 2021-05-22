const base = require("../utils/base")

exports.command = 'hostInformation'
exports.aliases = ['hi', 'HostInformation', 'hostInfo', 'hostinfo']
exports.describe = base.bundle.getText("hostInformation")
exports.builder = base.getBuilder({})
exports.handler = (argv) => {
  base.promptHandler(argv, hostInfo, {})
}

async function hostInfo(prompts) {
  base.debug('hostInfo')
  try {
    base.setPrompts(prompts)
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const clientConnection = await conn.createConnection(prompts)
    const dbStatus = new dbClass(clientConnection)

    let results = await dbStatus.execSQL(
      `SELECT * FROM M_HOST_INFORMATION
      ORDER BY HOST, KEY`)
    base.outputTable(results)

    results = await dbStatus.execSQL(
      `SELECT * FROM M_HOST_RESOURCE_UTILIZATION
      ORDER BY HOST`)
    base.outputTable(results)
    clientConnection.disconnect()
    return base.end()
  } catch (error) {
    base.error(error)
  }
}