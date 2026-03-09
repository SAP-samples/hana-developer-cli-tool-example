// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'readMeUI'
export const aliases = ['readmeui', 'readMeUi', 'readmeUI']
export const describe = baseLite.bundle.getText("readMe")
export const builder = (yargs) => yargs.options(baseLite.getUIBuilder({}, false)).wrap(160).example(
  'hana-cli readMeUI',
  baseLite.bundle.getText("readMeUIExample")
).epilog(buildDocEpilogue('readMeUI', 'developer-tools', ['readMe', 'UI', 'openReadMe']))

export const inputPrompts = {
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
  base.promptHandler(argv, readMe, inputPrompts)
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
