const base = require("../utils/base")

exports.command = 'inspectJWT'
exports.aliases = ['jwt', 'ijwt', 'iJWT', 'iJwt']
exports.describe = base.bundle.getText("inspectJWT")
exports.builder = base.getBuilder({})
exports.handler = (argv) => {
  base.promptHandler(argv, inspectJWT, {})
}

async function inspectJWT(prompts) {
  base.debug('inspectJWT')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    let results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "PSES" WHERE PURPOSE = 'JWT'`)
    base.outputTable(results)

    results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "CERTIFICATES"`)
    base.outputTable(results)

    results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "PSE_CERTIFICATES"`)
    base.outputTable(results)

    results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "JWT_PROVIDERS"`)
    base.outputTable(results)

    return base.end()
  } catch (error) {
    base.error(error)
  }
}