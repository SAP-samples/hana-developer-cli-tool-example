// @ts-check
import * as base from '../utils/base.js'
import * as featureUsage from './featureUsage.js'

export const command = 'featureUsageUI'
export const aliases = ['fuui', 'featureusageui', 'FeaturesUsageUI', 'featuresusageui']
export const describe = featureUsage.describe
export const builder = featureUsage.builder

export function handler (argv) {
  base.promptHandler(argv, dbStatus, {})
}
export async function dbStatus(prompts) {
  base.debug('getFeatureUsageUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#featureUsage-ui')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}
