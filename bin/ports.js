// @ts-check
import * as base from '../utils/base.js'

export const command = 'ports'
export const describe = base.bundle.getText("ports")
export const builder = base.getBuilder({})
export function handler (argv) {
  base.promptHandler(argv, getPorts, {})
}
export async function getPorts(prompts) {
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
