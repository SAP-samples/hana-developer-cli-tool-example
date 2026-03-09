// @ts-check
import * as baseLite from '../utils/base-lite.js'
import { getMassConvertBuilder } from '../utils/base.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'
global.__xRef = []

export const command = 'massConvertUI [schema] [table]'
export const aliases = ['mcui', 'massconvertui', 'massConvUI', 'massconvui']
export const describe = baseLite.bundle.getText("massConvertUI")


export const builder = (yargs) => yargs.options(getMassConvertBuilder(true)).wrap(160)
  .example('hana-cli massConvertUI --schema MYSCHEMA', baseLite.bundle.getText("massConvertUI"))
  .epilog(buildDocEpilogue('massConvertUI', 'mass-operations', ['massConvert']))


export async function handler (argv) {
  const base = await import('../utils/base.js')
    base.promptHandler(argv, startWebServer, base.getMassConvertPrompts(true))
}

async function startWebServer(prompts) {
  const base = await import('../utils/base.js')
    base.debug('startWebServer')
    try {
        base.setPrompts(prompts)
        await base.webServerSetup('/ui/#massconvert-ui')
        // Don't call base.end() - let the web server keep running
    } catch (error) {
        base.error(error)
    }
}