const base = require("../utils/base")

exports.command = 'traces'
exports.aliases = ['tf', 'Traces']
exports.describe = base.bundle.getText("traces")
exports.builder = base.getBuilder({})
exports.handler = (argv) => {
  base.promptHandler(argv, traces, {})
}

async function traces(prompts) {
  base.debug('traces')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    let results = await dbStatus.execSQL(
      `SELECT * FROM M_TRACEFILES`)
    base.outputTable(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}
module.exports.traces = traces