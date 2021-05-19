const base = require("../utils/base")

exports.command = 'disks'
exports.aliases = ['di', 'Disks']
exports.describe = base.bundle.getText("disks")

exports.builder = base.getBuilder({})
exports.handler = (argv) => {
  base.promptHandler(argv, dbStatus, {})
}

async function dbStatus(prompts) {
  try {
    base.setPrompts(prompts)
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const dbStatus = new dbClass(await conn.createConnection(prompts))

    let results = await dbStatus.execSQL(
      `SELECT * FROM M_DISKS`)
    base.outputTable(results)

    results = await dbStatus.execSQL(
      `SELECT * FROM M_DISK_USAGE`)
    base.outputTable(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}