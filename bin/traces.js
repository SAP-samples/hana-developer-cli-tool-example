// @ts-check
import * as base from '../utils/base.js'

export const command = 'traces'
export const aliases = ['tf', 'Traces']
export const describe = base.bundle.getText("traces")
export const builder = base.getBuilder({})
export function handler (argv) {
  base.promptHandler(argv, traces, {})
}

export async function traces(prompts) {
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
