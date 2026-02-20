// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'reclaim'
export const aliases = 're'
export const describe = baseLite.bundle.getText("reclaim")
export const builder = (yargs) => yargs.options(baseLite.getBuilder({})).wrap(160).example('hana-cli reclaim', baseLite.bundle.getText('reclaimExample')).wrap(160).epilog(buildDocEpilogue('reclaim', 'performance-monitoring', ['fragmentationCheck', 'dataVolumes']))
export async function handler (argv)  {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, reclaim, {})
}

export async function reclaim(prompts) {
  const base = await import('../utils/base.js')
  base.debug('reclaim')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    let results = await dbStatus.execSQL(`ALTER SYSTEM RECLAIM LOB SPACE;`)
    base.outputTableFancy(results)

    results = await dbStatus.execSQL(`ALTER SYSTEM RECLAIM LOG;`)
    base.outputTableFancy(results)

    results = await dbStatus.execSQL(`ALTER SYSTEM RECLAIM DATAVOLUME 105 DEFRAGMENT;`)
    base.outputTableFancy(results)
    return base.end()
  } catch (error) {
    await base.error(error)
  }
}