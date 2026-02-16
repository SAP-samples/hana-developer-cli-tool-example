// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'features'
export const aliases = ['fe', 'Features']
export const describe = baseLite.bundle.getText("features")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({})).example('hana-cli features', baseLite.bundle.getText("featuresExample"))
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, dbStatus, {})
}

export async function dbStatus(prompts) {
  const base = await import('../utils/base.js')
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
    await base.error(error)
  }
}
