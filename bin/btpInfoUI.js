// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as btpInfo from './btpInfo.js'

export const command = 'btpInfoUI'
export const aliases = ['btpinfoUI', 'btpui', 'btpInfoui']
export const describe = btpInfo.describe

export const builder = btpInfo.builder

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getBTPInfoUI, {})
}

export async function getBTPInfoUI(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getBTPInfoUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#btpInfo-ui')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    await base.error(error)
  }
}
