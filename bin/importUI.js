// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as importCmd from './import.js'

export const command = 'importUI [filename] [table]'
export const aliases = ['impui', 'importui', 'uploadui', 'uploadUI']
export const describe = baseLite.bundle.getText("importUI")

export const builder = importCmd.builder

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, startWebServer, importCmd.inputPrompts)
}

async function startWebServer(prompts) {
  const base = await import('../utils/base.js')
  base.debug('importUI startWebServer')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#import-ui')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    base.error(error)
  }
}
