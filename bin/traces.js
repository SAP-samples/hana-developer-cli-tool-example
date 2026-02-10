// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'traces'
export const aliases = ['tf', 'Traces']
export const describe = baseLite.bundle.getText("traces")
export const builder = baseLite.getBuilder({})
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, traces, {})
}

export async function traces(prompts) {
  const base = await import('../utils/base.js')
  base.debug('traces')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    let results = await dbStatus.execSQL(
      `SELECT * FROM M_TRACEFILES`)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}
