const base = require("../utils/base")

exports.command = 'featureUsage'
exports.aliases = ['fu', 'FeaturesUsage']
exports.describe = base.bundle.getText("featureUsage")
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
      `SELECT COMPONENT_NAME, FEATURE_NAME, IS_DEPRECATED, OBJECT_COUNT, CALL_COUNT, LAST_TIMESTAMP, LAST_USER_NAME, LAST_APPLICATION_NAME FROM M_FEATURE_USAGE
      ORDER BY COMPONENT_NAME, FEATURE_NAME`)
    base.outputTable(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}