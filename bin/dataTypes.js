// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'dataTypes'
export const aliases = ['dt', 'datatypes', 'dataType', 'datatype']
export const describe = baseLite.bundle.getText("dataTypes")

export const builder = baseLite.getBuilder({})
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, dbStatus, {})
}

export async function dbStatus(prompts) {
  const base = await import('../utils/base.js')
  base.debug('dbStatus')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()
    
    let results = await dbStatus.execSQL(`SELECT TYPE_NAME, COLUMN_SIZE, CREATE_PARAMS FROM DATA_TYPES `)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}
