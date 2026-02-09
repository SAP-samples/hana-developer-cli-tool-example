// @ts-check
import * as base from '../utils/base.js'
global.__xRef = []

export const command = 'massConvertUI [schema] [table]'
export const aliases = ['mcui', 'massconvertui', 'massConvUI', 'massconvui']
export const describe = base.bundle.getText("massConvertUI")


export const builder = base.getMassConvertBuilder(true)


export function handler (argv) {
    base.promptHandler(argv, startWebServer, base.getMassConvertPrompts(true))
}

async function startWebServer(prompts) {
    base.debug('startWebServer')
    try {
        base.setPrompts(prompts)
        await base.webServerSetup('/ui/#massconvert-ui')
        // Don't call base.end() - let the web server keep running
    } catch (error) {
        base.error(error)
    }
}