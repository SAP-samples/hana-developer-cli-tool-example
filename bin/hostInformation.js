// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'hostInformation'
export const aliases = ['hi', 'HostInformation', 'hostInfo', 'hostinfo']
export const describe = baseLite.bundle.getText("hostInformation")
export const builder = baseLite.getBuilder({})
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, hostInfo, {})
}

export async function hostInfo(prompts) {
  const base = await import('../utils/base.js')
  base.debug('hostInfo')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    let results = await dbStatus.execSQL(
      `SELECT * FROM M_HOST_INFORMATION
      ORDER BY HOST, KEY`)
    base.outputTableFancy(results)

    results = await dbStatus.execSQL(
      `SELECT * FROM M_HOST_RESOURCE_UTILIZATION
      ORDER BY HOST`)
    base.outputTableFancy(results)
    return base.end()
  } catch (error) {
    await base.error(error)
  }
}