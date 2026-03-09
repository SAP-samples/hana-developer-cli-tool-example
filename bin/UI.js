// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'UI'
export const aliases = ['ui', 'gui', 'GUI', 'launchpad', 'LaunchPad', 'launchPad', 'server']
export const describe = baseLite.bundle.getText("UI")
export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  port: {
    alias: ['p'],
    type: 'number',
    default: 3010,
    desc: 'Server port (default: 3010)'
  },
  host: {
    type: 'string',
    default: 'localhost',
    desc: 'Server host (default: localhost)'
  }
}, false)).wrap(160).example('hana-cli UI', baseLite.bundle.getText("UI")).wrap(160).epilog(buildDocEpilogue('UI', 'developer-tools', ['readMeUI', 'helpDocu'])).example('hana-cli server --port 8080', 'Start server on port 8080').example('hana-cli server --host 0.0.0.0 --port 8080', 'Start server on all interfaces')

export let inputPrompts = {
  port: {
    description: 'Server port (default: 3010)',
    type: 'number',
    required: false,
    ask: () => { }
  },
  host: {
    description: 'Server host (default: localhost)',
    type: 'string',
    required: false,
    ask: () => { }
  }
}

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, UI, inputPrompts, false)
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
