const base = require("../utils/base")
const containers = require("./containers")

exports.command = 'containersUI [containerGroup] [container]'
exports.aliases = ['containersui', 'contUI', 'listContainersUI', 'listcontainersui']
exports.describe = containers.describe
exports.builder = containers.builder

exports.handler = (argv) => {
  base.promptHandler(argv, getContainers, containers.inputPrompts)
}

async function getContainers(prompts) {
  base.debug('getContainersUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#containers-ui')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}