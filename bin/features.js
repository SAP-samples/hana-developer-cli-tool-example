// @ts-check
import * as base from '../utils/base.js'

export const command = 'features'
export const aliases = ['fe', 'Features']
export const describe = base.bundle.getText("features")

export const builder = base.getBuilder({})
export function handler (argv) {
  base.promptHandler(argv, dbStatus, {})
}

export async function dbStatus(prompts) {
  base.debug('dbStatus')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    let results = await dbStatus.execSQL(
      `SELECT * FROM M_FEATURES`)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}
