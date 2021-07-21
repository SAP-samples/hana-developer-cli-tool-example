const base = require("../utils/base")

exports.command = 'readMeUI'
exports.aliases = ['readmeui', 'readMeUi', 'readmeUI']
exports.describe = base.bundle.getText("readMe")
exports.builder = base.getBuilder({}, false)
exports.handler = (argv) => {
  base.promptHandler(argv, readMe, {})
}
async function readMe(prompts){
  base.debug('readMeUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/docs/readme')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}
