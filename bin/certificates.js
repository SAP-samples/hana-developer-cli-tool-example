const base = require("../utils/base")

exports.command = 'certificates'
exports.aliases = ['cert', "certs"]
exports.describe = base.bundle.getText("certificates")

exports.builder = base.getBuilder({})

exports.handler = (argv) => {
  base.promptHandler(argv, certs, {})
}

async function certs(prompts) {
  base.debug('certs')
  try {
    base.setPrompts(prompts)
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(prompts))

    let results = await db.execSQL(`SELECT TOP 100 * FROM "CERTIFICATES"`)
    base.outputTable(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}