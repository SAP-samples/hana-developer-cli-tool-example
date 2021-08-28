// @ts-check
import * as base from '../utils/base.js'
import * as features from './dataTypes.js'

export const command = 'featuresUI'
export const aliases = ['feui', 'featuresui', 'FeaturesUI']
export const describe = features.describe

export const builder = features.builder
export function handler (argv) {
  base.promptHandler(argv, dbStatus, {})
}

export async function dbStatus(prompts) {
  base.debug('getFeaturesUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#features-ui')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}
