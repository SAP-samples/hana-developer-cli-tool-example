const base = require("../utils/base")

exports.command = 'dataTypes'
exports.aliases = ['dt', 'datatypes', 'dataType', 'datatype']
exports.describe = base.bundle.getText("dataTypes")

exports.builder = base.getBuilder({})
exports.handler = (argv) => {
  base.promptHandler(argv, dbStatus, {})
}

async function dbStatus(prompts) {
  base.debug('dbStatus')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()
    
    let results = await dbStatus.execSQL(`SELECT TYPE_NAME, COLUMN_SIZE, CREATE_PARAMS FROM DATA_TYPES `)
    base.outputTable(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}
module.exports.dbStatus = dbStatus