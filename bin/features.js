const base = require("../utils/base")

exports.command = 'features'
exports.aliases = ['fe', 'Features']
exports.describe = base.bundle.getText("features")

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
      `SELECT * FROM M_FEATURES`)
    console.table(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}