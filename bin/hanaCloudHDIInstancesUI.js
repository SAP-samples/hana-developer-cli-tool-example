const base = require("../utils/base")
const hanaCloudHDIInstances = require("./hanaCloudHDIInstances")

exports.command = 'hdiUI'
exports.aliases = ['hdiInstancesUI', 'hdiinstancesui', 'hdiServicesUI', 'listhdiui', 'hdiservicesui', 'hdisui']
exports.describe = hanaCloudHDIInstances.describe
exports.builder = hanaCloudHDIInstances.builder

exports.handler = (argv) => {
    base.promptHandler(argv, listInstances, hanaCloudHDIInstances.inputPrompts)
}


async function listInstances(prompts) {
    base.debug('listInstancesUI')
    try {
        base.setPrompts(prompts)
        await base.webServerSetup('/ui/#hdi-ui')
        return base.end()
    } catch (error) {
        base.error(error)
    }
}
