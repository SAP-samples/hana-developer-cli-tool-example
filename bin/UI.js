const base = require("../utils/base")

exports.command = 'UI'
exports.aliases = ['ui', 'gui', 'GUI', 'launchpad', 'LaunchPad', 'launchPad']
exports.describe = base.bundle.getText("UI")
exports.builder = base.getBuilder({}, false)
exports.handler = (argv) => {
  base.promptHandler(argv, UI, {})
}
async function UI(prompts){
  base.debug('UI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#Shell-home')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}
