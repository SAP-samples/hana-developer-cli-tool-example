// @ts-check
import * as base from '../utils/base.js'

export const command = 'changesUI'
export const aliases = ['chgUI', 'chgui', 'changeLogUI', 'changelogui']
export const describe = base.bundle.getText("changes")
export function handler (argv) {
  base.promptHandler(argv, getChangeLog, {})
}

export async function getChangeLog(prompts) {
  base.debug('changeLogUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/docs/changelog')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    await base.error(error)
  }
}