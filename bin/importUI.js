// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as importCmd from './import.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'

export const command = 'importUI [filename] [table]'
export const aliases = ['impui', 'importui', 'uploadui', 'uploadUI']
export const describe = baseLite.bundle.getText("importUI")

export const builder = (yargs) => yargs.options(baseLite.getUIBuilder({
  filename: {
    alias: ['n'],
    type: 'string',
    desc: baseLite.bundle.getText("importFilename")
  },
  table: {
    alias: ['t'],
    type: 'string',
    desc: baseLite.bundle.getText("importTable")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("importSchema")
  }
})).wrap(160).example('hana-cli importUI', baseLite.bundle.getText("importUIExample")).wrap(160).epilog(buildDocEpilogue('importUI', 'data-tools', ['import', 'export']))

export const inputPrompts = {
  ...importCmd.inputPrompts,
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
  base.promptHandler(argv, startWebServer, inputPrompts)
}

async function startWebServer(prompts) {
  const base = await import('../utils/base.js')
  base.debug('importUI startWebServer')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#import-ui')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    base.error(error)
  }
}
