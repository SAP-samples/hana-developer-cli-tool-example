// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'changesUI'
export const aliases = ['chgUI', 'chgui', 'changeLogUI', 'changelogui']
export const describe = baseLite.bundle.getText("changes")
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getChangeLog, {})
}

export async function getChangeLog(prompts) {
  const base = await import('../utils/base.js')
  base.debug('changeLogUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/docs/changelog')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    await base.error(error)
  }
}