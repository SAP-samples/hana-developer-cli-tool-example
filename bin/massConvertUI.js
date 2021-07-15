const base = require("../utils/base")

exports.command = 'massConvertUI [schema] [table]'
exports.aliases = ['mcui', 'massconvertui', 'massConvUI', 'massconvui']
exports.describe = base.bundle.getText("massConvertUI")


exports.builder = base.getMassConvertBuilder(true)


exports.handler = (argv) => {
    base.promptHandler(argv, startWebServer, base.getMassConvertPrompts(true))
}

async function startWebServer(prompts) {
    base.debug('startWebServer')
    try {
        base.setPrompts(prompts)
        await base.webServerSetup('/ui/#massconvert-ui')
        return base.end()
    } catch (error) {
        base.error(error)
    }
}