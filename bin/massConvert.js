const base = require("../utils/base")
const massConvertLib = require("../utils/massConvert")

exports.command = 'massConvert [schema] [table]'
exports.aliases = ['mc', 'massconvert', 'massConv', 'massconv']
exports.describe = base.bundle.getText("massConvert")

exports.builder = base.getMassConvertBuilder(false)

exports.handler = (argv) => {
    base.promptHandler(argv, getTables, base.getMassConvertPrompts(false))
}

async function getTables(prompts) {
    base.debug('getTables')
    base.setPrompts(prompts)
    massConvertLib.convert()
    return base.end()
}

