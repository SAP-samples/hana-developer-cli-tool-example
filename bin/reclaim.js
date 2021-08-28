// @ts-check
import * as base from '../utils/base.js'

export const command = 'reclaim'
export const aliases = 're'
export const describe = base.bundle.getText("reclaim")
export const builder = base.getBuilder({})
export function handler (argv)  {
  base.promptHandler(argv, reclaim, {})
}

export async function reclaim(prompts) {
  base.debug('reclaim')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    let results = await dbStatus.execSQL(`ALTER SYSTEM RECLAIM LOB SPACE;`)
    base.outputTable(results)

    results = await dbStatus.execSQL(`ALTER SYSTEM RECLAIM LOG;`)
    base.outputTable(results)

    results = await dbStatus.execSQL(`ALTER SYSTEM RECLAIM DATAVOLUME 105 DEFRAGMENT;`)
    base.outputTable(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}