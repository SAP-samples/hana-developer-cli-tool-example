// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'featureUsage'
export const aliases = ['fu', 'FeaturesUsage']
export const describe = baseLite.bundle.getText("featureUsage")
export const builder = (yargs) => yargs.options(baseLite.getBuilder({})).wrap(160).example('hana-cli featureUsage', baseLite.bundle.getText("featureUsageExample")).wrap(160).epilog(buildDocEpilogue('featureUsage', 'system-tools', ['featureUsageUI', 'features']))
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
      `SELECT COMPONENT_NAME, FEATURE_NAME, IS_DEPRECATED, OBJECT_COUNT, CALL_COUNT, LAST_TIMESTAMP, LAST_USER_NAME, LAST_APPLICATION_NAME FROM M_FEATURE_USAGE
      ORDER BY COMPONENT_NAME, FEATURE_NAME`)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}
