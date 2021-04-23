const base = require("../utils/base")

exports.command = 'inspectJWT'
exports.aliases = ['jwt', 'ijwt', 'iJWT', 'iJwt']
exports.describe = base.bundle.getText("inspectJWT")
exports.builder = base.getBuilder({})
exports.handler = (argv) => {
  base.promptHandler(argv, inspectJWT, {})
}

async function inspectJWT(prompts) {

  try {
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const dbStatus = new dbClass(await conn.createConnection(prompts))

    let results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "PSES" WHERE PURPOSE = 'JWT'`)
    console.table(results)

    results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "CERTIFICATES"`)
    console.table(results)

    results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "PSE_CERTIFICATES"`)
    console.table(results)

    results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "JWT_PROVIDERS"`)
    console.table(results)

    return base.end()
  } catch (error) {
    base.error(error)
  }
}