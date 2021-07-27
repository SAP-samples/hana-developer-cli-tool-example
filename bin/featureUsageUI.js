const base = require("../utils/base")
const featureUsage = require("./featureUsage")

exports.command = 'featureUsageUI'
exports.aliases = ['fuui', 'featureusageui', 'FeaturesUsageUI', 'featuresusageui']
exports.describe = featureUsage.describe
exports.builder = featureUsage.builder

exports.handler = (argv) => {
  base.promptHandler(argv, dbStatus, {})
}
async function dbStatus(prompts) {
  base.debug('getFeatureUsageUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#featureUsage-ui')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}
