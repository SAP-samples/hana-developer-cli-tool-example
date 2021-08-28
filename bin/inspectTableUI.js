// @ts-check
import * as base from '../utils/base.js'
import * as inspectTable from './inspectTable.js'

export const command = 'inspectTableUI [schema] [table]'
export const aliases = ['itui', 'tableUI', 'tableui', 'insTblUI', 'inspecttableui', 'inspectableui']
export const describe = inspectTable.describe
export const builder = inspectTable.builder
export function handler (argv) {
  base.promptHandler(argv, tableInspect, inspectTable.inputPrompts)
}

export async function tableInspect(prompts) {
  base.debug('inspectTableUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#inspectTable-ui')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}
