// @ts-check
import * as base from '../utils/base.js'

export const command = 'UI'
export const aliases = ['ui', 'gui', 'GUI', 'launchpad', 'LaunchPad', 'launchPad']
export const describe = base.bundle.getText("UI")
export const builder = base.getBuilder({}, false)
export function handler (argv) {
  base.promptHandler(argv, UI, {})
}
export async function UI(prompts){
  base.debug('UI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#Shell-home')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}
