// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'disks'
export const aliases = ['di', 'Disks']
export const describe = baseLite.bundle.getText("disks")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({})).wrap(160).example('hana-cli disks', baseLite.bundle.getText("disksExample")).wrap(160).epilog(buildDocEpilogue('disks', 'system-tools', ['hostInformation', 'dataVolumes', 'ports']))
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
      `SELECT * FROM SYS.M_DISKS`)
    base.outputTableFancy(results)

    results = await dbStatus.execSQL(
      `SELECT * FROM SYS.M_DISK_USAGE`)
    base.outputTableFancy(results)
    return base.end()
  } catch (error) {
    await base.error(error)
  }
}