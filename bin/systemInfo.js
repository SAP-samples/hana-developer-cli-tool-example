const base = require("../utils/base")

exports.command = 'systemInfo'
exports.aliases = ['sys', 'sysinfo', 'sysInfo', 'systeminfo']
exports.describe = base.bundle.getText("systemInfo")
exports.builder = base.getBuilder({})
exports.handler = (argv) => {
  base.promptHandler(argv, sysInfo, {})
}

async function sysInfo(prompts) {
  try {
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const dbStatus = new dbClass(await conn.createConnection(prompts))
    const dbInspect = require("../utils/dbInspect")
    console.table(await dbInspect.getHANAVersion(dbStatus))

    let results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "M_SYSTEM_OVERVIEW"`)
    console.table(results)

    results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "M_SERVICES"`)
    console.table(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}