// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'features'
export const aliases = ['fe', 'Features']
export const describe = baseLite.bundle.getText("features")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({})).wrap(160).example('hana-cli features', baseLite.bundle.getText("featuresExample")).wrap(160).epilog(buildDocEpilogue('features', 'system-tools', ['featuresUI', 'systemInfo']))
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
