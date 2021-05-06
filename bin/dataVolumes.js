const base = require("../utils/base")

exports.command = 'dataVolumes'
exports.aliases = ['dv', 'datavolumes']
exports.describe = base.bundle.getText("dataVolumes")

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
      `SELECT * FROM M_DATA_VOLUMES`)
    base.outputTable(results)

    results = await dbStatus.execSQL(
      `SELECT * FROM M_DATA_VOLUME_STATISTICS`)
    base.outputTable(results)

    results = await dbStatus.execSQL(
      `SELECT * FROM M_DATA_VOLUME_PAGE_STATISTICS`)
    base.outputTable(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}