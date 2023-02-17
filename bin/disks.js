// @ts-check
import * as base from '../utils/base.js'

export const command = 'disks'
export const aliases = ['di', 'Disks']
export const describe = base.bundle.getText("disks")

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
      `SELECT * FROM M_DISKS`)
    base.outputTableFancy(results)

    results = await dbStatus.execSQL(
      `SELECT * FROM M_DISK_USAGE`)
    base.outputTableFancy(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}