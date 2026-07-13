// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as exportCmd from './export.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'

export const command = 'exportUI [table]'
export const aliases = ['expui', 'exportui', 'downloadUI', 'downloadui']
export const describe = baseLite.bundle.getText("export")

export const builder = (yargs) => yargs.options(baseLite.getUIBuilder({
  table: {
    alias: ['t'],
    type: 'string',
    desc: baseLite.bundle.getText("exportTable")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("exportSchema")
  }
})).wrap(160).example('hana-cli exportUI', baseLite.bundle.getText("export")).wrap(160).epilog(buildDocEpilogue('exportUI', 'data-tools', ['export', 'import']))

export const inputPrompts = {
  ...exportCmd.inputPrompts,
  // Override output and format: the web UI collects these, so don't block
  // startup by prompting interactively. importUI precedent: it spreads
  // import's required prompts unchanged (filename, table, matchMode stay
  // required) because those are meaningful pre-fills. For exportUI, output
  // (a file path) and format are exclusively UI concerns — prompting for
  // them before the server starts is confusing and provides no value.
  output: {
    description: baseLite.bundle.getText("exportOutput"),
    type: 'string',
    required: false,
    ask: () => { }
  },
  format: {
    description: baseLite.bundle.getText("exportFormat"),
    type: 'string',
    required: false,
    ask: () => { }
  },
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
  base.debug('exportUI startWebServer')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#/export')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    base.error(error)
  }
}
