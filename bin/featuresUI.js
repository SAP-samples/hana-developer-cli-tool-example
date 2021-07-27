const base = require("../utils/base")
const features = require("./dataTypes")

exports.command = 'featuresUI'
exports.aliases = ['feui', 'featuresui', 'FeaturesUI']
exports.describe = features.describe

exports.builder = features.builder
exports.handler = (argv) => {
  base.promptHandler(argv, dbStatus, {})
}

async function dbStatus(prompts) {
  base.debug('getFeaturesUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#features-ui')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}
