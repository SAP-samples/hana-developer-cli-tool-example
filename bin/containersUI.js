// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as containers from './containers.js'

export const command = 'containersUI [containerGroup] [container]'
export const aliases = ['containersui', 'contUI', 'listContainersUI', 'listcontainersui']
export const describe = containers.describe
export const builder = containers.builder

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getContainers, containers.inputPrompts)
}

export async function getContainers(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getContainersUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#containers-ui')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    await base.error(error)
  }
}