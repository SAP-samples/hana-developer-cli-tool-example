// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as features from './dataTypes.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'

export const command = 'featuresUI'
export const aliases = ['feui', 'featuresui', 'FeaturesUI']
export const describe = features.describe

export const builder = (yargs) => yargs.options(baseLite.getUIBuilder({})).wrap(160).example('hana-cli featuresUI', baseLite.bundle.getText("dataTypesExample")).wrap(160).epilog(buildDocEpilogue('featuresUI', 'database-admin', ['dataTypes', 'dataTypesUI']))

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
  base.promptHandler(argv, dbStatus, inputPrompts)
}

export async function dbStatus(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getFeaturesUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#features-ui')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    await base.error(error)
  }
}
