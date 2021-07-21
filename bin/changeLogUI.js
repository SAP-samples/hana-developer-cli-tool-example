const base = require("../utils/base")

exports.command = 'changesUI'
exports.aliases = ['chgUI', 'chgui', 'changeLogUI', 'changelogui']
exports.describe = base.bundle.getText("changes")
exports.handler = (argv) => {
  base.promptHandler(argv, getChangeLog, {})
}

async function getChangeLog(prompts) {
  base.debug('changeLogUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/docs/changelog')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}