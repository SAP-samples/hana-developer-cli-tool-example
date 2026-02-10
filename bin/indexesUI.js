// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as indexes from './indexes.js'


export const command = 'indexesUI [schema] [indexes]'
export const aliases = ['indUI', 'listIndexesUI', 'ListIndUI', 'listindui', 'Listindui', "listfindexesui", "indexesui"]
export const describe = indexes.describe

export const builder = indexes.builder

export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getIndexes, indexes.inputPrompts)
}


export async function getIndexes(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getIndexesUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#indexes-ui')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    await base.error(error)
  }
}

