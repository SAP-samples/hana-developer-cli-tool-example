// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as featureUsage from './featureUsage.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'

export const command = 'featureUsageUI'
export const aliases = ['fuui', 'featureusageui', 'FeaturesUsageUI', 'featuresusageui']
export const describe = featureUsage.describe
export const builder = (yargs) => yargs.options(baseLite.getUIBuilder({})).wrap(160).example('hana-cli featureUsageUI', baseLite.bundle.getText("featureUsageExample")).wrap(160).epilog(buildDocEpilogue('featureUsageUI', 'database-admin', ['featureUsage']))

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
  base.debug('getFeatureUsageUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#featureUsage-ui')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    await base.error(error)
  }
}
