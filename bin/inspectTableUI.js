// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as inspectTable from './inspectTable.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'

export const command = 'inspectTableUI [schema] [table]'
export const aliases = ['itui', 'tableUI', 'tableui', 'insTblUI', 'inspecttableui', 'inspectableui']
export const describe = inspectTable.describe
export const builder = (yargs) => yargs.options(baseLite.getUIBuilder({
  table: {
    alias: ['t'],
    type: 'string',
    desc: baseLite.bundle.getText("table")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  output: {
    alias: ['o'],
    choices: ["tbl", "sql", "sqlite", "cds", "json", "yaml", "cdl", "annos", "edm", "edmx", "swgr", "openapi", "hdbtable", "hdbmigrationtable", "hdbcds", "jsdoc", "graphql", "postgres"],
    default: "tbl",
    type: 'string',
    desc: baseLite.bundle.getText("outputType")
  },
  useHanaTypes: {
    alias: ['hana'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("useHanaTypes")
  },
  useExists: {
    alias: ['exists', 'persistence'],
    desc: baseLite.bundle.getText("gui.useExists"),
    type: 'boolean',
    default: true
  },
  useQuoted: {
    alias: ['q', 'quoted'],
    desc: baseLite.bundle.getText("gui.useQuoted"),
    type: 'boolean',
    default: false
  },
  noColons: {
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("noColons")
  }
})).wrap(160).example('hana-cli inspectTableUI', baseLite.bundle.getText("inspectTableExample")).wrap(160).epilog(buildDocEpilogue('inspectTableUI', 'object-inspection', ['inspectTable', 'tables', 'inspectView']))

export const inputPrompts = {
  ...inspectTable.inputPrompts,
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
  base.promptHandler(argv, tableInspect, inputPrompts)
}

export async function tableInspect(prompts) {
  const base = await import('../utils/base.js')
  base.debug('inspectTableUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#inspectTable-ui')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    await base.error(error)
  }
}
