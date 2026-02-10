// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as features from './dataTypes.js'

export const command = 'featuresUI'
export const aliases = ['feui', 'featuresui', 'FeaturesUI']
export const describe = features.describe

export const builder = features.builder
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, dbStatus, {})
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
