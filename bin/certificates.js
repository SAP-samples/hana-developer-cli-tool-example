// @ts-check
import * as base from '../utils/base.js'

export const command = 'certificates'
export const aliases = ['cert', "certs"]
export const describe = base.bundle.getText("certificates")

export const builder = base.getBuilder({})

export function handler (argv) {
  base.promptHandler(argv, certs, {})
}

export async function certs(prompts) {
  base.debug('certs')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let results = await db.execSQL(`SELECT TOP 100 * FROM "CERTIFICATES"`)
    base.outputTableFancy(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}