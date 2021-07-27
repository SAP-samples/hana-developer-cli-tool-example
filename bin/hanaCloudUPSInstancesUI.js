const base = require("../utils/base")
const ups = require("./hanaCloudUPSInstances")

exports.command = 'upsUI'
exports.aliases = ['upsInstancesUI', 'upsinstancesui', 'upServicesUI', 'listupsui', 'upsservicesui']
exports.describe = ups.describe

exports.builder = ups.builder
exports.handler = (argv) => {
    base.promptHandler(argv, listInstances, ups.inputPrompts)
  }



async function listInstances(prompts) {
    base.debug('getUpsUI')
    try {
      base.setPrompts(prompts)
      await base.webServerSetup('/ui/#ups-ui')
      return base.end()
    } catch (error) {
      base.error(error)
    }
}
