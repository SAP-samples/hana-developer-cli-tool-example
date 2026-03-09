// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as containers from './containers.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'

export const command = 'containersUI [containerGroup] [container]'
export const aliases = ['containersui', 'contUI', 'listContainersUI', 'listcontainersui']
export const describe = containers.describe

export const builder = (yargs) => yargs.options(baseLite.getUIBuilder({
  container: {
    alias: ['c'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("container")
  },
  containerGroup: {
    alias: ['g', 'group', 'containergroup'],
    type: 'string',
    default: '*',
    desc: baseLite.bundle.getText("containerGroup")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: baseLite.bundle.getText("limit")
  }
})).wrap(160).example('hana-cli containersUI', baseLite.bundle.getText("containersUIExample")).wrap(160).epilog(buildDocEpilogue('containersUI', 'hdi-management', ['containers', 'createContainer', 'dropContainer']))

export const inputPrompts = {
  container: {
    description: baseLite.bundle.getText("container"),
    type: 'string',
    required: true
  },
  containerGroup: {
    description: baseLite.bundle.getText("containerGroup"),
    type: 'string',
    required: true
  },
  limit: {
    description: baseLite.bundle.getText("limit"),
    type: 'number',
    required: true
  },
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
  base.promptHandler(argv, getContainers, inputPrompts)
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