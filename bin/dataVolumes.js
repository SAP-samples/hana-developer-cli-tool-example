// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'dataVolumes'
export const aliases = ['dv', 'datavolumes']
export const describe = baseLite.bundle.getText("dataVolumes")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({})).example('hana-cli dataVolumes', baseLite.bundle.getText("dataVolumesExample"))
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
      `SELECT * FROM SYS.M_DATA_VOLUMES`)
    base.outputTableFancy(results)

    results = await dbStatus.execSQL(
      `SELECT * FROM SYS.M_DATA_VOLUME_STATISTICS`)
    base.outputTableFancy(results)

    results = await dbStatus.execSQL(
      `SELECT * FROM SYS.M_DATA_VOLUME_PAGE_STATISTICS`)
    base.outputTableFancy(results)
    return base.end()
  } catch (error) {
    await base.error(error)
  }
}