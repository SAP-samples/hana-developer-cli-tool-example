// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'readMeUI'
export const aliases = ['readmeui', 'readMeUi', 'readmeUI']
export const describe = baseLite.bundle.getText("readMe")
export const builder = baseLite.getBuilder({}, false)
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, readMe, {})
}

export async function readMe(prompts){
  const base = await import('../utils/base.js')
  base.debug('readMeUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/docs/readme')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    await base.error(error)
  }
}
