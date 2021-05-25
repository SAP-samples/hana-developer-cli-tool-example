const base = require("../utils/base")

exports.command = 'systemInfo'
exports.aliases = ['sys', 'sysinfo', 'sysInfo', 'systeminfo']
exports.describe = base.bundle.getText("systemInfo")
exports.builder = base.getBuilder({})
exports.handler = (argv) => {
  base.promptHandler(argv, sysInfo, {})
}

async function sysInfo(prompts) {
  base.debug('sysInfo')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    const dbInspect = require("../utils/dbInspect")
    base.outputTable(await dbInspect.getHANAVersion(dbStatus))

    let results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "M_SYSTEM_OVERVIEW"`)
    base.outputTable(results)

    results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "M_SERVICES"`)
    base.outputTable(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}