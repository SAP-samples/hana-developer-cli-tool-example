const base = require("../utils/base")

exports.command = 'systemInfoUI'
exports.aliases = ['sysUI', 'sysinfoui', 'sysInfoUI', 'systeminfoui']
exports.describe = base.bundle.getText("systemInfoUI")
exports.builder = base.getBuilder({})
exports.handler = (argv) => {
  base.promptHandler(argv, sysInfo, {})
}

async function sysInfo(prompts) {
  base.debug('sysInfoUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#systeminfo-ui')
    return base.end()
  } catch (error) {
    base.error(error)
  }

}