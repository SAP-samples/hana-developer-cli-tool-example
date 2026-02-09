// @ts-check
import * as base from '../utils/base.js'

export const command = 'dataTypes'
export const aliases = ['dt', 'datatypes', 'dataType', 'datatype']
export const describe = base.bundle.getText("dataTypes")

export const builder = base.getBuilder({})
export function handler (argv) {
  base.promptHandler(argv, dbStatus, {})
}

export async function dbStatus(prompts) {
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
