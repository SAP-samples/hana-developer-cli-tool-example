// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'iniFiles'
export const aliases = ['if', 'inifiles', 'ini']
export const describe = baseLite.bundle.getText("iniFiles")
export const builder = baseLite.getBuilder({})
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, iniFiles, {})
}

export async function iniFiles(prompts) {
  const base = await import('../utils/base.js')
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