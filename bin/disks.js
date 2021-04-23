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
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const dbStatus = new dbClass(await conn.createConnection(prompts))

    let results = await dbStatus.execSQL(
      `SELECT * FROM M_DISKS`)
    console.table(results)

    results = await dbStatus.execSQL(
      `SELECT * FROM M_DISK_USAGE`)
    console.table(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}