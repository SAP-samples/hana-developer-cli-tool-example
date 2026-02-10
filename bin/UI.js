// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'UI'
export const aliases = ['ui', 'gui', 'GUI', 'launchpad', 'LaunchPad', 'launchPad']
export const describe = baseLite.bundle.getText("UI")
export const builder = baseLite.getBuilder({}, false)
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, UI, {})
}
export async function UI(prompts){
  const base = await import('../utils/base.js')
  base.debug('UI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#Shell-home')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    await base.error(error)
  }
}
