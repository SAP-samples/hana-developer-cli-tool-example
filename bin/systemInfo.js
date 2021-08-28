// @ts-check
import * as base from '../utils/base.js'
import * as dbInspect from '../utils/dbInspect.js'

export const command = 'systemInfo'
export const aliases = ['sys', 'sysinfo', 'sysInfo', 'systeminfo']
export const describe = base.bundle.getText("systemInfo")
export const builder = base.getBuilder({})
export function handler (argv) {
  base.promptHandler(argv, sysInfo, {})
}

export async function sysInfo(prompts) {
  base.debug('sysInfo')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    base.outputTable(await dbInspect.getHANAVersion(dbStatus))

    let results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "M_SYSTEM_OVERVIEW"`)
    base.outputTable(results)

    results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "M_SERVICES"`)
    base.outputTable(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}