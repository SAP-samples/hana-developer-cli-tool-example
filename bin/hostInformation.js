// @ts-check
import * as base from '../utils/base.js'

export const command = 'hostInformation'
export const aliases = ['hi', 'HostInformation', 'hostInfo', 'hostinfo']
export const describe = base.bundle.getText("hostInformation")
export const builder = base.getBuilder({})
export function handler (argv) {
  base.promptHandler(argv, hostInfo, {})
}

export async function hostInfo(prompts) {
  base.debug('hostInfo')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    let results = await dbStatus.execSQL(
      `SELECT * FROM M_HOST_INFORMATION
      ORDER BY HOST, KEY`)
    base.outputTable(results)

    results = await dbStatus.execSQL(
      `SELECT * FROM M_HOST_RESOURCE_UTILIZATION
      ORDER BY HOST`)
    base.outputTable(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}