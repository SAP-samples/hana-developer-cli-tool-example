// @ts-check
import * as base from '../utils/base.js'

export const command = 'readMeUI'
export const aliases = ['readmeui', 'readMeUi', 'readmeUI']
export const describe = base.bundle.getText("readMe")
export const builder = base.getBuilder({}, false)
export function handler (argv) {
  base.promptHandler(argv, readMe, {})
}

export async function readMe(prompts){
  base.debug('readMeUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/docs/readme')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    await base.error(error)
  }
}
