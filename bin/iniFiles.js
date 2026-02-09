// @ts-check
import * as base from '../utils/base.js'

export const command = 'iniFiles'
export const aliases = ['if', 'inifiles', 'ini']
export const describe = base.bundle.getText("iniFiles")
export const builder = base.getBuilder({})
export function handler (argv) {
  base.promptHandler(argv, iniFiles, {})
}

export async function iniFiles(prompts) {
  base.debug('iniFiles')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    let results = await dbStatus.execSQL(
      `SELECT * FROM M_INIFILES`)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}