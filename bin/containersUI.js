// @ts-check
import * as base from '../utils/base.js'
import * as containers from './containers.js'

export const command = 'containersUI [containerGroup] [container]'
export const aliases = ['containersui', 'contUI', 'listContainersUI', 'listcontainersui']
export const describe = containers.describe
export const builder = containers.builder

export function handler (argv) {
  base.promptHandler(argv, getContainers, containers.inputPrompts)
}

export async function getContainers(prompts) {
  base.debug('getContainersUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#containers-ui')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    base.error(error)
  }
}