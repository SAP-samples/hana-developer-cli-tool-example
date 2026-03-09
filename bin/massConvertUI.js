// @ts-check
import * as baseLite from '../utils/base-lite.js'
import { getMassConvertBuilder } from '../utils/base.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'
global.__xRef = []

export const command = 'massConvertUI [schema] [table]'
export const aliases = ['mcui', 'massconvertui', 'massConvUI', 'massconvui']
export const describe = baseLite.bundle.getText("massConvertUI")


export const builder = (yargs) => {
  const baseBuilder = getMassConvertBuilder(true)
  return yargs.options(baseBuilder)
    .wrap(160)
    .example('hana-cli massConvertUI --schema MYSCHEMA --table MYTABLE', baseLite.bundle.getText("massConvertUIExample"))
    .wrap(160)
    .epilog(buildDocEpilogue('massConvertUI', 'data-tools', ['massConvert', 'convertToHdbTable']))
}

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