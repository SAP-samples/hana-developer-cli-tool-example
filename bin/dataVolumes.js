// @ts-check
import * as base from '../utils/base.js'

export const command = 'dataVolumes'
export const aliases = ['dv', 'datavolumes']
export const describe = base.bundle.getText("dataVolumes")

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
      `SELECT * FROM M_DATA_VOLUMES`)
    base.outputTableFancy(results)

    results = await dbStatus.execSQL(
      `SELECT * FROM M_DATA_VOLUME_STATISTICS`)
    base.outputTableFancy(results)

    results = await dbStatus.execSQL(
      `SELECT * FROM M_DATA_VOLUME_PAGE_STATISTICS`)
    base.outputTableFancy(results)
    return base.end()
  } catch (error) {
    await base.error(error)
  }
}