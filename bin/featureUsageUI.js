// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as featureUsage from './featureUsage.js'

export const command = 'featureUsageUI'
export const aliases = ['fuui', 'featureusageui', 'FeaturesUsageUI', 'featuresusageui']
export const describe = featureUsage.describe
export const builder = featureUsage.builder

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, dbStatus, {})
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
