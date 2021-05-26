const base = require("../utils/base")

exports.command = 'reclaim'
exports.aliases = 're'
exports.describe = base.bundle.getText("reclaim")
exports.builder = base.getBuilder({})
exports.handler = (argv) => {
  base.promptHandler(argv, reclaim, {})
}

async function reclaim(prompts) {
  base.debug('reclaim')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    let results = await dbStatus.execSQL(`ALTER SYSTEM RECLAIM LOB SPACE;`)
    base.outputTable(results)

    results = await dbStatus.execSQL(`ALTER SYSTEM RECLAIM LOG;`)
    base.outputTable(results)

    results = await dbStatus.execSQL(`ALTER SYSTEM RECLAIM DATAVOLUME 105 DEFRAGMENT;`)
    base.outputTable(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}