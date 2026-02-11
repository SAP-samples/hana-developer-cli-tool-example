// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'certificates'
export const aliases = ['cert', "certs"]
export const describe = baseLite.bundle.getText("certificates")

export const builder = baseLite.getBuilder({})

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, certs, {})
}

export async function certs(prompts) {
  const base = await import('../utils/base.js')
  base.debug('certs')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let results = await db.execSQL(`SELECT TOP 100 * FROM "CERTIFICATES"`)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}