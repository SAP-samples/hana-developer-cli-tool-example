const bundle = global.__bundle;

exports.command = 'changes';
exports.aliases = 'chg';
exports.describe = bundle.getText("changes");

exports.builder = {
}

exports.handler = function () {
  const fs = require('fs')
  const path = require('path')

  const marked = require('marked')
  const TerminalRenderer = require('marked-terminal')

  marked.setOptions({
    // Define custom renderer
    renderer: new TerminalRenderer({
      showSectionPrefix: false
    })
  })

  try {
    const data = fs.readFileSync(path.join(__dirname, '..', '/CHANGELOG.md'), 'utf8')
    console.log(marked(data))
  } catch (err) {
    console.error(err)
  }
}