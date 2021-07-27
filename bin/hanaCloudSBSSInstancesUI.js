const base = require("../utils/base")
const sbss = require("./hanaCloudSBSSInstances")

exports.command = 'sbssUI'
exports.aliases = ['sbssInstancesUI', 'sbssinstancesui', 'sbssServicesUI', 'listsbssui', 'sbssservicesui', 'sbsssui']
exports.describe = sbss.describe
exports.builder = sbss.builder

exports.handler = (argv) => {
    base.promptHandler(argv, listInstances, sbss.inputPrompts)
}

async function listInstances(prompts) {
    base.debug('getSbssUI')
    try {
        base.setPrompts(prompts)
        await base.webServerSetup('/ui/#sbss-ui')
        return base.end()
    } catch (error) {
        base.error(error)
    }
}
