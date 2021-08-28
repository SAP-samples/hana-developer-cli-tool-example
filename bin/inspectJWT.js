// @ts-check
import * as base from '../utils/base.js'

export const command = 'inspectJWT'
export const aliases = ['jwt', 'ijwt', 'iJWT', 'iJwt']
export const describe = base.bundle.getText("inspectJWT")
export const builder = base.getBuilder({})
export function handler (argv) {
  base.promptHandler(argv, inspectJWT, {})
}

export async function inspectJWT(prompts) {
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