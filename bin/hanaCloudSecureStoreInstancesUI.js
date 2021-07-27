const base = require("../utils/base")
const securestore = require("./hanaCloudSecureStoreInstances")

exports.command = 'securestoreUI'
exports.aliases = ['secureStoreInstancesUI', 'secureStoreUI', 'securestoreinstancesui', 'secureStoreServicesUI', 'listSecureStoreUI', 'securestoreservicesui', 'securestoresui']
exports.describe = securestore.describe
exports.builder = securestore.builder 

exports.handler = (argv) => {
    base.promptHandler(argv, listInstances, securestore.inputPrompts)
  }

async function listInstances(prompts) {
    base.debug('getSecureStoreUI')
    try {
      base.setPrompts(prompts)
      await base.webServerSetup('/ui/#securestore-ui')
      return base.end()
    } catch (error) {
      base.error(error)
    }
}
