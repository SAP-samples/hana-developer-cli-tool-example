// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'ports'
export const describe = baseLite.bundle.getText("ports")
export const builder = baseLite.getBuilder({})
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getPorts, {})
}
export async function getPorts(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getPorts')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()
    let results = await dbStatus.execSQL(
      `SELECT SERVICE_NAME, 
              PORT, 
              SQL_PORT
              FROM SYS.M_SERVICES`)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}
