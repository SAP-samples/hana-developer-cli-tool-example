const base = require("../utils/base")

exports.command = 'traces'
exports.aliases = ['tf', 'Traces']
exports.describe = base.bundle.getText("traces")
exports.builder = base.getBuilder({})
exports.handler = (argv) => {
  base.promptHandler(argv, traces, {})
}

async function traces(prompts) {
  try {
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const dbStatus = new dbClass(await conn.createConnection(prompts))

    let results = await dbStatus.execSQL(
      `SELECT * FROM M_TRACEFILES`)
    console.table(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}