const base = require("../utils/base")

exports.command = 'dataTypes'
exports.aliases = ['dt', 'datatypes', 'dataType', 'datatype']
exports.describe = base.bundle.getText("dataTypes")

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
    let results = await dbStatus.execSQL(`SELECT TYPE_NAME, COLUMN_SIZE, CREATE_PARAMS FROM DATA_TYPES `)
    base.outputTable(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}