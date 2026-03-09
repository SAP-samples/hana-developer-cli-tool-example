// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'inspectJWT'
export const aliases = ['jwt', 'ijwt', 'iJWT', 'iJwt']
export const describe = baseLite.bundle.getText("inspectJWT")
export const builder = (yargs) => yargs.options(baseLite.getBuilder({})).wrap(160).example('hana-cli inspectJWT', baseLite.bundle.getText("inspectJWTExample")).wrap(160).epilog(buildDocEpilogue('inspectJWT', 'object-inspection', ['createJWT']))
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, inspectJWT, {})
}

export async function inspectJWT(prompts) {
  const base = await import('../utils/base.js')
  base.debug('inspectJWT')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    let results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "PSES" WHERE PURPOSE = 'JWT'`)
    base.outputTableFancy(results)

    results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "CERTIFICATES"`)
    base.outputTableFancy(results)

    results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "PSE_CERTIFICATES"`)
    base.outputTableFancy(results)

    results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "JWT_PROVIDERS"`)
    base.outputTableFancy(results)

    return base.end()
  } catch (error) {
    await base.error(error)
  }
}